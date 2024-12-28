import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Pollution = () => {
  const mapContainerRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [map, setMap] = useState(null);
  const [isClickListenerEnabled, setIsClickListenerEnabled] = useState(false);

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
          // Increase the heatmap weight based on AQI value
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'aqi'],
            0, 0,
            200, 1
          ],
          // Increase the heatmap color weight by zoom level
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            15, 3
          ],
          // Color gradient based on AQI values
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
          // Adjust the radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 20,
            15, 50
          ],
          // Opacity based on zoom level
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
          'fill-extrusion-color': '#444444',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.6,
        },
      });
    });

    return () => mapInstance.remove();
  }, [isDarkMode]);

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
    if (map && isClickListenerEnabled) {
      const handleClick = async (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Clicked coordinates: Longitude ${lng}, Latitude ${lat}`);

        const largeSquareSide = 1.5;
        const divisions = 15; // Increased divisions for smoother heatmap
        const smallSquareSide = largeSquareSide / divisions;
        const points = [];
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
        map.getSource('heatmap-data').setData({
          type: 'FeatureCollection',
          features: pointsWithAQI.filter(point => point.properties.aqi !== null),
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
          background: 'linear-gradient(135deg, #FF00FF, #00FFFF)',
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
            backgroundColor: '#FF5733',
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