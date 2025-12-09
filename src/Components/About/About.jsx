import React, { useEffect, useRef } from 'react'
import './About.css'
import profile_img from '../../assets/profile_img.png'

const About = () => {

  return (
    <div className='about'>
      <div className="about-wrapper">
        <img src={profile_img} alt="" className='about_img'/>
        <div className="about-sections">
          <div className="about-title">
            <h1>About me</h1>
          </div>
          <div className="about-para">
            <p>
              I believe that great design is defined by its function. I specialize
              in taking raw concepts and meticulously transforming them into
              pixel-perfect, intuitive, and high-performance web experiences. I
              combine a passion for user-centered design with a commitment to
              writing clean, efficient code to ensure the final result is both
              beautiful and reliable.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
