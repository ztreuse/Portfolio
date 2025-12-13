import React, { useEffect, useRef, useState } from 'react';
import './Skills.css';
import skillData from '../../assets/skills_data';

const Skills = () => {
  const parallaxRef = useRef(null);
  const [offsetY, setOffsetY] = useState(0);
  const handleScroll = () => {
    if (parallaxRef.current) {
        setOffsetY(window.scrollY);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); 

  const parallaxStyle = {
    transform: `translateY(-${offsetY * 0.3}px)`,
  };

  return (
    <section className="skills-section" id="skills">
      <div 
        className="skills-parallax-bg" 
        ref={parallaxRef} 
        style={parallaxStyle}
      >
      </div>

      <div className="skills-content-overlay">
        <h2>My Core Skills & Expertise</h2>
        <p className="skills-subtitle">Bringing ideas to life with modern web technologies.</p>
        
        <div className="skills-card-container">
          {skillData.map(skill => (
            <div key={skill.id} className="skill-card">
              <div className="skill-icon"><img src={skill.icon} /></div>
              <h3>{skill.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;