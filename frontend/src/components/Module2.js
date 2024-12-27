import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Module2 = () => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [draw, setDraw] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  
  // States for source and destination coordinates
  const [sourceCoordinates, setSourceCoordinates] = useState('');
  const [destinationCoordinates, setDestinationCoordinates] = useState('');
  
  const [viewport, setViewport] = useState({
    center: [-74.009, 40.7128],
    zoom: 14,
    pitch: 60,
    bearing: -17.6
  });

  // New state to control if source/destination selection is enabled
  const [enableSelection, setEnableSelection] = useState(false);

  useEffect(() => {
    const mapInstance = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: viewport.center,
      zoom: viewport.zoom,
      pitch: viewport.pitch,
      bearing: viewport.bearing,
    });

    const drawInstance = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true,
      },
    });
    mapInstance.addControl(drawInstance);
    setDraw(drawInstance);

    setMap(mapInstance);

    mapInstance.on('moveend', () => {
      setViewport({
        center: mapInstance.getCenter(),
        zoom: mapInstance.getZoom(),
        pitch: mapInstance.getPitch(),
        bearing: mapInstance.getBearing(),
      });
    });

    mapInstance.on('click', (event) => {
      if (enableSelection) {
        const { lngLat } = event;

        // Check if source or destination should be set based on which one is empty
        if (!sourceCoordinates) {
          setSourceCoordinates(`${lngLat.lng.toFixed(4)}, ${lngLat.lat.toFixed(4)}`);
          mapInstance.flyTo({ center: lngLat, essential: true });
        } else if (!destinationCoordinates) {
          setDestinationCoordinates(`${lngLat.lng.toFixed(4)}, ${lngLat.lat.toFixed(4)}`);
          mapInstance.flyTo({ center: lngLat, essential: true });
        }
      }
    });

    return () => mapInstance.remove();
  }, [sourceCoordinates, destinationCoordinates, enableSelection]);

  const setRoute = () => {
    if (draw) {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const route = data.features[0];
        setSelectedRoute(route);
        const coordinates = route.geometry.coordinates;

        setRoutes((prevRoutes) => [...prevRoutes, coordinates]);

        if (map) {
          map.addSource('route' + routes.length, {
            type: 'geojson',
            data: route,
          });
          map.addLayer({
            id: 'route' + routes.length,
            type: 'line',
            source: 'route' + routes.length,
            paint: {
              'line-color': '#FF0000',
              'line-width': 4,
            },
          });
        }

        draw.deleteAll();
      }
    }
  };

  const logWaypoints = () => {
    console.log("All previously added waypoints:");
    routes.forEach((route, index) => {
      console.log(`Route ${index + 1}:`, route);
    });
  };

  // Function to calculate the shortest route using Mapbox Directions API
  // Function to calculate the shortest route using Mapbox Directions API
const calculateShortestRoute = () => {
  if (sourceCoordinates && destinationCoordinates) {
    const [sourceLng, sourceLat] = sourceCoordinates.split(',').map(Number);
    const [destinationLng, destinationLat] = destinationCoordinates.split(',').map(Number);

    // Collect all waypoints (source + custom waypoints + destination)
    const waypoints = [
      [sourceLng, sourceLat],   // Source coordinates
      ...routes.flat(),         // Flattening all custom route waypoints
      [destinationLng, destinationLat],  // Destination coordinates
    ];

    // Construct Directions API URL with multiple waypoints
    const waypointsString = waypoints.map((point) => point.join(',')).join(';');
    const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${waypointsString}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

    // Fetch the directions
    fetch(directionsUrl)
      .then(response => response.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
          const shortestRoute = data.routes[0].geometry;

          // Draw the shortest route on the map
          if (map) {
            map.addSource('shortestRoute', {
              type: 'geojson',
              data: {
                type: 'Feature',
                geometry: shortestRoute,
              },
            });

            map.addLayer({
              id: 'shortestRoute',
              type: 'line',
              source: 'shortestRoute',
              paint: {
                'line-color': '#0000FF', // Blue color for the shortest route
                'line-width': 4,
              },
            });
          }
        } else {
          console.log('No route found');
        }
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
      });
  } else {
    console.log("Source or destination is not set.");
  }
};

  

  const toggleSelectionMode = () => {
    setEnableSelection(!enableSelection);
  };

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100vh',
        }}
      />

      <div
        className="position-fixed top-0 start-0 p-4"
        style={{
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.9))',
          width: '250px',
          height: '100vh',
          borderRadius: '20px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0)',
        }}
      >
        <div className="mb-3">
          <label htmlFor="source" className="form-label">Source Coordinates</label>
          <input
            type="text"
            className="form-control"
            id="source"
            value={sourceCoordinates}
            readOnly
            onClick={toggleSelectionMode} // Enable selecting after clicking
          />
        </div>

        <div className="mb-3">
          <label htmlFor="destination" className="form-label">Destination Coordinates</label>
          <input
            type="text"
            className="form-control"
            id="destination"
            value={destinationCoordinates}
            readOnly
            onClick={toggleSelectionMode} // Enable selecting after clicking
          />
        </div>

        <button className="btn btn-success mb-3" onClick={setRoute}>
          Set Route
        </button>
        <button className="btn btn-info" onClick={logWaypoints}>
          Log All Waypoints
        </button>
        <button className="btn btn-primary mb-3" onClick={calculateShortestRoute}>
          Draw Shortest Route
        </button>
      </div>
    </div>
  );
};

export default Module2;
