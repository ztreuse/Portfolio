import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import About from './Components/About/About'
import Slider from './Components/Slider/Slider'
import Skills from './Components/Skills/Skills'
import Projects from './Components/Projects/Projects'
import Footer from './Components/Footer/Footer'

const App = () => {
  return (
    <BrowserRouter> 
      {/* Navbar stays outside the Routes, so it is always visible */}
      <Navbar />
      
      <Routes> 
        {/* All components are rendered on the root path for a single-page layout */}
        <Route path="/" element={
          <> 
            <Hero />
            <About />
            <Slider />
            <Skills />
            <Projects />
            <Footer />
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App