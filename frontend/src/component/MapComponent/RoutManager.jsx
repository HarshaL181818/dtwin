// RoutManager.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const calculateCongestion = (route, buildings) => {
    let baseCongestion = route.traffic || 50;
    
    // Convert coordinates to meter-based distances
    const metersToDegreesAtEquator = 111319.9;
    
    route.coordinates.forEach(coordinate => {
      let totalBuildingImpact = 0;
      
      buildings.forEach(building => {
        // Calculate distance in meters
        const distanceInDegrees = Math.sqrt(
          Math.pow(coordinate[0] - building.location[0], 2) + 
          Math.pow(coordinate[1] - building.location[1], 2)
        );
        const distanceInMeters = distanceInDegrees * metersToDegreesAtEquator;
        
        // Only consider buildings within 100 meters
        const impactRadius = 100;
        if (distanceInMeters < impactRadius) {
          // Calculate impact based on distance (inverse relationship)
          const distanceFactor = 1 - (distanceInMeters / impactRadius);
          
          // Calculate building impact factors
          const heightFactor = building.height / 100; // Normalize height impact
          const emissionFactor = building.emission / 100; // Normalize emission impact
          const buildingTypeFactor = getBuildingTypeFactor(building.type);
          
          // Calculate total impact of this building
          const buildingImpact = 
            distanceFactor * // Distance-based scaling
            heightFactor * // Height impact
            emissionFactor * // Emission impact
            buildingTypeFactor * // Building type impact
            20; // Maximum impact scale factor
          
          totalBuildingImpact += buildingImpact;
        }
      });
      
      // Apply the total building impact to base congestion
      baseCongestion = Math.min(100, baseCongestion + totalBuildingImpact);
    });
    
    return Math.max(0, Math.min(100, baseCongestion));
  };
  
  // Helper function to get impact factor based on building type
  const getBuildingTypeFactor = (buildingType) => {
    const factors = {
      'Residential': 0.6,
      'Commercial': 0.8,
      'Industrial': 1.0,
      'Educational': 0.7,
      'Healthcare': 0.75
    };
    return factors[buildingType] || 0.7;
  };

const getRouteColor = (congestion) => {
  if (congestion >= 80) return '#FF0000';
  if (congestion >= 60) return '#FFA500';
  if (congestion >= 40) return '#FFFF00';
  return '#00FF00';
};

const RoutManager = ({ map, buildings }) => {
  const [routes, setRoutes] = useState([]);
  const [drawingRoute, setDrawingRoute] = useState(false);
  const [currentRoute, setCurrentRoute] = useState([]);

  useEffect(() => {
    if (!map) return;

    if (!map.getSource('routes')) {
      map.addSource('routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'routes-layer',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 5,
          'line-opacity': 0.8
        }
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || !drawingRoute) return;

    const handleRouteClick = (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setCurrentRoute(prev => [...prev, coordinates]);
      updateRoutePreview([...currentRoute, coordinates]);
    };

    map.on('click', handleRouteClick);

    return () => {
      map.off('click', handleRouteClick);
    };
  }, [map, drawingRoute, currentRoute]);

  useEffect(() => {
    if (routes.length > 0) {
      const updatedRoutes = routes.map(route => ({
        ...route,
        congestion: calculateCongestion(route, buildings)
      }));
      setRoutes(updatedRoutes);
      updateMapRoutes(updatedRoutes);
    }
  }, [buildings]);

  const updateMapRoutes = (updatedRoutes) => {
    if (!map) return;

    const features = updatedRoutes.map(route => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: route.coordinates
      },
      properties: {
        id: route.id,
        traffic: route.traffic,
        congestion: route.congestion,
        color: getRouteColor(route.congestion)
      }
    }));

    const source = map.getSource('routes');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features
      });
    }
  };

  const updateRoutePreview = (coordinates) => {
    if (!map) return;

    const source = map.getSource('routes');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: [
          ...routes.map(route => ({
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates
            },
            properties: {
              id: route.id,
              traffic: route.traffic,
              congestion: route.congestion,
              color: getRouteColor(route.congestion)
            }
          })),
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates
            },
            properties: {
              id: 'preview',
              color: '#4CAF50'
            }
          }
        ]
      });
    }
  };

  const startDrawingRoute = () => {
    setDrawingRoute(true);
    setCurrentRoute([]);
  };

  const finishRoute = () => {
    if (currentRoute.length < 2) {
      alert('Please add at least 2 points to create a route');
      return;
    }

    const newRoute = {
      id: Date.now(),
      coordinates: currentRoute,
      traffic: 50,
      congestion: 50
    };

    const updatedRoutes = [...routes, newRoute];
    setRoutes(updatedRoutes);
    updateMapRoutes(updatedRoutes);
    setDrawingRoute(false);
    setCurrentRoute([]);
  };

  const removeRoute = (routeId) => {
    const updatedRoutes = routes.filter(r => r.id !== routeId);
    setRoutes(updatedRoutes);
    updateMapRoutes(updatedRoutes);
  };

  const updateRoute = (routeId, traffic) => {
    const updatedRoutes = routes.map(route => {
      if (route.id === routeId) {
        const newRoute = { ...route, traffic: parseFloat(traffic) };
        newRoute.congestion = calculateCongestion(newRoute, buildings);
        return newRoute;
      }
      return route;
    });
    setRoutes(updatedRoutes);
    updateMapRoutes(updatedRoutes);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow h-1/2 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Routes</h2>
        {!drawingRoute ? (
          <button
            onClick={startDrawingRoute}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          >
            <PlusCircle size={16} />
            Add
          </button>
        ) : (
          <button
            onClick={finishRoute}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            Finish Route
          </button>
        )}
      </div>

      {drawingRoute && (
        <div className="mb-4 p-2 bg-yellow-100 rounded">
          Click on the map to add route points. Click "Finish Route" when done.
        </div>
      )}

      <div className="space-y-4">
        {routes.map(route => (
          <div key={route.id} className="border p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Route #{route.id}</h3>
              <button
                onClick={() => removeRoute(route.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600">Base Traffic Volume</label>
                <input
                  type="number"
                  value={route.traffic}
                  onChange={(e) => updateRoute(route.id, e.target.value)}
                  className="w-full px-2 py-1 border rounded"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Current Congestion</label>
                <div 
                  className="w-full h-4 rounded"
                  style={{ 
                    backgroundColor: getRouteColor(route.congestion),
                    opacity: 0.7
                  }}
                />
                <div className="text-sm text-right mt-1">
                  {Math.round(route.congestion)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutManager;