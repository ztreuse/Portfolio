import React, { useState } from 'react';
import './Projects.css';
import Projects_Data from '../../assets/projects_data'; 
import grid from '../../assets/grid.png';
import list from '../../assets/list.png';

const ProjectCard = ({ project }) => (
    <div className='project-card'>
        <div className="project-img-container">
            <a href={project.p_link} target="_blank" rel="noopener noreferrer">
                <img src={project.p_img} alt={project.p_name} className="project-img" />
            </a>
        </div>
        <div className="project-info">
            <h3 className="project-name">{project.p_name}</h3>
            <p className="project-desc">{project.p_desc}</p>
            <div className="project-tools">
                {project.p_tools.map((tool, index) => (
                    <span key={index} className="tool-tag">
                        {tool}
                    </span>
                ))}
            </div>
            <a 
                href={project.p_link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="project-link"
            >
                View Project{/*  &rarr; */}
            </a>
        </div>
    </div>
);


const Projects = () => {
    // State to toggle between 'grid' and 'column' view
    const [viewMode, setViewMode] = useState('grid'); 

    return (
        <div className='projects' id='projects'>
            <div className="projects-header">
            <h2 className="projects-title">My Projects & Certifications</h2>
            
            <div className="view-controls">
                <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Display as Grid"
                >
                    <img src={grid} alt="" />
                </button>
                <button 
                    className={`view-btn ${viewMode === 'column' ? 'active' : ''}`}
                    onClick={() => setViewMode('column')}
                    aria-label="Display as Vertical Column"
                >
                    <img src={list} alt="" />
                </button>
            </div>
            </div>

            {/* Project List Container */}
            <div className={`projects-container ${viewMode}`}>
                {Projects_Data.map((project, index) => (
                    <ProjectCard key={index} project={project} />
                ))}
            </div>
        </div>
    );
}

export default Projects;