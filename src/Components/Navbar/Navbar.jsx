import React, { useState, useEffect } from 'react';
import { HashLink } from 'react-router-hash-link'; 
import './Navbar.css';
import logo from '../../assets/logo.svg';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

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
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
              </div>
              <ul className={`nav-menu ${menuOpen ? 'open' : ''}`}>
                  <li>
                      <HashLink to="/#hero" smooth onClick={closeMenu}>Home</HashLink>
                  </li> 
                  <li className="nav-dropdown">
                      <span className={`dropdown-toggle ${menuOpen ? 'open' : ''}`}>About Me</span> 
                      <ul className={`dropdown-menu ${menuOpen ? 'open' : ''}`}> 
                          <li><HashLink to="/#about" smooth onClick={closeMenu}>About Me</HashLink></li>
                          <li><HashLink to="/#certifications" smooth onClick={closeMenu}>Certifications</HashLink></li> 
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