package com.dtwin.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Sector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime timestamp;

    @ElementCollection
    @CollectionTable(name = "sector_center_coordinates", joinColumns = @JoinColumn(name = "sector_id"))
    @Column(name = "coordinate")
    private List<Double> centerCoordinates;

    private Integer sectorId;

    @OneToMany(mappedBy = "sector", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubSector> gridSectors;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public List<Double> getCenterCoordinates() {
        return centerCoordinates;
    }

    public void setCenterCoordinates(List<Double> centerCoordinates) {
        this.centerCoordinates = centerCoordinates;
    }

    public Integer getSectorId() {
        return sectorId;
    }

    public void setSectorId(Integer sectorId) {
        this.sectorId = sectorId;
    }

    public List<SubSector> getGridSectors() {
        return gridSectors;
    }

    public void setGridSectors(List<SubSector> gridSectors) {
        this.gridSectors = gridSectors;
    }
}
