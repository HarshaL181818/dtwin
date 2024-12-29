package com.dtwin.backend.controller;

import com.dtwin.backend.dto.GridDataRequest;
import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SectorController {

    @Autowired
    private SectorService sectorService;

    @PostMapping("/grid-data")
    public ResponseEntity<?> saveGridData(@RequestBody GridDataRequest request) {
        try {
            List<Sector> sectors = request.getGridSectors().stream()
                    .map(sectorData -> {
                        Sector sector = new Sector();
                        sector.setTimestamp(Instant.parse(request.getTimestamp()));
                        sector.setCenterCoordinates(request.getCenterCoordinates());
                        sector.setSectorId(String.valueOf(sectorData.getSectorId()));
                        sector.setCoordinates(sectorData.getCoordinates());
                        sector.setOriginalAqi(sectorData.getOriginalAQI());
                        sector.setCurrentAqi(sectorData.getAqi());
                        sector.setImpactedBy(sectorData.getImpactedBy());
                        return sector;
                    })
                    .toList();

            List<Sector> savedSectors = sectorService.saveAll(sectors);
            return ResponseEntity.ok(savedSectors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error saving grid data: " + e.getMessage());
        }
    }

    @GetMapping("/grid-data")
    public ResponseEntity<List<Sector>> getGridData() {
        return ResponseEntity.ok(sectorService.findAll());
    }

}