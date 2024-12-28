import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AreaMarker = ({ map, onAreaMarked, onSectorsCreated }) => {
  const [markers, setMarkers] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [areaPolygon, setAreaPolygon] = useState(null);

  useEffect(() => {
    if (!map) return;

    const handleClick = (e) => {
      if (!drawing) return;
      
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      setMarkers(prev => [...prev, coordinates]);
      drawPoint(coordinates);
      drawLine();
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, drawing, markers]);

  const drawPoint = (coordinates) => {
    const pointId = `point-${markers.length}`;
    
    if (map.getLayer(pointId)) {
      map.removeLayer(pointId);
      map.removeSource(pointId);
    }

    map.addSource(pointId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        }
      }
    });

    map.addLayer({
      id: pointId,
      type: 'circle',
      source: pointId,
      paint: {
        'circle-radius': 6,
        'circle-color': '#ff0000'
      }
    });
  };

  const drawLine = () => {
    if (markers.length < 2) return;

    const lineId = 'area-line';
    if (map.getLayer(lineId)) {
      map.removeLayer(lineId);
      map.removeSource(lineId);
    }

    map.addSource(lineId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [...markers, markers[0]]
        }
      }
    });

    map.addLayer({
      id: lineId,
      type: 'line',
      source: lineId,
      paint: {
        'line-color': '#ff0000',
        'line-width': 2
      }
    });
  };

  const completeArea = async () => {
    if (markers.length < 3) {
      alert('Please mark at least 3 points to create an area');
      return;
    }

    // Create closed polygon coordinates
    const polygonCoordinates = [...markers, markers[0]];
    
    // Draw the filled polygon
    const polygonId = 'area-polygon';
    if (map.getLayer(polygonId)) {
      map.removeLayer(polygonId);
      map.removeSource(polygonId);
    }

    map.addSource(polygonId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [polygonCoordinates]
        }
      }
    });

    map.addLayer({
      id: polygonId,
      type: 'fill',
      source: polygonId,
      paint: {
        'fill-color': '#ff0000',
        'fill-opacity': 0.2
      }
    });

    setAreaPolygon(polygonCoordinates);
    setDrawing(false);
    onAreaMarked && onAreaMarked(polygonCoordinates);

    // Divide into sectors and send to backend
    try {
      const response = await axios.post('http://localhost:8080/api/sectors/divide', {
        coordinates: polygonCoordinates,
        gridSize: 0.001 // Approximately 100m grid size
      });

      if (response.data) {
        displaySectors(response.data);
        onSectorsCreated && onSectorsCreated(response.data);
      }
    } catch (error) {
      console.error('Failed to create sectors:', error);
      alert('Failed to create sectors. Please try again.');
    }
  };

  const displaySectors = (sectors) => {
    sectors.forEach((sector, index) => {
      const sectorId = `sector-${index}`;
      
      if (map.getLayer(sectorId)) {
        map.removeLayer(sectorId);
        map.removeSource(sectorId);
      }

      map.addSource(sectorId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [sector.bounds]
          }
        }
      });

      map.addLayer({
        id: sectorId,
        type: 'fill',
        source: sectorId,
        paint: {
          'fill-color': '#0080ff',
          'fill-opacity': 0.2,
          'fill-outline-color': '#0080ff'
        }
      });
    });
  };

  const resetArea = () => {
    // Remove all markers and lines
    markers.forEach((_, index) => {
      const pointId = `point-${index}`;
      if (map.getLayer(pointId)) {
        map.removeLayer(pointId);
        map.removeSource(pointId);
      }
    });

    ['area-line', 'area-polygon'].forEach(id => {
      if (map.getLayer(id)) {
        map.removeLayer(id);
        map.removeSource(id);
      }
    });

    setMarkers([]);
    setAreaPolygon(null);
    setDrawing(false);
  };

  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
      <button 
        onClick={() => setDrawing(!drawing)}
        style={{
          padding: '8px 16px',
          backgroundColor: drawing ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      >
        {drawing ? 'Cancel Drawing' : 'Start Drawing'}
      </button>
      
      {drawing && markers.length >= 3 && (
        <button
          onClick={completeArea}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px'
          }}
        >
          Complete Area
        </button>
      )}

      {areaPolygon && (
        <button
          onClick={resetArea}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Reset Area
        </button>
      )}
    </div>
  );
};

export default AreaMarker;