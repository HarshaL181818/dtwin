import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RouteManager = ({ map }) => {
  const [routes, setRoutes] = useState([]);
  const [routeName, setRouteName] = useState('');
  const [clickedPoints, setClickedPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (!isDrawing) return;
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setClickedPoints(prev => [...prev, coordinates]);
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, isDrawing]);

  useEffect(() => {
    drawRoute();
  }, [clickedPoints]);

  const loadRoutes = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/routes');
      setRoutes(response.data);
    } catch (error) {
      console.error('Failed to load routes:', error);
    }
  };

  const drawRoute = () => {
    if (!map || clickedPoints.length < 2) return;
    
    const sourceId = 'route-line';
    
    if (map.getSource(sourceId)) {
      map.removeLayer(sourceId);
      map.removeSource(sourceId);
    }

    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: clickedPoints
        }
      }
    });

    map.addLayer({
      id: sourceId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#ff0000',
        'line-width': 3
      }
    });
  };

  const handleSaveRoute = async () => {
    if (!routeName || clickedPoints.length < 2) return;

    try {
      const route = {
        name: routeName,
        coordinates: clickedPoints.map(coord => coord.join(','))
      };
      
      await axios.post('http://localhost:8080/api/routes', route);
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
      loadRoutes();
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  const containerStyle = {
    position: 'absolute',
    right: '20px',
    top: '20px',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    width: '250px'
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: '15px' }}>Routes</h3>
      <div>
        <input
          type="text"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="Route name"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
        <button
          onClick={() => setIsDrawing(!isDrawing)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            backgroundColor: isDrawing ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
        </button>
        {isDrawing && clickedPoints.length >= 2 && (
          <button
            onClick={handleSaveRoute}
            style={{
              width: '100%',
              padding: '8px',
              marginBottom: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Save Route
          </button>
        )}
      </div>
      
      <div>
        {routes.map((route) => (
          <div
            key={route.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px',
              marginBottom: '5px',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}
          >
            <span>{route.name}</span>
            <button
              onClick={() => handleDeleteRoute(route.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteManager;