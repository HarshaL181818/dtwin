import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';
import BuildingManager from './BuildingManager';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Module1 = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [aqiData, setAqiData] = useState([]);
  const clickMarkerRef = useRef(null);
  const [isGridFixed, setIsGridFixed] = useState(false);
  const [gridData, setGridData] = useState(null);

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
    if (aqi <= 50) return '#66ff66';
    if (aqi <= 100) return '#ffff66';
    if (aqi <= 150) return '#ff9966';
    if (aqi <= 200) return '#ff6666';
    if (aqi <= 300) return '#cc33cc';
    return '#cc0000';
  };

  const handlePostData = async () => {
    if (!gridData) {
      console.log('No grid data available to post');
      return;
    }

    const dataToPost = {
      timestamp: new Date().toISOString(),
      centerCoordinates: clickedLocation,
      gridSectors: aqiData.map((data, index) => ({
        sectorId: index + 1,
        coordinates: data.coordinates,
        aqi: data.aqi
      }))
    };

    try {
      const response = await axios.post('/api/grid-data', dataToPost);
      console.log('Data posted successfully:', response.data);
      alert('Grid data posted successfully!');
    } catch (error) {
      console.error('Error posting data:', error);
      alert('Failed to post grid data');
    }
  };

  const generateGrid = async (coordinates) => {
    const largeSquareSide = 0.01;
    const divisions = 6;
    const smallSquareSide = largeSquareSide / divisions;
    const promises = [];
    const aqiCoordinates = [];

    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const offsetLng = coordinates[0] + (i - divisions / 2) * smallSquareSide;
        const offsetLat = coordinates[1] + (j - divisions / 2) * smallSquareSide;

        const centerLat = offsetLat - smallSquareSide / 2;
        const centerLng = offsetLng + smallSquareSide / 2;

        promises.push(
          fetchAQI(centerLat, centerLng).then((aqi) => {
            aqiCoordinates.push({
              coordinates: [centerLng, centerLat],
              aqi,
              sectorId: i * divisions + j + 1
            });

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
                sectorId: i * divisions + j + 1
              },
            };
          })
        );
      }
    }

    const gridFeatures = await Promise.all(promises);
    return { gridFeatures, aqiCoordinates };
  };

  useEffect(() => {
    const initializeMap = () => {
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
            'fill-outline-color': '#FFFFFF',
          },
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

      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);

      return mapInstance;
    };

    const mapInstance = initializeMap();

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleClick = async (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setClickedLocation(coordinates);
      
      mapInstanceRef.current.getSource('click-point').setData({
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

      if (!isGridFixed) {
        const { gridFeatures, aqiCoordinates } = await generateGrid(coordinates);
        
        mapInstanceRef.current.getSource('grid-data').setData({
          type: 'FeatureCollection',
          features: gridFeatures,
        });

        setGridData(gridFeatures);
        setAqiData(aqiCoordinates);
      }
    };

    mapInstanceRef.current.on('click', handleClick);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('click', handleClick);
      }
    };
  }, [isGridFixed]);

  return (
    <div style={{ display: 'flex', height: '100vh', gap: '20px', padding: '10px' }}>
      <div style={{ flexGrow: 1, height: '100%' }} ref={mapContainerRef} />
      {map && (
        <div className="flex flex-col gap-4 overflow-auto" style={{ width: '300px' }}>
          <div className="bg-white p-4 rounded-lg shadow">
            <button 
              onClick={() => setIsGridFixed(!isGridFixed)}
              className={`mb-4 w-full py-2 px-4 rounded ${
                isGridFixed ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isGridFixed ? 'Unfix Grid' : 'Fix Grid'}
            </button>
            
            {gridData && (
              <button 
                onClick={handlePostData}
                className="w-full py-2 px-4 rounded bg-green-500 hover:bg-green-600 text-white mb-4"
              >
                Post Grid Data
              </button>
            )}

            {aqiData.length > 0 && (
              <div className="mt-4">
                <h3 className="font-bold mb-2">Sector Data:</h3>
                <div className="max-h-96 overflow-y-auto">
                  {aqiData.map((data, index) => (
                    <div key={index} className="mb-2 p-2 bg-gray-100 rounded">
                      <p className="font-semibold">Sector {data.sectorId}</p>
                      <p>Coordinates: [{data.coordinates[0].toFixed(4)}, {data.coordinates[1].toFixed(4)}]</p>
                      <p>AQI: {data.aqi || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <RouteManager map={map} />
          <BuildingManager map={map} clickedLocation={clickedLocation} />
        </div>
      )}
    </div>
  );
};

export default Module1;
