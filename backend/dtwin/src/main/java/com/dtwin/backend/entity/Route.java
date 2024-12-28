package com.dtwin.backend.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "route_coordinates", joinColumns = @JoinColumn(name = "route_id"))
    @Column(name = "coordinate")
    private List<String> coordinates;

    @Column(name = "created_at", nullable = false, updatable = false)
    private String createdAt;

    private String type;

    public Route() {
    }

    public Route(String name, List<String> coordinates, String createdAt) {
        this.name = name;
        this.coordinates = coordinates;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getCoordinates() {
        return coordinates;
    }

    public void setCoordinates(List<String> coordinates) {
        this.coordinates = coordinates;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Route{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", coordinates=" + coordinates +
                ", createdAt='" + createdAt + '\'' +
                '}';
    }
}
