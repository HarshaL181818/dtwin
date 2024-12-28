import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Base from './components/Base';
import Module1 from './components/Module1';
import Visualization from './components/Visualization';
import ShortestRouteFinder from './components/ShortestRouteFinder';
import Pollution from './components/Pollution';
import Traffic from './components/Traffic';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Base />} />
        <Route path="/module1" element={<Module1 />} />
        <Route path="/Visualization" element={<Visualization />} />
        <Route path="/Shortest" element={<ShortestRouteFinder />} />
        <Route path="/pollution" element={<Pollution />} />
        <Route path="/traffic" element={<Traffic />} />
      </Routes>
    </Router>
  );
}

export default App;
