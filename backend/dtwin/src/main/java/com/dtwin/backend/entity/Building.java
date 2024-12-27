package com.dtwin.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;

@Entity
@Table(name = "buildings")
public class Building {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String coordinatesJson;

    @Column(columnDefinition = "TEXT")
    private String locationJson;

    @Transient
    private List<List<List<Double>>> coordinates;

    @Transient
    private List<Double> location;

    private Double width;
    private Double height;
    private String color;
    private Double rotation;

    @PostLoad
    public void postLoad() {
        try {
            if (coordinatesJson != null) {
                coordinates = MAPPER.readValue(coordinatesJson, new TypeReference<>() {
                });
            }
            if (locationJson != null) {
                location = MAPPER.readValue(locationJson, new TypeReference<>() {
                });
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing JSON", e);
        }
    }

    @PrePersist
    @PreUpdate
    public void prePersist() {
        try {
            if (coordinates != null) {
                coordinatesJson = MAPPER.writeValueAsString(coordinates);
            }
            if (location != null) {
                locationJson = MAPPER.writeValueAsString(location);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing to JSON", e);
        }
    }

    // Getters and setters for coordinates and location
    public List<List<List<Double>>> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<List<List<Double>>> coordinates) {
        this.coordinates = coordinates;
    }

    public List<Double> getLocation() {
        return location;
    }

    public void setLocation(List<Double> location) {
        this.location = location;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCoordinatesJson() {
        return coordinatesJson;
    }

    public void setCoordinatesJson(String coordinatesJson) {
        this.coordinatesJson = coordinatesJson;
    }

    public String getLocationJson() {
        return locationJson;
    }

    public void setLocationJson(String locationJson) {
        this.locationJson = locationJson;
    }

    public Double getWidth() {
        return width;
    }

    public void setWidth(Double width) {
        this.width = width;
    }

    public Double getHeight() {
        return height;
    }

    public void setHeight(Double height) {
        this.height = height;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Double getRotation() {
        return rotation;
    }

    public void setRotation(Double rotation) {
        this.rotation = rotation;
    }
}