import React from 'react';
import { Link } from 'react-router-dom';

function Base() {
  return (
    <div>
      <h1>Welcome to the Traffic and Pollution Simulation</h1>
      <div>
        <Link to="/module1">
          <button>Go to Module 1</button>
        </Link>
        <Link to="/module2">
          <button>Go to Module 2</button>
        </Link>
        <Link to="/Visualization">
          <button>Go to Visualization</button>
        </Link>
        <Link to="/Shortest">
          <button>Routing</button>
        </Link>
      </div>
    </div>
  );
}

export default Base;
