import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import About from './Components/About/About'
import Slider from './Components/Slider/Slider'

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
            {/* If you have a Contact component, you would put it here too */}
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App