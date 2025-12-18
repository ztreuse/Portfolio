import React from 'react';
import './Footer.css';
import logo from '../../assets/logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section brand">
            <img src={logo} alt="Troy Bay Logo" className="footer-logo-img" onClick={scrollToTop} />
            <p className="footer-tagline">
              Building digital experiences with precision and passion. 
              Let's create something extraordinary together.
            </p>
          </div>

          {/* Links Section */}
          <div className="footer-section-group">
            <div className="footer-links">
              <h3>Navigation</h3>
              <ul>
                <li><a href="#hero">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-socials">
              <h3>Connect</h3>
              <div className="social-links">
              <a href="https://www.instagram.com/tjzbay13/" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://github.com/ztreuse" target="_blank" rel="noreferrer">Github</a>
                <a href="https://www.linkedin.com/in/troy-bay-57aa90391/" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="mailto:tjansenzb2021@gmail.com">Email</a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <hr />
          <div className="footer-copyright">
            <p>&copy; {currentYear} Troy Bay. All rights reserved.</p>
            <button className="back-to-top" onClick={scrollToTop}>Back to top ↑</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;