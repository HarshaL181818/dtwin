import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';
import BuildingManager from './BuildingManager';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;
const Module1 = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    gap: '20px',
    padding: '10px',
  };

  const mapStyle = {
    flexGrow: 1,
    height: '100%',
  };

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [77.5946, 12.9716],
      zoom: 15,
      pitch: 60,
      bearing: -45,
      antialias: true,
    });

    mapInstance.on('load', () => {
      mapInstance.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.6,
        },
      });
    });

    mapInstance.on('click', (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setClickedLocation(coordinates);
    });

    setMap(mapInstance);

    return () => mapInstance.remove();
  }, []);

  return (
    <div style={containerStyle}>
      <div style={mapStyle} ref={mapContainerRef} />
      <RouteManager map={map} />
      <BuildingManager map={map} clickedLocation={clickedLocation} />
    </div>
  );
};

export default Module1;