import React, { useState, useEffect } from 'react'; // 1. Import useState
import './Navbar.css';
import logo from '../../assets/logo.svg';

const Navbar = () => {
    // 2. State to manage the mobile menu visibility
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // 3. Function to toggle the menu
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
      const handleScroll = () => {
          // Set a threshold (e.g., 50px) to trigger the change
          if (window.scrollY > 50) { 
              setScrolled(true);
          } else {
              setScrolled(false);
          }
      };

      window.addEventListener('scroll', handleScroll);
      
      // Cleanup function to remove the listener when the component unmounts
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

    return (
      <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-content">
                <img src={logo} alt="logo" className='nav-logo'/>
                
                {/* 4. Hamburger Icon (Visible on mobile only) */}
                <div className="menu-icon" onClick={toggleMenu}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>

                {/* 5. Apply 'open' class based on state */}
                <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                    <li>Home</li>
                    <li>About Me</li>
                    <li>Projects</li>
                    <li>Contact</li>
                </ul>
            </div>            
        </div>
    );
}

export default Navbar;