package com.dtwin.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class SubSector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sector_id", nullable = false)
    private Sector sector;

    private Integer subSectorId;

    @ElementCollection
    @CollectionTable(name = "subsector_center_coordinates", joinColumns = @JoinColumn(name = "subsector_id"))
    @Column(name = "coordinate")
    private List<Double> centerCoordinates;

    private Integer originalAQI;
    private Integer currentAQI = 0;

    public Integer getOriginalAQI() {
        return originalAQI;
    }

    public void setOriginalAQI(Integer originalAQI) {
        this.originalAQI = originalAQI;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sector getSector() {
        return sector;
    }

    public void setSector(Sector sector) {
        this.sector = sector;
    }

    public Integer getSubSectorId() {
        return subSectorId;
    }

    public void setSubSectorId(Integer subSectorId) {
        this.subSectorId = subSectorId;
    }

    public List<Double> getCenterCoordinates() {
        return centerCoordinates;
    }

    public void setCenterCoordinates(List<Double> centerCoordinates) {
        this.centerCoordinates = centerCoordinates;
    }

    public Integer getCurrentAQI() {
        return currentAQI;
    }

    public void setCurrentAQI(Integer currentAQI) {
        this.currentAQI = currentAQI;
    }
}
