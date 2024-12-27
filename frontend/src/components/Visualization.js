import React from 'react';
import { Link } from 'react-router-dom';  // For navigation

const Visualization = () => {
  return (
    <div>
      <h2>Visualization Page</h2>
      
      {/* Buttons for routing to Pollution */}
      <div className="mb-3">
        <Link to="/pollution" className="btn btn-primary mr-2">Pollution</Link>
        <Link to="/traffic" className="btn btn-primary mr-2">Traffic</Link>
        <Link to="/pollution" className="btn btn-primary mr-2">Pollution 3</Link>
      </div>

      {/* You can add map or other content here */}
    </div>
  );
};

export default Visualization;
