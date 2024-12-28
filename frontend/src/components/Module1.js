import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Module1 = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [buildingWidth, setBuildingWidth] = useState(30);
  const [buildingHeight, setBuildingHeight] = useState(50);
  const [buildingColor, setBuildingColor] = useState('#ff0000');
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingRotation, setBuildingRotation] = useState(0);

  const API_BASE_URL = 'http://localhost:8080/api/buildings';

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    gap: '20px',
    padding: '20px',
  };

  const mapStyle = {
    flexGrow: 1,
    height: '100%',
  };

  const sidebarStyle = {
    width: '300px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    overflowY: 'auto',
  };

  const controlStyle = {
    marginBottom: '15px',
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  };

  const buildingListStyle = {
    listStyle: 'none',
    padding: 0,
  };

  const buildingItemStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    marginBottom: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  // Fetch buildings from the backend
  const loadBuildings = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setBuildings(response.data);

      // Display all buildings on the map
      response.data.forEach((building) => {
        displayBuilding(building);
      });
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  useEffect(() => {
    if (map) {
      loadBuildings();
    }
  }, [map]);

  const displayBuilding = (building) => {
    if (!map) return;
  
    const buildingId = `building-${building.id}`;
    const center = building.coordinates[0].reduce((acc, curr) => [
      acc[0] + curr[0],
      acc[1] + curr[1]
    ], [0, 0]).map(coord => coord / building.coordinates[0].length);
  
    // Remove existing layers and sources
    [buildingId, `${buildingId}-label`].forEach(id => {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    });
  
    // Add building
    map.addSource(buildingId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          height: building.height,
          color: building.color,
          base: 0
        },
        geometry: {
          type: 'Polygon',
          coordinates: building.coordinates,
        },
      },
    });
  
    map.addLayer({
      id: buildingId,
      type: 'fill-extrusion',
      source: buildingId,
      paint: {
        'fill-extrusion-color': building.color,
        'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': ['get', 'base'],
        'fill-extrusion-opacity': 0.8,
      },
    });
  
    // Add ID label source and layer
    map.addSource(`${buildingId}-label`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {
          id: building.id
        }
      }
    });
  
    map.addLayer({
      id: `${buildingId}-label`,
      type: 'symbol',
      source: `${buildingId}-label`,
      layout: {
        'text-field': `#${building.id}`,
        'text-anchor': 'center',
        'text-size': 16,
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#000000',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
      }
    });
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Changed to light style for better visibility
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 60,
      bearing: -45,
      antialias: true,
    });

    mapInstance.on('load', () => {
      // Add 3D building layer settings
      mapInstance.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      }, 'waterway-label');
    });

    mapInstance.on('click', (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setClickedLocation(coordinates);
      updateClickMarker(mapInstance, coordinates);
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  const updateClickMarker = (mapInstance, coordinates) => {
    if (mapInstance.getLayer('click-point')) {
      mapInstance.removeLayer('click-point');
      mapInstance.removeSource('click-point');
    }

    mapInstance.addSource('click-point', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
      },
    });

    mapInstance.addLayer({
      id: 'click-point',
      type: 'circle',
      source: 'click-point',
      paint: {
        'circle-radius': 6,
        'circle-color': buildingColor,
      },
    });
  };

  const handleAddBuilding = async () => {
    if (!clickedLocation) return;

    const size = buildingWidth / 111111;
    const coordinates = getRotatedCoordinates(clickedLocation, size, buildingRotation);

    const building = {
      location: clickedLocation,
      coordinates,
      width: buildingWidth,
      height: buildingHeight,
      color: buildingColor,
      rotation: buildingRotation,
    };

    try {
      const response = await axios.post(API_BASE_URL, building);
      setBuildings((prev) => [...prev, response.data]);
      displayBuilding(response.data);
      setClickedLocation(null);
    } catch (error) {
      if (error.response) {
        console.error('Failed to add building:', error.response.data);
      } else {
        console.error('Network error or unexpected issue:', error.message);
      }
    }
  };
const handleDeleteBuilding = async (buildingId) => {
    try {
      await axios.delete(`${API_BASE_URL}/${buildingId}`);
      // Remove the building layer and source
      if (map) {
        const buildingId = `building-${buildingId}`;
        const labelId = `${buildingId}-label`;
        
        // Remove building layer and source
        if (map.getLayer(buildingId)) {
          map.removeLayer(buildingId);
        }
        if (map.getSource(buildingId)) {
          map.removeSource(buildingId);
        }
        
        // Remove label layer and source
        if (map.getLayer(labelId)) {
          map.removeLayer(labelId);
        }
        if (map.getSource(labelId)) {
          map.removeSource(labelId);
        }
      }
      
      // Update local state immediately
      setBuildings(prev => prev.filter(b => b.id !== buildingId));
      setSelectedBuilding(null);
    } catch (error) {
      console.error('Failed to delete building:', error);
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
      coordinates,
    };

    try {
      const response = await axios.put(
        `${API_BASE_URL}/${selectedBuilding.id}`,
        updatedBuilding
      );
      displayBuilding(response.data);
      setBuildings((prev) =>
        prev.map((b) => (b.id === selectedBuilding.id ? response.data : b))
      );
      setSelectedBuilding(null);
    } catch (error) {
      console.error('Failed to update building:', error);
    }
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setBuildingWidth(building.width);
    setBuildingHeight(building.height);
    setBuildingColor(building.color);
    setBuildingRotation(building.rotation || 0);
  };

  const getRotatedCoordinates = (center, size, rotation) => {
    const rad = (rotation * Math.PI) / 180;
    const points = [
      [-size / 2, -size / 2],
      [size / 2, -size / 2],
      [size / 2, size / 2],
      [-size / 2, size / 2],
    ];

    return [
      points.map(([x, y]) => [
        center[0] + x * Math.cos(rad) - y * Math.sin(rad),
        center[1] + x * Math.sin(rad) + y * Math.cos(rad),
      ]),
    ];
  };

  return (
    <div style={containerStyle}>
      <div style={mapStyle} ref={mapContainerRef} />
      <RouteManager map={map} />
      <div style={sidebarStyle}>
        <h3>Building Controls</h3>
        <div style={controlStyle}>
          <label>Width (m): </label>
          <input
            type="number"
            value={buildingWidth}
            onChange={(e) => setBuildingWidth(Number(e.target.value))}
            min="1"
            max="100"
          />
        </div>
        <div style={controlStyle}>
          <label>Height (m): </label>
          <input
            type="number"
            value={buildingHeight}
            onChange={(e) => setBuildingHeight(Number(e.target.value))}
            min="1"
            max="100"
          />
        </div>
        <div style={controlStyle}>
          <label>Color: </label>
          <input
            type="color"
            value={buildingColor}
            onChange={(e) => setBuildingColor(e.target.value)}
          />
        </div>
        <button style={buttonStyle} onClick={handleAddBuilding}>
          Add Building
        </button>
        {selectedBuilding && (
          <>
            <h4>Selected Building</h4>
            <button style={buttonStyle} onClick={handleUpdateBuilding}>
              Update Building
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: '#dc3545',
              }}
              onClick={() => handleDeleteBuilding(selectedBuilding.id)}
            >
              Delete Building
            </button>
          </>
        )}
        <h3>List</h3>
        <ul style={buildingListStyle}>
          {buildings.map((building) => (
            <li
              key={building.id}
              style={buildingItemStyle}
              onClick={() => handleSelectBuilding(building)}
            >
            {building.id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Module1;