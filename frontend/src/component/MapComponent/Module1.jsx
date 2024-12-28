import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';
import PolygonAQIManager from '../AnalysisComponent/PolygonAQIManager';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Module1 = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [buildingWidth, setBuildingWidth] = useState(30);
  const [buildingHeight, setBuildingHeight] = useState(50);
  const [buildingColor, setBuildingColor] = useState('#ff0000');
  const [buildings, setBuildings] = useState([]);
  const [buildingRotation, setBuildingRotation] = useState(0);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingType, setBuildingType] = useState('');

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

  // Styles
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

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '10px',
  };

  const buildingItemStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    marginBottom: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  };

  const selectedBuildingItemStyle = {
    ...buildingItemStyle,
    backgroundColor: '#e9ecef',
    borderColor: '#007bff',
  };

  // Load buildings from backend
  const loadBuildings = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setBuildings(response.data);
      response.data.forEach(displayBuilding);
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
  
    // Add label with building type and ID
    map.addSource(`${buildingId}-label`, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: center
        },
        properties: {
          id: building.id,
          type: building.type
        }
      }
    });
  
    map.addLayer({
      id: `${buildingId}-label`,
      type: 'symbol',
      source: `${buildingId}-label`,
      layout: {
        'text-field': `#${building.id}\n${building.type || 'Unknown'}`,
        'text-anchor': 'center',
        'text-size': 14,
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
      style: 'mapbox://styles/mapbox/light-v11',
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 60,
      bearing: -45,
      antialias: true,
    });

    mapInstance.on('load', () => {
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
    if (!clickedLocation || !buildingType) {
      alert('Please select a location and building type');
      return;
    }

    const size = buildingWidth / 111111;
    const coordinates = getRotatedCoordinates(clickedLocation, size, buildingRotation);

    const newBuilding = {
      location: clickedLocation,
      coordinates,
      width: buildingWidth,
      height: buildingHeight,
      color: buildingColor,
      rotation: buildingRotation,
      type: buildingType,
    };

    try {
      const response = await axios.post(API_BASE_URL, newBuilding);
      setBuildings(prev => [...prev, response.data]);
      displayBuilding(response.data);
      setClickedLocation(null);
      setBuildingType('');
    } catch (error) {
      console.error('Failed to add building:', error);
      alert('Failed to add building. Please try again.');
    }
  };

  const handleDeleteBuilding = async (buildingId) => {
    try {
      await axios.delete(`${API_BASE_URL}/${buildingId}`);
      
      if (map) {
        const buildingLayerId = `building-${buildingId}`;
        const labelLayerId = `${buildingLayerId}-label`;
        
        if (map.getLayer(buildingLayerId)) map.removeLayer(buildingLayerId);
        if (map.getSource(buildingLayerId)) map.removeSource(buildingLayerId);
        if (map.getLayer(labelLayerId)) map.removeLayer(labelLayerId);
        if (map.getSource(labelLayerId)) map.removeSource(labelLayerId);
      }
      
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
      coordinates,
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
    {map && <RouteManager map={map} />} 
    <div style={sidebarStyle}>
        <h3>Building Controls</h3>
        <div style={controlStyle}>
          <label>Building Type: </label>
          <select
            style={inputStyle}
            value={buildingType}
            onChange={(e) => setBuildingType(e.target.value)}
          >
            <option value="">Select building type</option>
            {buildingTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div style={controlStyle}>
          <label>Width (m): </label>
          <input
            type="number"
            style={inputStyle}
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
            style={inputStyle}
            value={buildingHeight}
            onChange={(e) => setBuildingHeight(Number(e.target.value))}
            min="1"
            max="100"
          />
        </div>
        <div style={controlStyle}>
          <label>Rotation (degrees): </label>
          <input
            type="number"
            style={inputStyle}
            value={buildingRotation}
            onChange={(e) => setBuildingRotation(Number(e.target.value))}
            min="0"
            max="360"
          />
        </div>
        <div style={controlStyle}>
          <label>Color: </label>
          <input
            type="color"
            style={inputStyle}
            value={buildingColor}
            onChange={(e) => setBuildingColor(e.target.value)}
          />
        </div>
        
        <button 
          style={buttonStyle} 
          onClick={handleAddBuilding}
          disabled={!clickedLocation || !buildingType}
        >
          Add Building
        </button>

        {selectedBuilding && (
          <div style={{ marginTop: '20px' }}>
            <h4>Selected Building #{selectedBuilding.id}</h4>
            <button style={buttonStyle} onClick={handleUpdateBuilding}>
              Update Building
            </button>
            <button
              style={{
                ...buttonStyle,
                backgroundColor: '#dc3545',
                marginTop: '5px',
              }}
              onClick={() => handleDeleteBuilding(selectedBuilding.id)}
            >
              Delete Building
            </button>
          </div>
        )}

        <h3 style={{ marginTop: '20px' }}>Buildings List</h3>
        <div>
          {buildings.map((building) => (
            <div
              key={building.id}
              style={building.id === selectedBuilding?.id ? selectedBuildingItemStyle : buildingItemStyle}
              onClick={() => handleSelectBuilding(building)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>#{building.id}</strong>
                  <div>{building.type || 'Unknown type'}</div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {building.width}m × {building.height}m
                  </div>
                </div>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: building.color,
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Module1;