import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateBuildingAQIImpact } from '../../utils/aqiImpactCalculator';
import { getAQIColor } from '../../utils/aqiUtils';
import '../../assets/styles/editorpage.css';

const BuildingManager = ({ map, clickedLocation, aqiData, setAqiData, updateGridVisualization }) => {
  const [buildingWidth, setBuildingWidth] = useState(30);
  const [buildingHeight, setBuildingHeight] = useState(50);
  const [buildingColor, setBuildingColor] = useState('#ff0000');
  const [buildingRotation, setBuildingRotation] = useState(0);
  const [buildingType, setBuildingType] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const API_BASE_URL = 'http://localhost:8080/api/buildings';

  const buildingTypes = [
    "Residential Building",
    "Market/Shopping Area",
    "Office Building",
    "Factory/Warehouse",
    "Power Plant",
    "Transport Hub",
    "Educational Institution",
    "Government Office",
    "Park",
    "Cinema/Entertainment",
    "Gym/Sports Arena",
    "Healthcare Facility",
  ];

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    if (map) {
      buildings.forEach(displayBuilding);
    }
  }, [buildings, map]);

  const loadBuildings = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const displayBuilding = (building) => {
    if (!map || !building.coordinates || !building.coordinates[0]) return;

    const buildingId = `building-${building.id}`;
    const labelId = `${buildingId}-label`;

    // Remove existing layers and sources
    [buildingId, labelId].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });

    // Add building extrusion
    map.addSource(buildingId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: building.coordinates
        },
        properties: {
          height: building.height,
          base: 0
        }
      }
    });

    map.addLayer({
      id: buildingId,
      type: 'fill-extrusion',
      source: buildingId,
      paint: {
        'fill-extrusion-color': building.color,
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'base'],
        'fill-extrusion-opacity': 0.8
      }
    });

    // Calculate center point for label
    const coords = building.coordinates[0];
    const center = coords.reduce((acc, curr) => [
      acc[0] + curr[0],
      acc[1] + curr[1]
    ], [0, 0]).map(coord => coord / coords.length);

    // Add label
    map.addSource(labelId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {
          text: `#${building.id}\n${building.type}`
        }
      }
    });

    map.addLayer({
      id: labelId,
      type: 'symbol',
      source: labelId,
      layout: {
        'text-field': ['get', 'text'],
        'text-anchor': 'center',
        'text-size': 12,
        'text-offset': [0, -1]
      },
      paint: {
        'text-color': '#000',
        'text-halo-color': '#fff',
        'text-halo-width': 2
      }
    });
  };

  const updateAQIDisplay = (updatedAqiData) => {
    const gridFeatures = updatedAqiData.map(sector => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [sector.coordinates[0] - 0.001, sector.coordinates[1] - 0.001],
          [sector.coordinates[0] + 0.001, sector.coordinates[1] - 0.001],
          [sector.coordinates[0] + 0.001, sector.coordinates[1] + 0.001],
          [sector.coordinates[0] - 0.001, sector.coordinates[1] + 0.001],
          [sector.coordinates[0] - 0.001, sector.coordinates[1] - 0.001]
        ]]
      },
      properties: {
        color: getAQIColor(sector.aqi),
        sectorId: sector.sectorId
      }
    }));

    updateGridVisualization(gridFeatures);
  };

  const handleAddBuilding = async () => {
    if (!clickedLocation || !buildingType) {
      alert('Please select a location and building type');
      return;
    }

    const size = buildingWidth / 111111;
    const coordinates = getRotatedCoordinates(clickedLocation, size, buildingRotation);

    const newBuilding = {
      location: clickedLocation,
      coordinates: [coordinates],
      width: buildingWidth,
      height: buildingHeight,
      color: buildingColor,
      rotation: buildingRotation,
      type: buildingType,
    };

    try {
      const response = await axios.post(API_BASE_URL, newBuilding);
      const addedBuilding = newBuilding;
      setBuildings(prev => [...prev, addedBuilding]);
      displayBuilding(addedBuilding);

      // Calculate AQI impact if it's a market
      if (buildingType === "Market/Shopping Area" && aqiData.length > 0) {
        // Calculate the updated AQI data based on the building's impact
        const updatedAqiData = calculateBuildingAQIImpact(addedBuilding, aqiData);
      
        // Update the AQI data state
        setAqiData(updatedAqiData);
        
        // Log the updated AQI data list
        console.log('Updated AQI data:', updatedAqiData);
      }
      
      

      setBuildingType('');
    } catch (error) {
      console.error('Failed to add building:', error);
      alert('Failed to add building. Please try again.');
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    try {
      await axios.delete(`${API_BASE_URL}/${buildingId}`);

      // Remove building from map
      const buildingLayerId = `building-${buildingId}`;
      const labelLayerId = `${buildingLayerId}-label`;

      [buildingLayerId, labelLayerId].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id);
        if (map.getSource(id)) map.removeSource(id);
      });

      setBuildings(prev => prev.filter(b => b.id !== buildingId));
      setSelectedBuilding(null);
    } catch (error) {
      console.error('Failed to delete building:', error);
      alert('Failed to delete building. Please try again.');
    }
  };

  const handleUpdateBuilding = async () => {
    if (!selectedBuilding) return;

    const size = buildingWidth / 111111;
    const coordinates = getRotatedCoordinates(
      selectedBuilding.location,
      size,
      buildingRotation
    );

    const updatedBuilding = {
      ...selectedBuilding,
      width: buildingWidth,
      height: buildingHeight,
      color: buildingColor,
      rotation: buildingRotation,
      type: buildingType,
      coordinates: [coordinates],
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/${selectedBuilding.id}`,
        updatedBuilding
      );
      setBuildings(prev =>
        prev.map(b => (b.id === selectedBuilding.id ? response.data : b))
      );
      displayBuilding(response.data);
      setSelectedBuilding(null);
      setBuildingType('');
    } catch (error) {
      console.error('Failed to update building:', error);
      alert('Failed to update building. Please try again.');
    }
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setBuildingWidth(building.width);
    setBuildingHeight(building.height);
    setBuildingColor(building.color);
    setBuildingRotation(building.rotation || 0);
    setBuildingType(building.type || '');

    // Center map on selected building
    if (map) {
      const center = building.coordinates[0].reduce((acc, curr) => [
        acc[0] + curr[0],
        acc[1] + curr[1]
      ], [0, 0]).map(coord => coord / building.coordinates[0].length);

      map.flyTo({
        center: center,
        zoom: 17,
        pitch: 60
      });
    }
  };

  const getRotatedCoordinates = (center, size, rotation) => {
    const rad = (rotation * Math.PI) / 180;
    const points = [
      [-size / 2, -size / 2],
      [size / 2, -size / 2],
      [size / 2, size / 2],
      [-size / 2, size / 2],
      [-size / 2, -size / 2], // Close the polygon
    ];

    return points.map(([x, y]) => [
      center[0] + x * Math.cos(rad) - y * Math.sin(rad),
      center[1] + x * Math.sin(rad) + y * Math.cos(rad),
    ]);
  };

  return (
    <div
      className="p-5 bg-gray-50 w-70 overflow-auto"
      style={{ height: '50vh' }}
    >
      <h3 className="text-lg font-semibold mb-4">Building Controls</h3>

      <div className="space-y-4">
        <div>
          <label className="block mb-2">Building Type:</label>
          <select
            className="w-full p-2 border rounded"
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
          >
            <option value="">Select Building Type</option>
            {buildingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2">Building Width:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={buildingWidth}
            onChange={(e) => setBuildingWidth(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block mb-2">Building Height:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={buildingHeight}
            onChange={(e) => setBuildingHeight(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block mb-2">Building Color:</label>
          <input
            type="color"
            className="w-full p-2 border rounded"
            value={buildingColor}
            onChange={(e) => setBuildingColor(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-2">Building Rotation:</label>
          <input
            type="number"
            className="w-full p-2 border rounded"
            value={buildingRotation}
            onChange={(e) => setBuildingRotation(Number(e.target.value))}
          />
        </div>

        <div>
          <button
            className="w-full p-3 bg-blue-500 text-white rounded"
            onClick={handleAddBuilding}
          >
            Add Building
          </button>
        </div>

        {selectedBuilding && (
          <div>
            <button
              className="w-full p-3 bg-red-500 text-white rounded"
              onClick={() => handleDeleteBuilding(selectedBuilding.id)}
            >
              Delete Building
            </button>
            <button
              className="w-full p-3 bg-yellow-500 text-white rounded"
              onClick={handleUpdateBuilding}
            >
              Update Building
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuildingManager;
