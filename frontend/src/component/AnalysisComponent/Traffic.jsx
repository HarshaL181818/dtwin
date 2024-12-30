import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from '../Navbar/Navbar';

mapboxgl.accessToken = import.meta.env.VITE_REACT_APP_MAPBOX_TOKEN;
const TOMTOM_API_KEY = import.meta.env.VITE_REACT_APP_TOMTOM_API_KEY;
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const Traffic = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState([]);
  const [trafficInsights, setTrafficInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
          zoom: 14,
          essential: true
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setError('Failed to search location');
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: darkMode ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [77.209, 28.6139],
      zoom: 14,
      pitch: 60,
      bearing: -17.6,
    });

    mapInstance.on('load', () => {
      mapInstance.addSource('traffic', {
        'type': 'vector',
        'url': 'mapbox://mapbox.mapbox-traffic-v1'
      });

      mapInstance.addLayer({
        'id': 'traffic-layer',
        'type': 'line',
        'source': 'traffic',
        'source-layer': 'traffic',
        'paint': {
          'line-width': 2,
          'line-color': [
            'match',
            ['get', 'congestion'],
            'low', '#00ff00',
            'moderate', '#ffff00',
            'heavy', '#ff0000',
            'severe', '#800000',
            '#ffffff'
          ]
        }
      });

      mapInstance.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        paint: {
          'fill-extrusion-color': '#1a1a1a',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8,
        },
      });
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      alternatives: true,
      congestion: true
    });
    
    mapInstance.addControl(directions, 'top-left');

    directions.on('route', handleRoute);
    setMap(mapInstance);

    return () => mapInstance.remove();
  }, [darkMode]);

  const handleRoute = async (e) => {
    if (e.route?.length) {
      const routeData = e.route[0].legs.flatMap(leg => 
        leg.steps.map(step => step.maneuver.location)
      );
      setRoute(routeData);
      await fetchTrafficInsights(routeData);
    }
  };

  const fetchTrafficInsights = async (routeData) => {
    try {
      const insights = [];
      for (const coord of routeData) {
        const trafficData = await fetchTrafficData(coord);
        if (trafficData) {
          insights.push({
            coordinates: coord,
            ...trafficData
          });
        }
      }
      setTrafficInsights(insights);
      await logGeminiQuery(insights);
    } catch (error) {
      console.error('Error fetching traffic insights:', error);
      setError('Failed to fetch traffic data');
    }
  };

  const fetchTrafficData = async ([lng, lat]) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${TOMTOM_API_KEY}`
      );
      const data = await response.json();
      if (data && data.flowSegmentData) {
        return {
          currentSpeed: data.flowSegmentData.currentSpeed || 0,
          freeFlowSpeed: data.flowSegmentData.freeFlowSpeed || 0,
          speedDiff: (data.flowSegmentData.freeFlowSpeed || 0) - (data.flowSegmentData.currentSpeed || 0)
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      return null;
    }
  };

  const logGeminiQuery = async (insights) => {
    try {
      setLoading(true);
      setError('');

      if (!insights || insights.length === 0) {
        throw new Error('No traffic insights available');
      }

      const formattedData = insights
        .map(({ coordinates, currentSpeed, freeFlowSpeed, speedDiff }) =>
          `Location [${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}]: ` +
          `Current Speed: ${currentSpeed}km/h, Free Flow: ${freeFlowSpeed}km/h, ` +
          `Difference: ${speedDiff.toFixed(1)}km/h`
        )
        .join('\n');

      const query = `Analyze this traffic data and provide insights:
${formattedData}

Please provide:
1. Overall congestion level (high/moderate/low)
2. Main congestion points
3. Quick recommendations
Keep it brief and clear without bold or quotes and answer in sentences`;

      const result = await model.generateContent(query);
      const response = result.response;
      if (response && response.text) {
        setGeminiResponse(response.text());
      } else {
        throw new Error('Invalid response from Gemini API');
      }
    } catch (err) {
      setError(`Failed to fetch Gemini response: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startSimulation = () => {
    if (!route.length || !map) return;
    
    const vehicleElement = document.createElement('div');
    Object.assign(vehicleElement.style, {
      width: '20px',
      height: '20px',
      backgroundColor: '#00ff00',
      borderRadius: '50%',
      border: '2px solid #ffffff',
      position: 'absolute',
    });
    
    const vehicleMarker = new mapboxgl.Marker(vehicleElement)
      .setLngLat(route[0])
      .addTo(map);

    let index = 0;

    const animate = () => {
      if (index >= route.length - 1) return;

      const start = route[index];
      const end = route[index + 1];
      const steps = 60;
      let step = 0;

      const interpolate = () => {
        if (step <= steps) {
          const progress = step / steps;
          const pos = start.map((coord, i) => coord + (end[i] - coord) * progress);
          vehicleMarker.setLngLat(pos);
          map.setCenter(pos);
          step++;
          requestAnimationFrame(interpolate);
        } else {
          index++;
          animate();
        }
      };

      interpolate();
    };

    map.flyTo({ center: route[0], zoom: 16, essential: true });
    animate();
  };

  return (
    <div className="container-fluid py-4" style={{ background: '#000' }}>
      <Navbar />
      <div className="row">
        <div
          className="col position-relative"
          style={{ height: 'calc(100vh - 85px)', marginTop: '60px' }}
        >
          <div
            style={{
              position: 'relative',
              height: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}
          >
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '100%'
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.9)',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '1.5rem',
              overflowY: 'auto',
              borderTopRightRadius: '12px',
              borderBottomRightRadius: '12px'
            }}
          >
            <h5 className="text-white mb-4">Traffic Simulation</h5>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a location..."
                className="form-control bg-dark text-white border-dark mb-2"
              />
              <button type="submit" className="btn btn-primary w-100">
                Search
              </button>
            </form>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-white">Dark Mode</span>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                />
              </div>
            </div>

            <button onClick={startSimulation} className="btn btn-success w-100 mb-3">
              Start Simulation
            </button>

            {loading && (
              <div className="d-flex align-items-center justify-content-center text-white">
                <div
                  className="spinner-border text-light"
                  role="status"
                  style={{ width: '1.5rem', height: '1.5rem', marginRight: '10px' }}
                />
                <span>Analyzing traffic...</span>
              </div>
            )}

            {error && (
              <div className="alert alert-danger mt-3">
                {error}
              </div>
            )}

            {geminiResponse && (
              <div className="mt-4">
                <h6 className="text-white">Traffic Insights:</h6>
                <p className="text-white-50 small">{geminiResponse}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Traffic;