package com.dtwin.backend.service;

import com.dtwin.backend.constants.AQIConstants;
import com.dtwin.backend.dto.BuildingDTO;
import com.dtwin.backend.dto.BuildingImpact;
import com.dtwin.backend.entity.Sector;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.ArrayList;

@Component
public class BuildingImpactCalculator {

    public List<Sector> calculateBuildingAQIImpact(BuildingDTO building, List<Sector> sectors) {
        if (!"Market/Shopping Area".equals(building.getType())) {
            return sectors;
        }

        // Calculate building volume and base impact
        double buildingVolume = building.getWidth() * building.getWidth() * building.getHeight();
        double sizeImpactMultiplier = Math.max(1,
                Math.log(buildingVolume - AQIConstants.MIN_BUILDING_SIZE + 1) * AQIConstants.SIZE_IMPACT_FACTOR);
        double baseImpact = AQIConstants.MARKET_BASE_IMPACT * sizeImpactMultiplier;

        // Calculate impact radius
        double impactRadius = Math.min(Math.sqrt(buildingVolume) * 2, AQIConstants.MAX_IMPACT_RADIUS);

        return sectors.stream()
                .map(sector -> calculateSectorImpact(sector, building, baseImpact, impactRadius))
                .toList();
    }

    private Sector calculateSectorImpact(Sector sector, BuildingDTO building, double baseImpact, double impactRadius) {
        double distance = calculateDistance(building.getLocation(), sector.getCoordinates());

        if (distance <= impactRadius) {
            // Calculate impact using logarithmic decay
            double impactFactor = Math.max(0,
                    Math.log((impactRadius - distance) + 1) / Math.log(impactRadius + 1));
            double impact = Math.round(baseImpact * impactFactor);

            // Limit individual building impact
            double limitedImpact = Math.min(impact, AQIConstants.MAX_BUILDING_AQI_IMPACT);

            // Update building impacts
            List<BuildingImpact> existingImpacts = sector.getImpactedBy();
            if (existingImpacts == null) {
                existingImpacts = new ArrayList<>();
            }

            // Remove previous impact from same building if exists
            existingImpacts.removeIf(imp -> imp.getBuildingId().equals(building.getId()));

            // Add new impact
            BuildingImpact newImpact = new BuildingImpact();
            newImpact.setBuildingId(building.getId());
            newImpact.setImpact(limitedImpact);
            existingImpacts.add(newImpact);

            // Calculate total AQI with all building impacts
            double baseAQI = sector.getOriginalAqi() != null ?
                    sector.getOriginalAqi() : sector.getCurrentAqi();
            double totalImpact = existingImpacts.stream()
                    .mapToDouble(BuildingImpact::getImpact)
                    .sum();

            // Cap the total impact
            double cappedImpact = Math.min(totalImpact, AQIConstants.MAX_AQI_IMPACT);

            // Update sector
            sector.setOriginalAqi(sector.getOriginalAqi() != null ?
                    sector.getOriginalAqi() : sector.getCurrentAqi());
            sector.setCurrentAqi((double) Math.round(baseAQI + cappedImpact));
            sector.setImpactedBy(existingImpacts);
        }

        return sector;
    }

    private double calculateDistance(List<Double> point1, List<Double> point2) {
        double o1 = Math.toRadians(point1.get(1));
        double o2 = Math.toRadians(point2.get(1));
        double ao = Math.toRadians(point2.get(1) - point1.get(1));
        double aa = Math.toRadians(point2.get(0) - point1.get(0));

        double a = Math.sin(ao / 2) * Math.sin(ao / 2) +
                Math.cos(o1) * Math.cos(o2) *
                        Math.sin(aa / 2) * Math.sin(aa / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return AQIConstants.EARTH_RADIUS * c; // Distance in meters
    }
}