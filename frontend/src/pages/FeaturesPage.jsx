import React from 'react';
import Navbar from '../component/Navbar/Navbar';
import { Link } from 'react-router-dom';

const FeaturesPage = () => {
  return (
    <div className="mt-5">
      <Navbar />
      <div className="mt-12 feature-page">
        <div className="container mx-auto my-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="group">
              <div className="relative transform transition-all duration-300 hover:-translate-y-2">
                {/* Default shadow */}
                <div className="absolute -inset-1 bg-black/5 rounded-2xl blur-lg transition-all duration-300"></div>
                {/* Hover gradient shadow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white via-blue-100 to-white rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative bg-gray-100/50 p-8 rounded-2xl shadow-lg overflow-hidden">
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img 
                      src="/image1.png" 
                      alt="Developing Cities"
                      className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Developing Cities</h2>
                  <p>Plan and design new urban areas, with our editor tool.</p>
                  <button
                    onClick={() => handleExplore('/features/module1')}
                    className="inline-block mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
            
            <div className="group">
              <div className="relative transform transition-all duration-300 hover:-translate-y-2">
                {/* Default shadow */}
                <div className="absolute -inset-1 bg-black/5 rounded-2xl blur-lg transition-all duration-300"></div>
                {/* Hover gradient shadow */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white via-blue-100 to-white rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="relative bg-gray-100/50 p-8 rounded-2xl shadow-lg overflow-hidden">
                  <div className="mb-6 rounded-xl overflow-hidden">
                    <img 
                      src="/image2.png" 
                      alt="Developed Cities"
                      className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Developed Cities</h2>
                  <p>Analyze and optimize existing urban environments.</p>
                  <button
                    onClick={() => handleExplore('/features/visualization')}
                    className="inline-block mt-4 bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition-colors duration-200"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
