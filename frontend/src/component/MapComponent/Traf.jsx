import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import RoutManager from './RoutManager';
import BuildinManager from './BuildinManager';
import { getAQIColor } from '../../utils/aqiUtils';
import Navbar from '../Navbar/Navbar';
import '../../assets/styles/editorpage.css';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;

const Traf = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [map, setMap] = useState(null);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [aqiData, setAqiData] = useState([]);
  const [isGridFixed, setIsGridFixed] = useState(false);
  const [gridData, setGridData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [styleLoaded, setStyleLoaded] = useState(false);

  // ... keep fetchAQI, updateGridWithAQIData, and generateGrid functions the same ...

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

      // Listen for style load event
      mapInstance.on('style.load', () => {
        setStyleLoaded(true);
        
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

        // Add sources after style is loaded
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

      // Also listen for the general load event
      mapInstance.on('load', () => {
        mapInstanceRef.current = mapInstance;
        setMap(mapInstance);
      });

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
    console.log('Updated clickedLocation:', clickedLocation);
    if (!clickedLocation) {
        console.warn('Clicked location is null or undefined.');
    }
}, [clickedLocation]);

  
  useEffect(() => {
    if (!mapInstanceRef.current || !styleLoaded) return;
  
    const handleClick = async (e) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        console.log('Coordinates:', coordinates); // Debugging log for coordinates
        setClickedLocation(coordinates);
   
      
  
        if (mapInstanceRef.current.getSource('click-point')) {
            mapInstanceRef.current.getSource('click-point').setData({
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates
                  }
                }
              ]
            });
          }
          
  
      if (!isGridFixed) {
        setLoading(true);
        const { gridFeatures, aqiCoordinates } = await generateGrid(coordinates);
        setLoading(false);
  
        if (mapInstanceRef.current.getSource('grid-data')) {
          mapInstanceRef.current.getSource('grid-data').setData({
            type: 'FeatureCollection',
            features: gridFeatures,
          });
        }
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
  }, [isGridFixed, styleLoaded]);
  

  const handleBuildingUpdate = (updatedBuildings) => {
    setBuildings(updatedBuildings);
  };

  // Keep the return/render part the same...
  return (
    <div className="bg-black min-h-screen">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)] pt-24 gap-5 p-2.5">
        {map && styleLoaded && (
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

        <div
          className="flex-grow h-[98%] rounded-lg border border-gray-300"
          ref={mapContainerRef}
        />

        <div className="flex flex-col gap-4 w-[280px] overflow-auto">
          {map && styleLoaded && (
            <>
              <BuildinManager 
                map={map} 
                clickedLocation={clickedLocation} 
                onBuildingUpdate={handleBuildingUpdate}
              />
              <RoutManager 
                map={map} 
                buildings={buildings}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Traf;