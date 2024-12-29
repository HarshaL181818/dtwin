package com.dtwin.backend.dto;

public class BuildingImpact {
    private String buildingId;
    private Double impact;

    // Getters and setters
    public String getBuildingId() { return buildingId; }
    public void setBuildingId(String buildingId) { this.buildingId = buildingId; }
    public Double getImpact() { return impact; }
    public void setImpact(Double impact) { this.impact = impact; }
}