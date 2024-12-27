import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav style={{ background: '#333', color: 'white', padding: '10px' }}>
    <h2>Traffic and Pollution Simulator</h2>
    <ul style={{ listStyleType: 'none', display: 'flex', gap: '15px' }}>
      <li><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link></li>
      <li><Link to="/module1" style={{ color: 'white', textDecoration: 'none' }}>Module 1</Link></li>
      <li><Link to="/module2" style={{ color: 'white', textDecoration: 'none' }}>Module 2</Link></li>
    </ul>
  </nav>
);

export default Navbar;
