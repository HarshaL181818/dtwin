package com.dtwin.backend.dto;

import java.util.List;

public class GridDataRequest {
    private String timestamp;
    private List<Double> centerCoordinates;
    private List<SectorData> gridSectors;

    // Getters and setters
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public List<Double> getCenterCoordinates() { return centerCoordinates; }
    public void setCenterCoordinates(List<Double> centerCoordinates) { this.centerCoordinates = centerCoordinates; }

    public List<SectorData> getGridSectors() { return gridSectors; }
    public void setGridSectors(List<SectorData> gridSectors) { this.gridSectors = gridSectors; }
}