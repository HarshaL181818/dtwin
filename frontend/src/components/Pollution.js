import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Pollution = () => {
  const mapContainerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [map, setMap] = useState(null);
  const [isClickListenerEnabled, setIsClickListenerEnabled] = useState(false);

  const hexagonRadius = 0.08; // radius of 0.08 degrees around the center

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: isDarkMode ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/light-v11',
      center: [77.209, 28.6139],
      zoom: 8,
      pitch: 60,
      bearing: -17.6,
    });

    setMap(mapInstance);

    mapInstance.on('load', () => {
      mapInstance.setLight({
        anchor: 'viewport',
        color: 'white',
        intensity: 1.5,
        position: [200, 80],
      });

      mapInstance.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#444444',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 1,
        },
      });
    });

    return () => mapInstance.remove();
  }, [isDarkMode]);

  const fetchAQI = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${process.env.REACT_APP_AQICN_TOKEN}`
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

  // Create hexagon shape
  const createHexagon = (center, radius) => {
    const hexagonCoordinates = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i;
      const offsetLng = radius * Math.cos(angle);
      const offsetLat = radius * Math.sin(angle);
      hexagonCoordinates.push([center[0] + offsetLng, center[1] + offsetLat]);
    }
    hexagonCoordinates.push(hexagonCoordinates[0]);
    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [hexagonCoordinates],
      },
      properties: {
        center: center,
      },
    };
  };

  useEffect(() => {
    if (map && isClickListenerEnabled) {
      const handleClick = async (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Clicked coordinates: Longitude ${lng}, Latitude ${lat}`);

        const largeSquareSide = 1.5;
        const divisions = 10;
        const smallSquareSide = largeSquareSide / divisions;
        const squares = [];
        const promises = [];

        // Create a grid of hexagons
        for (let i = 0; i < divisions; i++) {
          for (let j = 0; j < divisions; j++) {
            const offsetX = (i - divisions / 2 + 0.5) * smallSquareSide;
            const offsetY = (j - divisions / 2 + 0.5) * smallSquareSide;
            const smallSquareCenter = [lng + offsetX, lat + offsetY];
            const hexagon = createHexagon(smallSquareCenter, hexagonRadius);
            squares.push(hexagon);

            promises.push(
              fetchAQI(smallSquareCenter[1], smallSquareCenter[0]).then((aqi) => {
                hexagon.properties.aqi = aqi;
                return hexagon;
              })
            );
          }
        }

        const squaresWithAQI = await Promise.all(promises);

        map.addSource('hexagon-grid', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: squaresWithAQI,
          },
        });

        // Adding the hexagon grid layer with radial gradient fill (simulated)
        map.addLayer({
          id: 'hexagon-grid-layer',
          type: 'fill',
          source: 'hexagon-grid',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'aqi'],
              0,
              '#39FF14', // Neon Green (for low AQI)
              50,
              '#00FFFF', // Cyan
              100,
              '#FF00FF', // Purple for high AQI
              200,
              '#FF5733', // Neon Orange
            ],
            'fill-opacity': 0.8,
          },
        });

        // Adding hexagon outlines
        map.addLayer({
          id: 'hexagon-grid-outline',
          type: 'line',
          source: 'hexagon-grid',
          paint: {
            'line-color': '#ffffff',
            'line-width': 1,
          },
        });

        squaresWithAQI.forEach((hexagon) => {
          console.log(`Hexagon center: ${hexagon.properties.center}, AQI: ${hexagon.properties.aqi}`);
        });
      };

      map.on('click', handleClick);

      return () => map.off('click', handleClick);
    }
  }, [map, isClickListenerEnabled]);

  const toggleMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const toggleClickListener = () => {
    setIsClickListenerEnabled((prevState) => !prevState);
  };

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
        }}
      />

      <div
        className="position-fixed top-0 start-0 p-4"
        style={{
          zIndex: 9999,
          background: 'linear-gradient(135deg, #FF00FF, #00FFFF)', // Gradient background
          width: '250px',
          height: '100vh',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0)',
        }}
      >
        <h5 className="mb-4" style={{ color: '#fff' }}>Settings Panel</h5>

        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleMode}
            id="darkModeSwitch"
          />
          <label className="form-check-label" htmlFor="darkModeSwitch" style={{ color: '#fff' }}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </label>
        </div>

        <button
          className={`btn ${isClickListenerEnabled ? 'btn-danger' : 'btn-success'}`}
          onClick={toggleClickListener}
          style={{
            backgroundColor: '#FF5733', // Neon Orange
            borderColor: '#FF5733',
            color: '#fff',
          }}
        >
          {isClickListenerEnabled ? 'Disable Click Listener' : 'Enable Click Listener'}
        </button>
      </div>
    </div>
  );
};

export default Pollution;
