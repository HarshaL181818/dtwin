import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Pollution = () => {
  const mapContainerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [map, setMap] = useState(null);
  const [isClickListenerEnabled, setIsClickListenerEnabled] = useState(false);

  const fetchAQI = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${import.meta.env.VITE_REACT_APP_AQICN_TOKEN}`
      );
      const data = await response.json();
      if (data.status === 'ok') {
        return data.data.aqi;
      } else {
        console.error('Failed to fetch AQI data');
        return null;
      }
    } catch (error) {
      console.error('Error fetching AQI:', error);
      return null;
    }
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [77.209, 28.6139],
      zoom: 8,
      pitch: 60,
      bearing: -17.6,
    });

    setMap(mapInstance);

    mapInstance.on('load', () => {
      // Add the source
      mapInstance.addSource('heatmap-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add heatmap layer
      mapInstance.addLayer({
        id: 'aqi-heat',
        type: 'heatmap',
        source: 'heatmap-data',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'aqi'],
            0, 0,
            200, 1
          ],
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 255, 0, 0)',
            0.2, 'rgb(0, 255, 0)',
            0.4, 'rgb(255, 255, 0)',
            0.6, 'rgb(255, 128, 0)',
            0.8, 'rgb(255, 0, 0)',
            1, 'rgb(128, 0, 128)'
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            15, 50
          ],
          'heatmap-opacity': 0.8
        }
      });

      // Add 3D buildings
      mapInstance.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#222222',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8,
        },
      });
    });

    return () => mapInstance.remove();
  }, [isDarkMode]);

  // Click handler effect
  useEffect(() => {
    if (!map || !isClickListenerEnabled) return;

    const handleClick = async (event) => {
      const { lng, lat } = event.lngLat;
      console.log(`Clicked coordinates: Longitude ${lng}, Latitude ${lat}`);

      const largeSquareSide = 0.2;
      const divisions = 20;
      const smallSquareSide = largeSquareSide / divisions;
      const promises = [];

      // Create a grid of points
      for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
          const offsetX = (i - divisions / 2 + 0.5) * smallSquareSide;
          const offsetY = (j - divisions / 2 + 0.5) * smallSquareSide;
          const pointCenter = [lng + offsetX, lat + offsetY];
          
          promises.push(
            fetchAQI(pointCenter[1], pointCenter[0]).then((aqi) => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: pointCenter,
              },
              properties: {
                aqi: aqi || 0,
              }
            }))
          );
        }
      }

      const pointsWithAQI = await Promise.all(promises);

      // Update the heatmap data source
      if (map.getSource('heatmap-data')) {
        map.getSource('heatmap-data').setData({
          type: 'FeatureCollection',
          features: pointsWithAQI.filter(point => point.properties.aqi !== null),
        });
      }
    };

    map.on('click', handleClick);
    return () => {
      if (map && map.off) {
        map.off('click', handleClick);
      }
    };
  }, [map, isClickListenerEnabled]);

  return (
    <div className="min-h-screen bg-black flex">
      {/* Settings Panel */}
      <div
        className="fixed left-0 top-0 h-screen p-6 w-64"
        style={{
          width: '100%',
          height: '100vh',
        }}
      />

      <div
        className="position-fixed top-0 start-0 p-4"
        style={{
          zIndex: 9999,
          background: '#000000',
          width: '250px',
          height: '100vh',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0)',
        }}
      >
        <h5 className="text-xl font-bold text-white mb-6">Settings Panel</h5>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-white">
            <label htmlFor="darkModeSwitch" className="cursor-pointer">
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </label>
            <input
              className="form-check-input cursor-pointer"
              type="checkbox"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
              id="darkModeSwitch"
            />
          </div>

          <button
            onClick={() => setIsClickListenerEnabled(!isClickListenerEnabled)}
            className={`w-full py-2 px-4 rounded-lg transition-all duration-300 ${
              isClickListenerEnabled 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            {isClickListenerEnabled ? 'Disable Click Listener' : 'Enable Click Listener'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 ml-64">
        <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
             style={{ height: 'calc(100vh - 4rem)' }}>
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            style={{
              width: '100%',
              height: '100%',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Pollution;