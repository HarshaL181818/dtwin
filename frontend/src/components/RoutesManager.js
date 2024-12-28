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
    if (!map) return;
    
    // Remove only the temporary drawing layer
    const drawingSourceId = 'temp-route-line';
    if (map.getSource(drawingSourceId)) {
      map.removeLayer(drawingSourceId);
      map.removeSource(drawingSourceId);
    }

    // Draw the temporary route
    if (clickedPoints.length >= 2) {
      map.addSource(drawingSourceId, {
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
        id: drawingSourceId,
        type: 'line',
        source: drawingSourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#808080',
          'line-width': 3
        }
      });
    }
  }, [clickedPoints, map]);

  // Display all saved routes
  const displayRoutes = () => {
    if (!map) return;

    // Remove all existing route layers
    routes.forEach(route => {
      const sourceId = `route-${route.id}`;
      if (map.getLayer(sourceId)) {
        map.removeLayer(sourceId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    });

    // Add all routes to the map
    routes.forEach(route => {
      const sourceId = `route-${route.id}`;
      const coordinates = route.coordinates.map(coord => 
        coord.split(',').map(Number)
      );

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
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
          'line-color': '#808080',
          'line-width': 3
        }
      });
    });
  };

  useEffect(() => {
    displayRoutes();
  }, [routes, map]);

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
        coordinates: clickedPoints.map(coord => coord.join(','))
      };
      
      await axios.post('http://localhost:8080/api/routes', route);
      
      // Clear the temporary drawing
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
      loadRoutes(); // Reload all routes
    } catch (error) {
      console.error('Failed to save route:', error);
    }
  };

  const handleDeleteRoute = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/routes/${id}`);
      
      // Remove the route layer and source from the map
      const sourceId = `route-${id}`;
      if (map.getLayer(sourceId)) {
        map.removeLayer(sourceId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
      
      loadRoutes(); // Reload remaining routes
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  // Rest of the component remains the same...
  const containerStyle = {
    position: 'absolute',
    right: '400px',
    top: '700px',
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
          onClick={() => {
            setIsDrawing(!isDrawing);
            if (!isDrawing) {
              setClickedPoints([]);
            }
          }}
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