import React from 'react'
import Navbar from './Components/Navbar/Navbar'
import Hero from './Components/Hero/Hero'
import About from './Components/About/About'
import Slider from './Components/Slider/Slider'

const App = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <About />
      <Slider />
    </div>
  )
}

export default App