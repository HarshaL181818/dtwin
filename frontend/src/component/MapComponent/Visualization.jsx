import React from 'react';
import { Link } from 'react-router-dom';

const Visualization = () => {
  return (
    <div>
      <h2>Visualization Page</h2>
      
      {/* Buttons for routing to Pollution */}
      <div className="mb-3">
        <Link to="/features/Visualization/pollution" className="btn btn-primary mr-2">Pollution</Link>
        <Link to="/features/Visualization/traffic" className="btn btn-primary mr-2">Traffic</Link>
      </div>

      {/* You can add map or other content here */}
    </div>
  );
};

export default Visualization;
