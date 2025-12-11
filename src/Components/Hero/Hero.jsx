import React from 'react'
import './Hero.css'
import profile_img from '../../assets/profile_img.png'
import download_img from '../../assets/download.svg'
import instagram from '../../assets/instagram.svg'
import facebook from '../../assets/facebook.svg'
import linkedin from '../../assets/linkedin.svg'
import github from '../../assets/github.svg'

const Hero = () => {
  return (

      <div className='hero'>
        <div className="hero-content">
          <h3>HELLO THERE !</h3>
          <h1>I'M TROY <span>BAY</span></h1>
          <p>FRONT-END DEVELOPER AND UI/UX DESIGNER </p>
          <div className="socials">
            <a href="https://www.instagram.com/tjzbay13/" className="insta-icon"><img src={instagram} alt="" /></a>
            <a href="https://www.facebook.com/troyjansen.bay" className="fb-icon"><img src={facebook} alt="" /></a>
            <a href="https://www.linkedin.com/in/troy-bay-57aa90391/" className="linkedin-icon"><img src={linkedin} alt="" /></a>
            <a href="https://github.com/ztreuse" className="github-icon"><img src={github} alt="" /></a>
          </div>
          <div className="hero-action">
            <div className="hero-connect"><img src={download_img} alt="" />Download Resume</div>
          </div>
        {/* <img src={profile_img} alt="" /> */}
        </div>
      </div>

  )
}

export default Hero