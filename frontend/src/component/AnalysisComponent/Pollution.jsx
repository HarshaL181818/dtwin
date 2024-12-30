import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from '../Navbar/Navbar';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Pollution = () => {
  const mapContainerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [map, setMap] = useState(null);
  const [isClickListenerEnabled, setIsClickListenerEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getColorForAQI = (aqi) => {
    if (aqi <= 50) return '#00e400'; // Green - Good
    if (aqi <= 100) return '#ffff00'; // Yellow - Moderate
    if (aqi <= 150) return '#ff7e00'; // Orange - Unhealthy for Sensitive Groups
    if (aqi <= 200) return '#ff0000'; // Red - Unhealthy
    if (aqi <= 300) return '#99004c'; // Purple - Very Unhealthy
    return '#7e0023'; // Maroon - Hazardous
  };

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery || !map) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        map.flyTo({
          center: [lng, lat],
          zoom: 9,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [77.209, 28.6139],
      zoom: 9,
      pitch: 60,
      bearing: -17.6,
    });

    setMap(mapInstance);

    mapInstance.on('load', () => {
      // Add a source for the grid cells
      mapInstance.addSource('grid-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add a layer for the grid cells
      mapInstance.addLayer({
        id: 'grid-layer',
        type: 'fill-extrusion',
        source: 'grid-data',
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.7
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

      const gridSize = 0.05; // Size of each grid cell in degrees
      const gridDimension = 10; // Number of cells in each direction
      const promises = [];
      const gridFeatures = [];

      // Create grid cells around the clicked point
      for (let i = 0; i < gridDimension; i++) {
        for (let j = 0; j < gridDimension; j++) {
          const cellLng = lng + (i - gridDimension/2) * gridSize;
          const cellLat = lat + (j - gridDimension/2) * gridSize;

          // Create the grid cell polygon
          const cell = {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [cellLng, cellLat],
                [cellLng + gridSize, cellLat],
                [cellLng + gridSize, cellLat + gridSize],
                [cellLng, cellLat + gridSize],
                [cellLng, cellLat]
              ]]
            },
            properties: {}
          };

          promises.push(
            fetchAQI(cellLat + gridSize/2, cellLng + gridSize/2).then(aqi => {
              if (aqi !== null) {
                cell.properties.aqi = aqi;
                cell.properties.color = getColorForAQI(aqi);
                cell.properties.height = Math.max(500, aqi * 10); // Scale height based on AQI
                gridFeatures.push(cell);
              }
            })
          );
        }
      }

      await Promise.all(promises);

      // Update the grid layer with new data
      if (map.getSource('grid-data')) {
        map.getSource('grid-data').setData({
          type: 'FeatureCollection',
          features: gridFeatures
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
      <Navbar />
      <div
        className="fixed left-0 p-6 w-64"
        style={{
          width: '100%',
          height: '100vh',
        }}
      />

      <div
        className="position-fixed left-0 p-4"
        style={{
          zIndex: 9999,
          background: '#000000',
          width: '250px',
          height: '100vh',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0)',
          top: '80px',
        }}
      >
        <h5 className="text-xl font-bold text-white mb-6">Settings Panel</h5>

        <div className="space-y-4">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city..."
              className="w-full p-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full mt-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Search
            </button>
          </form>

          {/* Dark Mode Switch */}
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

          {/* Click Listener Toggle */}
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

          {/* AQI Legend */}
          <div className="mt-6">
            <h6 className="text-white font-semibold mb-2">AQI Legend</h6>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#00e400] mr-2"></div>
                <span className="text-white text-sm">0-50: Good</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#ffff00] mr-2"></div>
                <span className="text-white text-sm">51-100: Moderate</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#ff7e00] mr-2"></div>
                <span className="text-white text-sm">101-150: Unhealthy for Sensitive Groups</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#ff0000] mr-2"></div>
                <span className="text-white text-sm">151-200: Unhealthy</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#99004c] mr-2"></div>
                <span className="text-white text-sm">201-300: Very Unhealthy</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-[#7e0023] mr-2"></div>
                <span className="text-white text-sm">300+: Hazardous</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="flex-1 p-8 ml-64"
        style={{
          transition: 'margin-left 0.3s ease-in-out',
          marginLeft: '250px',
        }}
      >
        <div
          className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
          style={{
            height: 'calc(100vh - 8rem)',
            marginTop: '80px',
          }}
        >
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