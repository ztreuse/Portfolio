import React, { useState, useEffect } from 'react';
import { HashLink } from 'react-router-hash-link'; 
import './Navbar.css';
import logo from '../../assets/logo.svg';
import menuIcon from '../../assets/menu.png'; 
import dropdownIcon from '../../assets/dropdown.png';

// --- CUSTOM SCROLL FUNCTION ---
// Function to handle custom scroll offset for HashLink
// It takes the element to scroll to and the desired offset (in pixels)
const customScroll = (el, offset = 0) => {
    // 1. Get the element's position relative to the document
    const yCoordinate = el.getBoundingClientRect().top + window.scrollY;
    
    // 2. Scroll to the position minus the desired offset
    window.scrollTo({
        top: yCoordinate - offset, 
        behavior: 'smooth'
    });
};
// --- END CUSTOM SCROLL FUNCTION ---


const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
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

    // --- Define Offsets Here (e.g., based on section requirements) ---
    const DEFAULT_OFFSET = 90;
    const ABOUT_OFFSET = 0;
    const CERTIFICATIONS_OFFSET = 30;
    const SKILLS_OFFSET = 300;
    // -----------------------------------------------------------------


    return (
      <div className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-content">
              {/* Logo Link - Standard Offset */}
              <HashLink to="/#hero" smooth scroll={(el) => customScroll(el, DEFAULT_OFFSET)} onClick={closeMenu}>
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
                      {/* Home Link - Standard Offset */}
                      <HashLink to="/#hero" smooth scroll={(el) => customScroll(el, DEFAULT_OFFSET)} onClick={closeMenu}>Home</HashLink>
                  </li> 

                  {/* Dropdown Structure */}
                  <li className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
                      <div className="dropdown-toggle-container" onClick={toggleDropdown}>
                          
                            {/* Dropdown Parent Link - Needs care: */}
                            <HashLink 
                                to="/#about" 
                                smooth 
                                className="dropdown-toggle"
                                // Use the default scroll offset for the parent link
                                scroll={(el) => customScroll(el, DEFAULT_OFFSET)} 
                                
                                onClick={(e) => { 
                                    // If desktop (not in mobile menu), allow navigation and close menu
                                    if (window.innerWidth > 768) closeMenu();
                                    
                                    // Prevent default HashLink jump during mobile dropdown toggle
                                    // (This is handled by toggleDropdown, but good for robustness)
                                    if (window.innerWidth <= 768) e.preventDefault();
                                }}
                            >
                                About
                            </HashLink>
                            <img 
                                src={dropdownIcon} 
                                alt="Dropdown" 
                                className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} 
                            />
                      </div>

                      {/* Dropdown Menu Links */}
                      <ul className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}> 
                          <li>
                              {/* About Me Link - Standard Offset */}
                              <HashLink to="/#about" smooth scroll={(el) => customScroll(el, ABOUT_OFFSET)} onClick={closeMenu}>About Me</HashLink>
                          </li>
                          <li>
                              {/* Certifications Link - Standard Offset */}
                              <HashLink to="/#certifications" smooth scroll={(el) => customScroll(el, CERTIFICATIONS_OFFSET)} onClick={closeMenu}>Certifications</HashLink>
                          </li> 
                          <li>
                              {/* SKILLS Link - LARGE 300px OFFSET APPLIED HERE */}
                              <HashLink to="/#skills" smooth scroll={(el) => customScroll(el, SKILLS_OFFSET)} onClick={closeMenu}>Skills</HashLink>
                          </li> 
                      </ul>
                  </li>

                  <li>
                      {/* Projects Link - Standard Offset */}
                      <HashLink to="/#projects" smooth scroll={(el) => customScroll(el, DEFAULT_OFFSET)} onClick={closeMenu}>Projects</HashLink>
                  </li>
                  <li>
                      {/* Contact Link - Standard Offset */}
                      <HashLink to="/#contact" smooth scroll={(el) => customScroll(el, DEFAULT_OFFSET)} onClick={closeMenu}>Contact</HashLink>
                  </li>
              </ul>
        </div>
      </div>
    );
}

export default Navbar;