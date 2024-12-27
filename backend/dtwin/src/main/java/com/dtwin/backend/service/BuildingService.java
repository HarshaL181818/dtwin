package com.dtwin.backend.service;

import com.dtwin.backend.entity.Building;
import com.dtwin.backend.repository.BuildingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;

    @Autowired
    public BuildingService(BuildingRepository buildingRepository) {
        this.buildingRepository = buildingRepository;
    }

    // Add a new building
    public Building addBuilding(Building building) {
        return buildingRepository.save(building);
    }

    // Get all buildings
    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    // Get a building by ID
    public Building getBuildingById(Long id) {
        return buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));
    }

    // Update a building
    public Building updateBuilding(Long id, Building buildingDetails) {
        Building existingBuilding = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));

        existingBuilding.setCoordinates(buildingDetails.getCoordinates());
        existingBuilding.setWidth(buildingDetails.getWidth());
        existingBuilding.setHeight(buildingDetails.getHeight());
        existingBuilding.setColor(buildingDetails.getColor());
        existingBuilding.setRotation(buildingDetails.getRotation());

        return buildingRepository.save(existingBuilding);
    }

    // Delete a building
    public void deleteBuilding(Long id) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Building not found with id " + id));
        buildingRepository.delete(building);
    }
}