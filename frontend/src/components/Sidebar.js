import React from "react";

const Sidebar = ({
  buildingWidth,
  setBuildingWidth,
  buildingHeight,
  setBuildingHeight,
  buildingColor,
  setBuildingColor,
  selectedBuilding,
  handleAddBuilding,
  handleUpdateBuilding,
  handleDeleteBuilding,
  buildings,
  handleSelectBuilding,
}) => {
  return (
    <div style={{ width: "300px", padding: "20px", backgroundColor: "#f8f9fa" }}>
      <h3>Building Controls</h3>
      <div>
        <label>Width (m): </label>
        <input
          type="number"
          value={buildingWidth}
          onChange={(e) => setBuildingWidth(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Height (m): </label>
        <input
          type="number"
          value={buildingHeight}
          onChange={(e) => setBuildingHeight(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Color: </label>
        <input
          type="color"
          value={buildingColor}
          onChange={(e) => setBuildingColor(e.target.value)}
        />
      </div>
      <button onClick={handleAddBuilding}>Add Building</button>
      {selectedBuilding && (
        <>
          <h4>Selected Building</h4>
          <button onClick={handleUpdateBuilding}>Update Building</button>
          <button onClick={() => handleDeleteBuilding(selectedBuilding.id)}>
            Delete Building
          </button>
        </>
      )}
      <h3>Buildings List</h3>
      <ul>
        {buildings.map((building) => (
          <li
            key={building.id}
            onClick={() => handleSelectBuilding(building)}
          >
            {building.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;