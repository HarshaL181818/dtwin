// Constants
const MARKET_BASE_IMPACT = 20; // Base AQI impact for markets
const MAX_IMPACT_RADIUS = 500; // Maximum radius in meters
const IMPACT_DECAY_RATE = 0.5; // Adjusted decay rate for less aggressive impact
const MIN_BUILDING_SIZE = 100; // Minimum building size in cubic meters for impact
const SIZE_IMPACT_FACTOR = 0.0005; // Adjusted size impact factor for more gradual impact
const MAX_BUILDING_AQI_IMPACT = 50; // Maximum AQI impact from a single building
const MAX_AQI_IMPACT = 200; // Maximum total AQI impact for a sector

// Main function to calculate AQI impact
export const calculateBuildingAQIImpact = (building, gridSectors) => {
  if (building.type !== "Market/Shopping Area") {
    return gridSectors;
  }

  // Calculate building volume and base impact
  const buildingVolume = building.width * building.width * building.height;
  const sizeImpactMultiplier = Math.max(1, Math.log(buildingVolume - MIN_BUILDING_SIZE + 1) * SIZE_IMPACT_FACTOR);
  const baseImpact = MARKET_BASE_IMPACT * sizeImpactMultiplier;

  // Calculate impact radius based on building size (using a square root function for diminishing returns)
  const impactRadius = Math.min(Math.sqrt(buildingVolume) * 2, MAX_IMPACT_RADIUS);

  return gridSectors.map(sector => {
    const distance = calculateDistance(building.location, sector.coordinates);

    if (distance <= impactRadius) {
      // Smoother decay function using a logarithmic scale for distance
      const impactFactor = Math.max(0, Math.log((impactRadius - distance) + 1) / Math.log(impactRadius + 1));
      const impact = Math.round(baseImpact * impactFactor);

      // Ensure that no building adds excessive AQI impact
      const limitedImpact = Math.min(impact, MAX_BUILDING_AQI_IMPACT);

      // Add or update building impact
      const existingImpacts = sector.impactedBy || [];
      const newImpacts = [
        ...existingImpacts.filter(imp => imp.buildingId !== building.id),
        { buildingId: building.id, impact: limitedImpact }
      ];

      // Calculate total AQI including all building impacts
      const baseAQI = sector.originalAQI || sector.aqi;
      const totalImpact = newImpacts.reduce((sum, imp) => sum + imp.impact, 0);

      // Cap the total impact to avoid excessive AQI increase
      const cappedImpact = Math.min(totalImpact, MAX_AQI_IMPACT);

      return {
        ...sector,
        originalAQI: sector.originalAQI || sector.aqi,
        aqi: Math.round(baseAQI + cappedImpact),
        impactedBy: newImpacts
      };
    }

    return sector;
  });
};

// Function to update the grid AQI after adding a building
export const updateGridAQIAfterBuildingAddition = (building, gridSectors) => {
  const updatedSectors = calculateBuildingAQIImpact(building, gridSectors);

  // Update the grid sectors with new AQI values
  return updatedSectors;
};

// Helper function to calculate distance
const calculateDistance = (point1, point2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1[1] * Math.PI / 180;
  const φ2 = point2[1] * Math.PI / 180;
  const Δφ = (point2[1] - point1[1]) * Math.PI / 180;
  const Δλ = (point2[0] - point1[0]) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
};
