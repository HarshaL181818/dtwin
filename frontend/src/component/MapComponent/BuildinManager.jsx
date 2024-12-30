import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';

const BuildingManager = ({ map, clickedLocation, onBuildingUpdate }) => {
    const [buildings, setBuildings] = useState([]);

    const BUILDING_TYPES = [
        'Residential',
        'Commercial',
        'Industrial',
        'Educational',
        'Healthcare'
    ];

    // Calculate corner points of a square centered at the given point
    const createBuildingPolygon = (center, width) => {
        // Convert width from meters to degrees approximately
        // Note: This is a simplified conversion and will vary based on latitude
        const metersToDegreesAtEquator = 111319.9; // approximately at the equator
        const widthInDegrees = width / metersToDegreesAtEquator;

        // Calculate offsets for each corner (half width in each direction)
        const halfWidth = widthInDegrees / 2;

        // Calculate the four corners of the square
        const corners = [
            // Start at top-left corner and go clockwise
            [center[0] - halfWidth, center[1] - halfWidth], // Top-left
            [center[0] + halfWidth, center[1] - halfWidth], // Top-right
            [center[0] + halfWidth, center[1] + halfWidth], // Bottom-right
            [center[0] - halfWidth, center[1] + halfWidth], // Bottom-left
            [center[0] - halfWidth, center[1] - halfWidth]  // Back to start to close the polygon
        ];

        return corners;
    };

    useEffect(() => {
        if (!map) return;

        if (!map.getSource('custom-buildings')) {
            map.addSource('custom-buildings', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'custom-buildings-3d',
                type: 'fill-extrusion',
                source: 'custom-buildings',
                paint: {
                    'fill-extrusion-color': [
                        'match',
                        ['get', 'type'],
                        'Residential', '#4CAF50',
                        'Commercial', '#2196F3',
                        'Industrial', '#FF5722',
                        'Educational', '#9C27B0',
                        'Healthcare', '#E91E63',
                        '#808080' // default color
                    ],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.7
                }
            });
        }
    }, [map]);

    const updateMapBuildings = (updatedBuildings) => {
        if (!map) return;

        const features = updatedBuildings.map(building => ({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [createBuildingPolygon(building.location, building.width)]
            },
            properties: {
                id: building.id,
                height: building.height,
                width: building.width,
                type: building.type,
                emission: building.emission
            }
        }));

        const source = map.getSource('custom-buildings');
        if (source) {
            source.setData({
                type: 'FeatureCollection',
                features
            });
        }
    };

    const addBuilding = () => {
        if (!clickedLocation) {
            alert('Please click on the map to place a building');
            return;
        }
    
        const newBuilding = {
            id: Date.now(),
            location: clickedLocation,
            height: 30,
            width: 20,
            type: 'Residential',
            emission: 50,
        };
    
        const updatedBuildings = [...buildings, newBuilding];
        setBuildings(updatedBuildings);
        updateMapBuildings(updatedBuildings);
        onBuildingUpdate(updatedBuildings);
    };

    const removeBuilding = (buildingId) => {
        const updatedBuildings = buildings.filter(b => b.id !== buildingId);
        setBuildings(updatedBuildings);
        updateMapBuildings(updatedBuildings);
        onBuildingUpdate(updatedBuildings);
    };

    const updateBuilding = (buildingId, field, value) => {
        const updatedBuildings = buildings.map(building => {
            if (building.id === buildingId) {
                return { ...building, [field]: field === 'type' ? value : parseFloat(value) };
            }
            return building;
        });
        setBuildings(updatedBuildings);
        updateMapBuildings(updatedBuildings);
        onBuildingUpdate(updatedBuildings);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow h-1/2 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Buildings</h2>
                <button
                    onClick={addBuilding}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                    <PlusCircle size={16} />
                    Add
                </button>
            </div>

            <div className="space-y-4">
    {buildings.slice().reverse().map(building => (  // Reverse the buildings array
        <div key={building.id} className="border p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Building #{building.id}</h3>
                <button
                    onClick={() => removeBuilding(building.id)}
                    className="text-red-500 hover:text-red-600"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <div className="space-y-2">
                <div>
                    <label className="block text-sm text-gray-600">Building Type</label>
                    <select
                        value={building.type}
                        onChange={(e) => updateBuilding(building.id, 'type', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                    >
                        {BUILDING_TYPES.map(type => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-600">Width (m)</label>
                    <input
                        type="number"
                        value={building.width}
                        onChange={(e) => updateBuilding(building.id, 'width', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">Height (m)</label>
                    <input
                        type="number"
                        value={building.height}
                        onChange={(e) => updateBuilding(building.id, 'height', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600">Emission Rate</label>
                    <input
                        type="number"
                        value={building.emission}
                        onChange={(e) => updateBuilding(building.id, 'emission', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                        min="0"
                        max="100"
                    />
                </div>
            </div>
        </div>
    ))}
</div>

        </div>
    );
};

export default BuildingManager;