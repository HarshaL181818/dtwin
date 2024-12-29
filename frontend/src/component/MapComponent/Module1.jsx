import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RouteManager from './RoutesManager';
import BuildingManager from './BuildingManager';
import { getAQIColor } from '../../utils/aqiUtils';
import Navbar from '../Navbar/Navbar';
import '../../assets/styles/editorpage.css'

  // Move token to environment variable
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
    const [error, setError] = useState(null);

    // Improved error handling for AQI fetching
    const fetchAQI = async (lat, lng) => {
      try {
        const response = await axios.get(
          `https://api.waqi.info/feed/geo:${lat};${lng}/?token=${import.meta.env.VITE_REACT_APP_AQICN_TOKEN}`
        );
        
        if (response.data.status === 'ok') {
          return response.data.data.aqi;
        }
        throw new Error('Invalid AQI data received');
      } catch (error) {
        console.error('Error fetching AQI:', error);
        setError('Failed to fetch AQI data');
        return null;
      }
    };

    // Improved grid generation with error handling and cleanup
    const generateGrid = async (coordinates) => {
      const gridConfig = {
        largeSquareSide: 0.01,
        divisions: 6
      };
      
      const smallSquareSide = gridConfig.largeSquareSide / gridConfig.divisions;
      const promises = [];
      const aqiCoordinates = [];

      for (let i = 0; i < gridConfig.divisions; i++) {
        for (let j = 0; j < gridConfig.divisions; j++) {
          const offsetLng = coordinates[0] + (i - gridConfig.divisions / 2) * smallSquareSide;
          const offsetLat = coordinates[1] + (j - gridConfig.divisions / 2) * smallSquareSide;

          const centerLat = offsetLat - smallSquareSide / 2;
          const centerLng = offsetLng + smallSquareSide / 2;
          const sectorId = i * gridConfig.divisions + j + 1;

          promises.push(
            fetchAQI(centerLat, centerLng).then((aqi) => ({
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
              },
              aqiInfo: {
                coordinates: [centerLng, centerLat],
                aqi,
                sectorId,
                originalAQI: aqi
              }
            }))
          );
        }
      }

      try {
        const results = await Promise.all(promises);
        const gridFeatures = results.map(result => ({
          type: 'Feature',
          geometry: result.geometry,
          properties: result.properties
        }));
        
        const aqiCoordinates = results.map(result => result.aqiInfo);
        
        return { gridFeatures, aqiCoordinates };
      } catch (error) {
        setError('Failed to generate grid');
        throw error;
      }
    };

    // Improved map initialization with error handling
    useEffect(() => {
      if (!mapboxgl.supported()) {
        setError('Your browser does not support Mapbox GL');
        return;
      }

      const initializeMap = () => {
        try {
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
            setupMapLayers(mapInstance);
          });

          mapInstanceRef.current = mapInstance;
          setMap(mapInstance);
        } catch (error) {
          setError('Failed to initialize map');
          console.error('Map initialization error:', error);
        }
      };

      initializeMap();

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }
      };
    }, []);

    // Separate function for setting up map layers
    const setupMapLayers = (mapInstance) => {
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
    };

    // Improved click handler with debouncing
    useEffect(() => {
      if (!mapInstanceRef.current) return;

      let timeoutId;
      const handleClick = async (e) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        setClickedLocation(coordinates);

        if (mapInstanceRef.current) {
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
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              try {
                setLoading(true);
                setError(null);
                const { gridFeatures, aqiCoordinates } = await generateGrid(coordinates);
                
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.getSource('grid-data').setData({
                    type: 'FeatureCollection',
                    features: gridFeatures
                  });
                }
                
                setGridData(gridFeatures);
                setAqiData(aqiCoordinates);
              } catch (error) {
                setError('Failed to update grid');
                console.error('Grid generation error:', error);
              } finally {
                setLoading(false);
              }
            }, 300);
          }
        }
      };

      mapInstanceRef.current.on('click', handleClick);

      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.off('click', handleClick);
        }
        clearTimeout(timeoutId);
      };
    }, [isGridFixed]);

    // Improved data posting with validation and error handling
    const handlePostData = async () => {
      if (!gridData || !aqiData || !clickedLocation) {
        setError("Please generate the grid before posting data.");
        return;
      }

      const payload = {
        timestamp: new Date().toISOString(),
        centerCoordinates: clickedLocation,
        gridSectors: aqiData
      };

      try {
        setLoading(true);
        setError(null);
        const response = await axios.post('http://localhost:8080/api/sector', payload);
        console.log("Post response:", response.data);
        alert('Grid data posted successfully!');
      } catch (error) {
        setError('Failed to post grid data');
        console.error('Error posting data:', error);
      } finally {
        setLoading(false);
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
      <RouteManager />
    </div>
  </div>
</div>

  );
  
  };

  export default Module1;