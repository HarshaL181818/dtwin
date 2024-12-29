package com.dtwin.backend.dto;

import java.util.List;

public class BuildingDTO {
    private String id;
    private String type;
    private double width;
    private double height;
    private List<Double> location;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public double getWidth() { return width; }
    public void setWidth(double width) { this.width = width; }

    public double getHeight() { return height; }
    public void setHeight(double height) { this.height = height; }

    public List<Double> getLocation() { return location; }
    public void setLocation(List<Double> location) { this.location = location; }
}
