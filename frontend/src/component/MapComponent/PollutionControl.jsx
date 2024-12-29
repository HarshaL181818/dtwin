import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const PollutionControl = () => {
  const mapContainerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [map, setMap] = useState(null);
  const [isClickListenerEnabled, setIsClickListenerEnabled] = useState(false);
  
  // Array to store AQI data with coordinates
  const [aqiData, setAqiData] = useState([]);

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

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#66ff66'; // Green (lighter)
    if (aqi <= 100) return '#ffff66'; // Yellow (lighter)
    if (aqi <= 150) return '#ff9966'; // Orange (lighter)
    if (aqi <= 200) return '#ff6666'; // Red (lighter)
    if (aqi <= 300) return '#cc33cc'; // Purple (lighter)
    return '#cc0000'; // Maroon (lighter)
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [77.209, 28.6139],
      zoom: 14,
    });

    setMap(mapInstance);

    mapInstance.on('load', () => {
      mapInstance.addLayer({
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.6,
        },
      });

      mapInstance.addSource('grid-data', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      mapInstance.addLayer({
        id: 'grid-layer',
        type: 'fill',
        source: 'grid-data',
        paint: {
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.4,
          'stroke-color': '#FFFFFF',
          'stroke-width': 2,
          'stroke-opacity': 0.8,
        },
      });
    });

    return () => mapInstance.remove();
  }, [isDarkMode]);

  useEffect(() => {
    if (!map || !isClickListenerEnabled) return;

    const handleClick = async (event) => {
      const { lng, lat } = event.lngLat;
      console.log(`Clicked coordinates: Longitude ${lng}, Latitude ${lat}`);

      const largeSquareSide = 0.01;
      const divisions = 6;
      const smallSquareSide = largeSquareSide / divisions;
      const promises = [];
      const aqiCoordinates = []; // Array to store AQI data with coordinates

      for (let i = 0; i < divisions; i++) {
        for (let j = 0; j < divisions; j++) {
          const offsetLng = lng + (i - divisions / 2) * smallSquareSide;
          const offsetLat = lat + (j - divisions / 2) * smallSquareSide;

          const centerLat = offsetLat - smallSquareSide / 2;
          const centerLng = offsetLng + smallSquareSide / 2;

          promises.push(
            fetchAQI(centerLat, centerLng).then((aqi) => {
              aqiCoordinates.push({ coordinates: [centerLng, centerLat], aqi });

              const topLeft = [offsetLng, offsetLat];
              const topRight = [offsetLng + smallSquareSide, offsetLat];
              const bottomRight = [offsetLng + smallSquareSide, offsetLat - smallSquareSide];
              const bottomLeft = [offsetLng, offsetLat - smallSquareSide];

              return {
                type: 'Feature',
                geometry: {
                  type: 'Polygon',
                  coordinates: [[topLeft, topRight, bottomRight, bottomLeft, topLeft]],
                },
                properties: {
                  color: getAQIColor(aqi || 0),
                },
              };
            })
          );
        }
      }

      const gridFeatures = await Promise.all(promises);

      if (map.getSource('grid-data')) {
        map.getSource('grid-data').setData({
          type: 'FeatureCollection',
          features: gridFeatures,
        });
      }

      // Log the AQI data for the center of each square
      console.log(aqiCoordinates);
      setAqiData(aqiCoordinates); // Store AQI data in state
    };

    map.on('click', handleClick);
    return () => map.off('click', handleClick);
  }, [map, isClickListenerEnabled]);

  return (
    <div className="min-h-screen bg-black flex">
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

      <div className="flex-1 p-8 ml-64">
        <div
          className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl"
          style={{ height: 'calc(100vh - 4rem)' }}
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

export default PollutionControl;