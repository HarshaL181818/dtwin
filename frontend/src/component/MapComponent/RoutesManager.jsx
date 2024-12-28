import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteManager = ({ map }) => {
  const [routes, setRoutes] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [routeType, setRouteType] = useState('major');
  const [clickedPoints, setClickedPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  const roadTypes = [
    { value: 'major', label: 'Major Road', color: '#000000', width: 5 },
    { value: 'minor', label: 'Minor Road', color: '#808080', width: 3 },
  ];

  useEffect(() => {
    if (!map) return;

    const handleStyleLoad = () => {
      setIsStyleLoaded(true);
    };

    if (map.isStyleLoaded()) {
      setIsStyleLoaded(true);
    } else {
      map.on('style.load', handleStyleLoad);
    }

    return () => {
      map.off('style.load', handleStyleLoad);
    };
  }, [map]);

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (!isDrawing) return;
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setClickedPoints((prev) => [...prev, coordinates]);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, isDrawing]);

  useEffect(() => {
    if (!map || !isStyleLoaded) return;

    const drawingSourceId = 'temp-route-line';

    const cleanup = () => {
      if (map.getLayer(drawingSourceId)) {
        map.removeLayer(drawingSourceId);
      }
      if (map.getSource(drawingSourceId)) {
        map.removeSource(drawingSourceId);
      }
    };

    cleanup();

    if (clickedPoints.length >= 2) {
      const currentRoadStyle = roadTypes.find((type) => type.value === routeType) || roadTypes[0];

      try {
        map.addSource(drawingSourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: clickedPoints,
            },
          },
        });

        map.addLayer({
          id: drawingSourceId,
          type: 'line',
          source: drawingSourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': currentRoadStyle.color,
            'line-width': currentRoadStyle.width,
          },
        });
      } catch (error) {
        console.error('Error adding temporary route:', error);
      }
    }

    return cleanup;
  }, [clickedPoints, map, routeType, isStyleLoaded]);

  const displayRoutes = () => {
    if (!map || !isStyleLoaded) return;

    routes.forEach((route) => {
      const sourceId = `route-${route.id}`;
      const coordinates = route.coordinates.map((coord) => coord.split(',').map(Number));

      const roadStyle = roadTypes.find((type) => type.value === route.type) || roadTypes[0];

      try {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          },
        });

        map.addLayer({
          id: sourceId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': roadStyle.color,
            'line-width': roadStyle.width,
          },
        });
      } catch (error) {
        console.error(`Error adding route ${route.id}:`, error);
      }
    });
  };

  useEffect(() => {
    if (isStyleLoaded) {
      displayRoutes();
    }
  }, [routes, map, isStyleLoaded]);

  const loadRoutes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  const handleSaveRoute = async () => {
    if (!routeName || clickedPoints.length < 2) return;

    try {
      const route = {
        name: routeName,
        type: routeType,
        coordinates: clickedPoints.map((coord) => coord.join(',')),
      };

      await axios.post('http://localhost:8080/api/routes', route);

      const drawingSourceId = 'temp-route-line';
      if (map.getLayer(drawingSourceId)) {
        map.removeLayer(drawingSourceId);
      }
      if (map.getSource(drawingSourceId)) {
        map.removeSource(drawingSourceId);
      }

      setRouteName('');
      setClickedPoints([]);
      setIsDrawing(false);
      loadRoutes();
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/routes/${id}`);

      const sourceId = `route-${id}`;
      if (map.getLayer(sourceId)) {
        map.removeLayer(sourceId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }

      loadRoutes();
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  const containerStyle = {
    width: '300px',
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    overflowY: 'auto',
    marginRight: '20px',
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
    padding: '8px',
    marginBottom: '10px',
    backgroundColor: isDrawing ? '#dc3545' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const routeItemStyle = {
    padding: '10px',
    border: '1px solid #ddd',
    marginBottom: '5px',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: 'white',
  };

  return (
    <div style={containerStyle}>
      <h3>Route Controls</h3>
      <div>
        <input
          type="text"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="Route name"
          style={inputStyle}
        />

        <select
          value={routeType}
          onChange={(e) => setRouteType(e.target.value)}
          style={inputStyle}
        >
          {roadTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setIsDrawing(!isDrawing);
            if (!isDrawing) {
              setClickedPoints([]);
            }
          }}
          style={buttonStyle}
        >
          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
        </button>

        {isDrawing && clickedPoints.length >= 2 && (
          <button
            onClick={handleSaveRoute}
            style={{
              ...buttonStyle,
              backgroundColor: '#007bff',
              marginBottom: '10px',
            }}
          >
            Save Route
          </button>
        )}
      </div>

      <h3>Routes List</h3>
      <div>
        {routes.map((route) => (
          <div
            key={route.id}
            style={routeItemStyle}
            onClick={() => console.log('Route selected:', route.id)}
          >
            <strong>{route.name}</strong>
            <div style={{ fontSize: '0.9em', color: '#666' }}>
              {roadTypes.find((type) => type.value === route.type)?.label || 'Major Road'}
            </div>
            <button
              onClick={() => handleDeleteRoute(route.id)}
              style={{
                ...buttonStyle,
                backgroundColor: '#dc3545',
                marginTop: '5px',
              }}
            >
              Delete Route
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteManager;
