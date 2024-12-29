package com.dtwin.backend.controller;

import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.repository.SectorRepository;
import com.dtwin.backend.service.SectorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/sector")
public class SectorController {
    @Autowired
    private SectorService sectorService;

    @PostMapping
    public ResponseEntity<String> saveSector(@RequestBody Sector sector) {
        try {
            sectorService.saveSector(sector);
            return ResponseEntity.ok("Sector and grid data saved successfully!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to save sector data");
        }
    }

    @GetMapping
    public List<Sector> getAllSectors() {
        return sectorService.getAllSectors();
    }
}
