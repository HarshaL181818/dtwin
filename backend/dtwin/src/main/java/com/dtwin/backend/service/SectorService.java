package com.dtwin.backend.service;

import com.dtwin.backend.dto.BuildingDTO;
import com.dtwin.backend.entity.Sector;
import com.dtwin.backend.repository.SectorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class SectorService {

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private BuildingImpactCalculator buildingImpactCalculator;

    @Transactional
    public List<Sector> saveAll(List<Sector> sectors) {
        return sectorRepository.saveAll(sectors);
    }

    @Transactional(readOnly = true)
    public List<Sector> findAll() {
        return sectorRepository.findAll();
    }

    @Transactional
    public List<Sector> updateSectorWithBuildingImpact(BuildingDTO building, List<Sector> sectors) {
        List<Sector> updatedSectors = buildingImpactCalculator.calculateBuildingAQIImpact(building, sectors);
        return sectorRepository.saveAll(updatedSectors);
    }

    @Transactional
    public List<Sector> updateSectorsWithMultipleBuildings(List<BuildingDTO> buildings, List<Sector> sectors) {
        List<Sector> updatedSectors = sectors;
        for (BuildingDTO building : buildings) {
            updatedSectors = buildingImpactCalculator.calculateBuildingAQIImpact(building, updatedSectors);
        }
        return sectorRepository.saveAll(updatedSectors);
    }
}
