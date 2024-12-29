package com.dtwin.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.dtwin.backend.dto.BuildingImpact;
import java.util.List;
import java.time.Instant;

@Entity
@Table(name = "sectors")
public class Sector {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Instant timestamp;

    @Column(columnDefinition = "TEXT")
    private String centerCoordinatesJson;

    @Column(nullable = false)
    private String sectorId;

    private Double originalAqi;
    private Double currentAqi;

    @Column(columnDefinition = "TEXT")
    private String coordinatesJson;

    @Column(columnDefinition = "TEXT")
    private String impactedByJson;

    @Transient
    private List<Double> coordinates;

    @Transient
    private List<Double> centerCoordinates;

    @Transient
    private List<BuildingImpact> impactedBy;

    @PrePersist
    @PreUpdate
    public void prePersist() {
        try {
            if (coordinates != null) {
                coordinatesJson = MAPPER.writeValueAsString(coordinates);
            }
            if (centerCoordinates != null) {
                centerCoordinatesJson = MAPPER.writeValueAsString(centerCoordinates);
            }
            if (impactedBy != null) {
                impactedByJson = MAPPER.writeValueAsString(impactedBy);
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing to JSON", e);
        }
    }

    @PostLoad
    public void postLoad() {
        try {
            if (coordinatesJson != null) {
                coordinates = MAPPER.readValue(coordinatesJson, new TypeReference<List<Double>>() {});
            }
            if (centerCoordinatesJson != null) {
                centerCoordinates = MAPPER.readValue(centerCoordinatesJson, new TypeReference<List<Double>>() {});
            }
            if (impactedByJson != null) {
                impactedBy = MAPPER.readValue(impactedByJson, new TypeReference<List<BuildingImpact>>() {});
            }
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error deserializing JSON", e);
        }
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public List<Double> getCoordinates() { return coordinates; }
    public void setCoordinates(List<Double> coordinates) { this.coordinates = coordinates; }

    public List<Double> getCenterCoordinates() { return centerCoordinates; }
    public void setCenterCoordinates(List<Double> centerCoordinates) { this.centerCoordinates = centerCoordinates; }

    public String getSectorId() { return sectorId; }
    public void setSectorId(String sectorId) { this.sectorId = sectorId; }

    public Double getOriginalAqi() { return originalAqi; }
    public void setOriginalAqi(Double originalAqi) { this.originalAqi = originalAqi; }

    public Double getCurrentAqi() { return currentAqi; }
    public void setCurrentAqi(Double currentAqi) { this.currentAqi = currentAqi; }

    public List<BuildingImpact> getImpactedBy() { return impactedBy; }
    public void setImpactedBy(List<BuildingImpact> impactedBy) { this.impactedBy = impactedBy; }
}
