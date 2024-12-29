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
  
  const clickMarkerRef = useRef(null);

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
        id: 'add-3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
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

      mapInstance.addSource('click-point', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      mapInstance.addLayer({
        id: 'click-marker',
        type: 'circle',
        source: 'click-point',
        paint: {
          'circle-radius': 8,
          'circle-color': '#ff0000',
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    });

    mapInstance.on('click', (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      console.log('Clicked Coordinates:', coordinates);
      setClickedLocation(coordinates);

      mapInstance.getSource('click-point').setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          properties: {}
        }]
      });
    });

    setMap(mapInstance);
    return () => mapInstance.remove();
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', gap: '20px', padding: '10px' }}>
      <div style={{ flexGrow: 1, height: '100%' }} ref={mapContainerRef} />
      {map && (
        <div 
          className="flex flex-col gap-4 overflow-auto" 
          style={{ width: '300px', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* RouteManager and BuildingManager will now take 50% height each */}
          <div style={{ flex: 1 }}>
            <RouteManager map={map} />
          </div>
          <div style={{ flex: 1 }}>
            <BuildingManager map={map} clickedLocation={clickedLocation} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Module1;
