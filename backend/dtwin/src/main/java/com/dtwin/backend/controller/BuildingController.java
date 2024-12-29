package com.dtwin.backend.controller;

import com.dtwin.backend.dto.BuildingDTO;
import com.dtwin.backend.entity.Building;
import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.service.BuildingService;
import com.dtwin.backend.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/buildings")
public class BuildingController {
    @Autowired
    BuildingService buildingService;

    @Autowired
    private SectorService sectorService;

    @GetMapping
    public List<Building> getAllBuildings() {
        return buildingService.getAllBuildings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingById(@PathVariable Long id) {
        try {
            Building building = buildingService.getBuildingById(id);
            return ResponseEntity.ok(building);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Building> createBuilding(@RequestBody Building building) {
        Building savedBuilding = buildingService.addBuilding(building);
        return ResponseEntity.ok(savedBuilding);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Building> updateBuilding(@PathVariable Long id, @RequestBody Building buildingDetails) {
        try {
            Building updatedBuilding = buildingService.updateBuilding(id, buildingDetails);
            return ResponseEntity.ok(updatedBuilding);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBuilding(@PathVariable Long id) {
        try {
            buildingService.deleteBuilding(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/building-impact")
    public ResponseEntity<?> calculateBuildingImpact(@RequestBody BuildingDTO building) {
        try {
            List<Sector> currentSectors = sectorService.findAll();
            List<Sector> updatedSectors = sectorService.updateSectorWithBuildingImpact(building, currentSectors);
            return ResponseEntity.ok(updatedSectors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating building impact: " + e.getMessage());
        }
    }

    @PostMapping("/buildings-impact")
    public ResponseEntity<?> calculateMultipleBuildingsImpact(@RequestBody List<BuildingDTO> buildings) {
        try {
            List<Sector> currentSectors = sectorService.findAll();
            List<Sector> updatedSectors = sectorService.updateSectorsWithMultipleBuildings(buildings, currentSectors);
            return ResponseEntity.ok(updatedSectors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error calculating multiple buildings impact: " + e.getMessage());
        }
    }
}
