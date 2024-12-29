package com.dtwin.backend.service;

import com.dtwin.backend.entity.Building;
import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.entity.SubSector;
import com.dtwin.backend.repository.BuildingRepository;
import com.dtwin.backend.repository.SectorRepository;
import com.dtwin.backend.repository.SubSectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class BuildingService {

    @Autowired
    private BuildingRepository buildingRepository;
    @Autowired
    private SectorRepository sectorRepository;
    @Autowired
    private SubSectorRepository subSectorRepository;


    public Building addBuilding(Building building) {
        Building savedBuilding = buildingRepository.save(building);

        List<Sector> sectors = sectorRepository.findAll();
        for (Sector sector : sectors) {
            if (isWithinRadius(building.getLocation(), sector.getCenterCoordinates(), 1000)) {
                updateSubSectors(sector, building);
                sectorRepository.save(sector);
                break;
            }
        }

        return savedBuilding;
    }

    private boolean isWithinRadius(List<Double> point1, List<Double> point2, double radius) {
        if (point1 == null || point2 == null || point1.size() < 2 || point2.size() < 2) {
            return false;
        }

        double lat1 = point1.get(0);
        double lon1 = point1.get(1);
        double lat2 = point2.get(0);
        double lon2 = point2.get(1);

        final int R = 6371; // Earth's radius in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c * 1000; // Convert to meters

        return distance <= radius;
    }

    private void updateSubSectors(Sector sector, Building building) {
        for (SubSector subSector : sector.getGridSectors()) {
            if (isWithinRadius(building.getLocation(), subSector.getCenterCoordinates(), 250)) {
                int currentAQI = subSector.getOriginalAQI() != null ? subSector.getOriginalAQI() : 0;
                int aqiImpact = getAQIImpactByBuildingType(building.getType());
                int newAQI = Math.max(0, Math.min(500, currentAQI + aqiImpact));

                subSector.setCurrentAQI(newAQI);
                subSectorRepository.save(subSector);
            }
        }
    }

    private int getAQIImpactByBuildingType(String buildingType) {
        return switch (buildingType) {
            case "Residential Building" -> 5;
            case "Market/Shopping Area" -> 10;
            case "Office Building" -> 8;
            case "Factory/Warehouse" -> 20;
            case "Power Plant" -> 25;
            case "Transport Hub" -> 15;
            case "Educational Institution" -> 3;
            case "Government Office" -> 5;
            case "Park" -> -10; // Negative impact reduces AQI
            case "Cinema/Entertainment" -> 5;
            case "Gym/Sports Arena" -> 3;
            case "Healthcare Facility" -> 2;
            default -> 0;
        };
    }

    // Get all buildings
    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    // Get a building by ID
    public Building getBuildingById(Long id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));
    }

    // Update a building
    public Building updateBuilding(Long id, Building buildingDetails) {
        Building existingBuilding = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));

        existingBuilding.setCoordinates(buildingDetails.getCoordinates());
        existingBuilding.setWidth(buildingDetails.getWidth());
        existingBuilding.setHeight(buildingDetails.getHeight());
        existingBuilding.setColor(buildingDetails.getColor());
        existingBuilding.setRotation(buildingDetails.getRotation());

        return buildingRepository.save(existingBuilding);
    }

    // Delete a building
    public void deleteBuilding(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));
        buildingRepository.delete(building);
    }
}