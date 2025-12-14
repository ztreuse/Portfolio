import React, { useEffect, useRef, useState } from 'react';
import './Skills.css';
import skillData from '../../assets/skills_data';

const NAVBAR_CLEARANCE = '90px'; 
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
        transform: `translateY(${offsetY * 0.2}px)`,
    };
    const groupSkillsByCategory = (skills) => {
        return skills.reduce((acc, skill) => {
            const category = skill.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(skill);
            return acc;
        }, {});
    };
    const categorizedSkills = groupSkillsByCategory(skillData);
    const getCategoryTitle = (key) => {
        switch (key) {
            case "Core":
                return "Core Web Development & Programming";
            case "Frameworks":
                return "Frameworks, Libraries & Styling";
            case "Tools":
                return "Tools, Design, and Version Control";
            case "Expertise":
                return "Other Related Expertise (Certifications)";
            default:
                return key;
        }
    };

    return (
        <section className="skills-section">
            <div 
                id="skills" 
                className="scroll-target-buffer" 
                aria-hidden="true"
                style={{
                    marginTop: `-${NAVBAR_CLEARANCE}`, 
                    paddingTop: NAVBAR_CLEARANCE,       
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    height: '0'
                }}>
            </div>

            <div 
                className="skills-parallax-bg" 
                ref={parallaxRef} 
                style={parallaxStyle}
            >
            </div>

            <div className="skills-content-overlay">
                <h2>My Core Skills & Expertise</h2>
                <p className="skills-subtitle">Bringing ideas to life with modern web technologies.</p>
                <div className="category-grid-wrapper">
                {Object.keys(categorizedSkills).map((categoryKey) => (
                    <div key={categoryKey} className="skill-category-group">
                        <h3 className="category-heading">
                            {getCategoryTitle(categoryKey)}
                        </h3>
                        <div className="skills-card-container">
                            {categorizedSkills[categoryKey].map(skill => (
                                <p className='skills-title'>{skill.title}</p>
                            ))}
                        </div>
                    </div>
                    
                ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;