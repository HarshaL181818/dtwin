package com.dtwin.backend.dto;

import java.util.List;

public class SectorData {
    private List<Double> coordinates;
    private Double aqi;
    private String sectorId;
    private Double originalAQI;
    private List<BuildingImpact> impactedBy;

    // Getters and setters
    public List<Double> getCoordinates() { return coordinates; }
    public void setCoordinates(List<Double> coordinates) { this.coordinates = coordinates; }

    public Double getAqi() { return aqi; }
    public void setAqi(Double aqi) { this.aqi = aqi; }

    public String getSectorId() { return sectorId; }
    public void setSectorId(String sectorId) { this.sectorId = sectorId; }

    public Double getOriginalAQI() { return originalAQI; }
    public void setOriginalAQI(Double originalAQI) { this.originalAQI = originalAQI; }

    public List<BuildingImpact> getImpactedBy() { return impactedBy; }
    public void setImpactedBy(List<BuildingImpact> impactedBy) { this.impactedBy = impactedBy; }
}
