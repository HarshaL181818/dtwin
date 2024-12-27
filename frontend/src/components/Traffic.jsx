import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleGenerativeAI } from '@google/generative-ai';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const TOMTOM_API_KEY = process.env.REACT_APP_TOMTOM_API_KEY;
// Initialize genAI first
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const Traffic = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState([]);
  const [trafficInsights, setTrafficInsights] = useState([]);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [geminiResponse, setGeminiResponse] = useState('');

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/traffic-day-v2',
      center: [77.209, 28.6139],
      zoom: 14,
      pitch: 60,
      bearing: -17.6,
    });

    mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
    });
    mapInstance.addControl(directions, 'top-left');

    directions.on('route', async (e) => {
      if (e.route?.length) {
        const routeData = e.route[0].legs.flatMap((leg) =>
          leg.steps.map((step) => step.maneuver.location)
        );
        setRoute(routeData);

        const insights = [];
        for (const [index, coord] of routeData.entries()) {
          const trafficData = await fetchTrafficData(coord);
          if (trafficData) {
            const { currentSpeed, freeFlowSpeed } = trafficData;
            const speedDiff = freeFlowSpeed - currentSpeed;
            insights.push({
              coordinates: coord,
              speedDiff,
              currentSpeed,
              freeFlowSpeed,
            });
          } else {
            insights.push({ coordinates: coord, speedDiff: null });
          }
        }
        setTrafficInsights(insights);

        logGeminiQuery(insights); // Log the Gemini API query
      }
    });

    setMap(mapInstance);
    return () => mapInstance.remove();
  }, []);

  const fetchTrafficData = async ([lng, lat]) => {
    try {
      const response = await fetch(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lng}&key=${TOMTOM_API_KEY}`
      );
      const data = await response.json();
      return data.flowSegmentData || null;
    } catch (error) {
      console.error('Failed to fetch traffic data:', error);
      return null;
    }
  };

  const logGeminiQuery = (insights) => {
    const formattedData = insights
      .map(
        ({ coordinates, speedDiff }) =>
          `[${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}]: Diff: ${speedDiff ?? 'N/A'}`
      )
      .join('\n');

    const query = `Here are the coordinates of steps in a route along with the difference between free flow and current speed:
${formattedData}

Provide insights:
- Is the congestion high, low, or moderate?
- What is the primary cause of congestion on this route?
- Suggest solutions to reduce congestion effectively.
- Answer in short and only say important points without any bold of italic characters`;

    console.log(query);
    fetchGeminiResponse(query);
  };

  const fetchGeminiResponse = async (query) => {
    const currentTime = Date.now();

    // Check if the limit of 15 requests per minute is exceeded
    if (requestCount >= 15 && currentTime - lastRequestTime < 60000) {
      setError('Request limit exceeded. Please wait before trying again.');
      return;
    }

    // Reset the counter after 1 minute
    if (currentTime - lastRequestTime >= 60000) {
      setRequestCount(0);
      setLastRequestTime(currentTime);
    }
      // Assuming you have a model for generating content
      // For now, we simulate the API response with a static answer
      try {
        setLoading(true);
        setRequestCount((prevCount) => prevCount + 1); // Increment the request counter
  
        const prompt = query;
        const result = await model.generateContent(prompt);
  
        setGeminiResponse(result.response.text()); // Set the response content
      } catch (err) {
        setError(`Failed to fetch Gemini response: ${err.message}`);
      } finally {
        setLoading(false);
      }
  };

  const startSimulation = () => {
    if (!route.length) {
      console.error('No route available for simulation.');
      return;
    }
    map.jumpTo({ center: route[0], zoom: 16, essential: true });
    animateVehicle();
  };

  const animateVehicle = () => {
    if (!route.length) {
      console.error('No route available for simulation.');
      return;
    }

    const vehicleElement = document.createElement('div');
    Object.assign(vehicleElement.style, {
      width: '20px',
      height: '20px',
      backgroundColor: 'red',
      borderRadius: '50%',
      position: 'absolute',
    });
    const vehicleMarker = new mapboxgl.Marker(vehicleElement).setLngLat(route[0]).addTo(map);

    let index = 0;

    const moveVehicle = () => {
      if (index < route.length - 1) {
        const start = route[index];
        const end = route[index + 1];
        const steps = 60;
        let step = 0;

        const interpolate = () => {
          if (step <= steps) {
            const progress = step / steps;
            const interpolated = start.map((coord, i) => coord + (end[i] - coord) * progress);
            vehicleMarker.setLngLat(interpolated);
            map.setCenter(interpolated);
            step++;
            requestAnimationFrame(interpolate);
          } else {
            index++;
            moveVehicle();
          }
        };

        interpolate();
      } else {
        console.log('Animation completed');
      }
    };

    map.flyTo({ center: route[0], zoom: 16, essential: true });
    moveVehicle();
  };

  return (
    <div style={{ position: 'relative', height: '100vh' }}>
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100vh', position: 'absolute', top: 0, left: 0 }}
      />
      <div
        className="position-fixed top-0 end-0 p-4"
        style={{
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.9)',
          width: '250px',
          height: '100vh',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h5>Traffic Simulation</h5>
        <button onClick={startSimulation} className="btn btn-primary mb-3">
          Start Simulation
        </button>
        {loading && (
          <div className="d-flex align-items-center justify-content-center">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: '1.5rem', height: '1.5rem', marginRight: '10px' }}
            />
            <span>Fetching insights...</span>
          </div>
        )}
        {error && <div className="text-danger mt-3">{error}</div>}
        {geminiResponse && (
          <div className="gemini-response mt-3">
            <h6>Gemini Insights:</h6>
            <p>{geminiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
  
};

export default Traffic;
