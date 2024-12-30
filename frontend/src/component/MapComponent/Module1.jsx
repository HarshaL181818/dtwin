import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';
import BuildingManager from './BuildingManager';
import { getAQIColor } from '../../utils/aqiUtils';
import Navbar from '../Navbar/Navbar';
import '../../assets/styles/editorpage.css'

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Module1 = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [aqiData, setAqiData] = useState([]);
  const [isGridFixed, setIsGridFixed] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAQI = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${import.meta.env.VITE_REACT_APP_AQICN_TOKEN}`
      );
      const data = await response.json();
      if (data.status === 'ok') {
        return data.data.aqi;
      }
      return null;
    } catch (error) {
      console.error('Error fetching AQI:', error);
      return null;
    }
  };

  const updateGridWithAQIData = (aqiDataToUpdate) => {
    const updatedFeatures = aqiDataToUpdate.map(data => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [data.coordinates[0] - 0.00083, data.coordinates[1] + 0.00083],
          [data.coordinates[0] + 0.00083, data.coordinates[1] + 0.00083],
          [data.coordinates[0] + 0.00083, data.coordinates[1] - 0.00083],
          [data.coordinates[0] - 0.00083, data.coordinates[1] - 0.00083],
          [data.coordinates[0] - 0.00083, data.coordinates[1] + 0.00083]
        ]]
      },
      properties: {
        color: getAQIColor(data.aqi || 0),
        sectorId: data.sectorId
      }
    }));

    if (mapInstanceRef.current && mapInstanceRef.current.getSource('grid-data')) {
      mapInstanceRef.current.getSource('grid-data').setData({
        type: 'FeatureCollection',
        features: updatedFeatures
      });
    }
    setGridData(updatedFeatures);
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
            const sectorId = i * divisions + j + 1;
            aqiCoordinates.push({
              coordinates: [centerLng, centerLat],
              aqi,
              sectorId,
              impactedBy: [],
              originalAQI: aqi
            });

            return {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [[
                  [offsetLng, offsetLat],
                  [offsetLng + smallSquareSide, offsetLat],
                  [offsetLng + smallSquareSide, offsetLat - smallSquareSide],
                  [offsetLng, offsetLat - smallSquareSide],
                  [offsetLng, offsetLat]
                ]]
              },
              properties: {
                color: getAQIColor(aqi || 0),
                sectorId
              }
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
        antialias: true
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
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        });

        mapInstance.addSource('click-point', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        mapInstance.addSource('grid-data', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] }
        });

        mapInstance.addLayer({
          id: 'grid-layer',
          type: 'fill',
          source: 'grid-data',
          paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0.4,
            'fill-outline-color': '#000000'
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
            coordinates
          }
        }]
      });

      if (!isGridFixed) {
        setLoading(true);
        const { gridFeatures, aqiCoordinates } = await generateGrid(coordinates);
        setLoading(false);
        mapInstanceRef.current.getSource('grid-data').setData({
          type: 'FeatureCollection',
          features: gridFeatures
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

  const handlePostData = async () => {
    if (!gridData) return;

    try {
      await axios.post('/api/grid-data', {
        timestamp: new Date().toISOString(),
        centerCoordinates: clickedLocation,
        gridSectors: aqiData
      });
      alert('Grid data posted successfully!');
    } catch (error) {
      console.error('Error posting data:', error);
      alert('Failed to post grid data');
    }
  };

  return (
    <div className="bg-black min-h-screen">
  <Navbar />
  <div className="flex h-[calc(100vh-64px)] pt-24 gap-5 p-2.5">
    {/* Sidebar Section (Left) */}
    {map && (
      <div className="flex flex-col gap-4 w-[280px] overflow-auto">
        <div className="bg-white p-4 rounded-lg shadow h-[98%] overflow-y-auto">
          <button
            onClick={() => setIsGridFixed(!isGridFixed)}
            className={`mb-4 w-full py-2 px-4 rounded ${
              isGridFixed
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
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

          {loading && <p>Loading AQI data...</p>}

          {aqiData.length > 0 && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">Sector Data:</h3>
              <div>
                {aqiData.map((data) => (
                  <div
                    key={data.sectorId}
                    className="mb-2 p-2 bg-gray-100 rounded"
                  >
                    <p className="font-semibold">Sector {data.sectorId}</p>
                    <p>Original AQI: {data.originalAQI || 'N/A'}</p>
                    <p>Current AQI: {data.aqi || 'N/A'}</p>
                    {data.impactedBy?.length > 0 && (
                      <p>
                        Building Impacts:{' '}
                        {data.impactedBy
                          .map((b) => `#${b.buildingId}(${b.impact})`)
                          .join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* Map Section (Center) */}
    <div
      className="flex-grow h-[98%] rounded-lg border border-gray-300"
      ref={mapContainerRef}
    />

    {/* Right Panel (BuildingManager & RouteManager) */}
    <div className="flex flex-col gap-4 w-[280px] overflow-auto">
      <BuildingManager map={map} clickedLocation={clickedLocation} />
      <RouteManager map={map}/>
    </div>
  </div>
</div>

  );
  
  };
  
  export default Module1;
  