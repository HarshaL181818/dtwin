package com.dtwin.backend.service;

import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.entity.SubSector;
import com.dtwin.backend.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectorService {
    private final SectorRepository sectorRepository;

    @Autowired
    public SectorService(SectorRepository sectorRepository) {
        this.sectorRepository = sectorRepository;
    }

    public Sector saveSector(Sector sector) {
        // Validate SubSector AQI and associate with the sector
        if (sector.getGridSectors() != null) {
            for (SubSector subSector : sector.getGridSectors()) {
                // Ensure `currentAQI` is initialized
                if (subSector.getCurrentAQI() == null) {
                    subSector.setCurrentAQI(subSector.getOriginalAQI() == null ? 0 : subSector.getOriginalAQI());
                }

                subSector.setSector(sector); // Associate SubSector with the Sector
            }
        }

        return sectorRepository.save(sector);
    }

    public List<Sector> getAllSectors() {
        return sectorRepository.findAll();
    }
}


