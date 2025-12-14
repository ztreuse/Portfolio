// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { HashLink } from 'react-router-hash-link'; 
import './Navbar.css';
import logo from '../../assets/logo.svg';
import menuIcon from '../../assets/menu.png'; 
// New: Import the dropdown icon
import dropdownIcon from '../../assets/dropdown.png'; // Assuming you have 'dropdown.png' in assets

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    // New State for the mobile 'About Me' dropdown
    const [dropdownOpen, setDropdownOpen] = useState(false); 

    // Function to close both the main menu and dropdown
    const closeMenu = () => {
        setMenuOpen(false);
        setDropdownOpen(false); // Close dropdown when closing main menu
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        // Optionally close dropdown if closing main menu
        if (menuOpen) {
            setDropdownOpen(false);
        }
    };
    
    // New function to toggle only the 'About Me' dropdown
    const toggleDropdown = (e) => {
        // Prevent HashLink navigation if it's a mobile click
        e.preventDefault(); 
        setDropdownOpen(!dropdownOpen);
    }

    useEffect(() => {
      const handleScroll = () => {
          if (window.scrollY > 50) { 
              setScrolled(true);
          } else {
              setScrolled(false);
          }
      };

      window.addEventListener('scroll', handleScroll);
      
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    return (
      <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
          <div className="navbar-content">
              <HashLink to="/#hero" smooth onClick={closeMenu}>
                  <img src={logo} alt="logo" className='nav-logo'/>
              </HashLink>
              <div className="menu-icon" onClick={toggleMenu}>
                  <img 
                      src={menuIcon} 
                      alt="Menu Icon" 
                      className="menu-image"
                  />
              </div>
              <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                  <li>
                      <HashLink to="/#hero" smooth onClick={closeMenu}>Home</HashLink>
                  </li> 
                  {/* Updated Dropdown Structure */}
                  <li className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
                        {/* Parent link container */}
                      <div className="dropdown-toggle-container" onClick={toggleDropdown}>
                            {/* The link itself - always active, but toggleDropdown prevents navigation on click */}
                            <HashLink 
                                to="/#about" 
                                smooth 
                                className="dropdown-toggle"
                                // The onClick here is for desktop only; mobile uses the div click
                                onClick={(e) => { 
                                    if (window.innerWidth > 768) closeMenu();
                                }}
                            >
                                About Me
                            </HashLink>
                            {/* Dropdown Icon - Only visible/relevant on mobile */}
                            <img 
                                src={dropdownIcon} 
                                alt="Dropdown" 
                                className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} 
                            />
                        </div>
                      {/* Dropdown Menu - Controlled by state for mobile max-height */}
                      <ul className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}> 
                          <li><HashLink to="/#about" smooth onClick={closeMenu}>About Me</HashLink></li>
                          <li><HashLink to="/#certifications" smooth onClick={closeMenu}>Certifications</HashLink></li> 
                          <li><HashLink to="/#skills" smooth onClick={closeMenu}>Skills</HashLink></li> 
                      </ul>
                  </li>
                  <li><HashLink to="/#projects" smooth onClick={closeMenu}>Projects</HashLink></li>
                  <li><HashLink to="/#contact" smooth onClick={closeMenu}>Contact</HashLink></li>
              </ul>
          </div>
      </div>
    );
}

export default Navbar;