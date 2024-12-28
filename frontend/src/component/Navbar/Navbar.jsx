import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 

const Navbar = () => {
  const navigate = useNavigate(); 
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(location.pathname.substring(1) || 'home'); 

  useEffect(() => {
    setActiveSection(location.pathname.substring(1) || 'home'); 
  }, [location.pathname]); 

  const handleSectionClick = (section) => {
    setActiveSection(section);
    console.log(section);
    if(section === "home"){
      navigate(`/`);
    } else {
      navigate(`/${section}`); 
    }
  };

  return (
    <nav className="bg-transparent custom-navbar">
      <ul className="flex justify-center space-x-14">
        {["home", "features", "about", "contact"].map((section) => (
          <li key={section}>
            <a 
            onClick={() => handleSectionClick(section)} 
            className={`text-white text-lg relative hover:text-white transition-all duration-300 hover:scale-110 inline-block transform 
              hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.7)]
              after:absolute after:bottom-0 after:left-0 after:w-full after:h-1.5 
              ${
                activeSection === section 
                  ? "after:scale-x-100 after:bg-gradient-to-b after:from-white after:to-white/30 active" 
                  : `after:bg-gradient-to-r after:from-white/10 after:via-white/20 after:to-white/10 
                     after:scale-x-0 hover:after:scale-x-100 hover:after:bg-gradient-to-b hover:after:from-white/30 hover:after:to-transparent`
              }
              after:transition-all after:duration-300
              before:absolute before:w-[120%] before:h-[120%] before:-left-[10%] before:-bottom-[10%]
              before:bg-gradient-to-b before:from-white/0 before:via-white/10 before:to-white/30
              before:rounded-[50%] before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`} 
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;