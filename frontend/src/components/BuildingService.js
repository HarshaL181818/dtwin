import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/buildings";

export const loadBuildings = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error("Failed to load buildings:", error);
    throw error;
  }
};

export const addBuilding = async (building) => {
  try {
    const response = await axios.post(API_BASE_URL, building);
    return response.data;
  } catch (error) {
    console.error("Failed to add building:", error);
    throw error;
  }
};

export const updateBuilding = async (id, updatedBuilding) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updatedBuilding);
    return response.data;
  } catch (error) {
    console.error("Failed to update building:", error);
    throw error;
  }
};

export const deleteBuilding = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error("Failed to delete building:", error);
    throw error;
  }
};

export const displayBuildingOnMap = (map, building) => {
  const buildingId = `building-${building.id}`;
  const center = building.coordinates[0].reduce((acc, curr) => [
    acc[0] + curr[0],
    acc[1] + curr[1]
  ], [0, 0]).map(coord => coord / building.coordinates[0].length);

  [buildingId, `${buildingId}-label`].forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id);
    if (map.getSource(id)) map.removeSource(id);
  });

  map.addSource(buildingId, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {
        height: building.height,
        color: building.color,
        base: 0,
      },
      geometry: {
        type: "Polygon",
        coordinates: building.coordinates,
      },
    },
  });

  map.addLayer({
    id: buildingId,
    type: "fill-extrusion",
    source: buildingId,
    paint: {
      "fill-extrusion-color": building.color,
      "fill-extrusion-height": ["get", "height"],
      "fill-extrusion-base": ["get", "base"],
      "fill-extrusion-opacity": 0.8,
    },
  });

  map.addSource(`${buildingId}-label`, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: center,
      },
      properties: {
        id: building.id,
      },
    },
  });

  map.addLayer({
    id: `${buildingId}-label`,
    type: "symbol",
    source: `${buildingId}-label`,
    layout: {
      "text-field": `#${building.id}`,
      "text-anchor": "center",
      "text-size": 16,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });
};