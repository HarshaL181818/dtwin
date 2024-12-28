import React, { useState, useEffect } from 'react';
import axios from 'axios';

// PolygonAQIManager.jsx
const PolygonAQIManager = ({ map }) => {
    const [drawMode, setDrawMode] = useState(false);
    const [points, setPoints] = useState([]);
  
    useEffect(() => {
      if (!map) return;
  
      // Add sources and layers only if they don't exist
      if (!map.getSource('polygon')) {
        map.addSource('polygon', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[]],
            },
          },
        });
      }
  
      if (!map.getLayer('polygon')) {
        map.addLayer({
          id: 'polygon',
          type: 'fill',
          source: 'polygon',
          paint: {
            'fill-color': '#0080ff',
            'fill-opacity': 0.5,
          },
        });
      }
  
      // Cleanup function
      return () => {
        if (map.getLayer('polygon')) {
          map.removeLayer('polygon');
        }
        if (map.getSource('polygon')) {
          map.removeSource('polygon');
        }
      };
    }, [map]);
  
    useEffect(() => {
      if (!map || !drawMode) return;
  
      const clickHandler = (e) => {
        const coordinates = [e.lngLat.lng, e.lngLat.lat];
        setPoints(prev => [...prev, coordinates]);
  
        // Update polygon on map
        if (map.getSource('polygon')) {
          map.getSource('polygon').setData({
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[...points, coordinates]], // Note: Removed points[0] to avoid closing polygon prematurely
            },
          });
        }
      };
  
      map.on('click', clickHandler);
      return () => map.off('click', clickHandler);
    }, [map, drawMode, points]);
  
    const handleStartDrawing = () => {
      setDrawMode(true);
      setPoints([]);
    };
  
    const handleFinishDrawing = async () => {
      if (points.length < 3) {
        alert('Please select at least 3 points to create a polygon');
        return;
      }
  
      setDrawMode(false);
      
      // Close the polygon by adding the first point again
      const closedPoints = [...points, points[0]];
      map.getSource('polygon').setData({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [closedPoints],
        },
      });
  
      // Create grid and fetch AQI data
      // ... rest of your AQI fetching logic
    };
  
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 999,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}>
        {!drawMode ? (
          <button
            onClick={handleStartDrawing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Draw Polygon
          </button>
        ) : (
          <button
            onClick={handleFinishDrawing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Finish Drawing
          </button>
        )}
      </div>
    );
  };
  
export default PolygonAQIManager;