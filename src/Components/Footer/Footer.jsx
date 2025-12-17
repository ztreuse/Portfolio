import React from 'react';
import './Footer.css';
import logo from '../../assets/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section-about">
            <img src={logo} alt="logo" className='nav-logo'/>
          </div>

          <div className="footer-section-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#hero">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section-socials">
            <h3>Connect</h3>
            <div className="social-icons">
              <a href="https://github.com/ztreuse" target="_blank" rel="noreferrer">Github</a>
              <a href="https://www.linkedin.com/in/troy-bay-57aa90391/" target="_blank" rel="noreferrer">LinkedIn</a>
              <a href="mailto:tjansenzb2021@gmail.com">Email</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <hr />
          <p>&copy; {currentYear} Troy Bay  . All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;