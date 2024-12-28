import React from 'react';
import Navbar from '../component/Navbar/Navbar';
import { Link } from 'react-router-dom';
import '../assets/styles/featurepage.css';

const FeaturesPage = () => {
  return (
    <div className="mt-5">
      <Navbar />
      <div className="mt-12 feature-page">
        <div className="container mx-auto my-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-100/50 p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Developing Cities</h2>
              <p>Plan and design new urban areas.</p>
              <Link
                to="/features/module1"
                className="inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                Explore
              </  Link>
            </div>
            <div className="bg-gray-100/50 p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-4">Developed Cities</h2>
              <p>Analyze and optimize existing urban environments.</p>
              <Link
                to="/features/Visualization"
                className="inline-block bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200"
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
