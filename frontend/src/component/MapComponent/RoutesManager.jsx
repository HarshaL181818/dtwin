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
            'text-field': 'name',
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 12,
            'text-anchor': 'top',
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
        createdAt: new Date().toISOString() // Add this line
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
      // Add error handling to show user feedback
      alert('Failed to save route: ' + error.message);
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

  return (
    <div className="w-[280px] bg-gray-100 p-4 space-y-4 overflow-y-auto h-[45%] rounded-lg border border-gray-800">
      <h3 className="text-lg font-semibold">Route Controls</h3>
      <div>
        <input
          type="text"
          value={routeName}
          onChange={(e) => setRouteName(e.target.value)}
          placeholder="Route name"
          className="w-full p-2 mb-2 border border-gray-300 rounded"
        />

        <select
          value={routeType}
          onChange={(e) => setRouteType(e.target.value)}
          className="w-full p-2 mb-2 border border-gray-300 rounded"
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
          className={`w-full p-2 mb-2 rounded text-white ${isDrawing ? 'bg-red-500' : 'bg-green-500'}`}
        >
          {isDrawing ? 'Cancel Drawing' : 'Start Drawing'}
        </button>

        {isDrawing && clickedPoints.length >= 2 && (
          <button
            onClick={handleSaveRoute}
            className="w-full p-2 mb-2 bg-blue-500 text-white rounded"
          >
            Save Route
          </button>
        )}
      </div>

      <h3 className="text-lg font-semibold">Routes List</h3>
      <div className="space-y-2">
        {routes.map((route) => (
          <div
            key={route.id}
            className="p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50"
          >
            <strong>{route.name}</strong>
            <div className="text-sm text-gray-600">
              {roadTypes.find((type) => type.value === route.type)?.label || 'Major Road'}
            </div>
            <button
              onClick={() => handleDeleteRoute(route.id)}
              className="w-full p-2 mt-2 bg-red-500 text-white rounded"
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
