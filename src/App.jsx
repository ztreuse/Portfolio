import { MotionConfig } from 'motion/react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Hero from './sections/Hero';
import About from './sections/About';
import Experience from './sections/Experience';
import Certifications from './sections/Certifications';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Contact from './sections/Contact';

// reducedMotion="user" turns off transform animations for visitors who prefer reduced motion.
const App = () => (
  <MotionConfig reducedMotion="user">
    <Navbar />
    {/* overflow-x-clip stops slide-in reveals from widening the page on phones */}
    <main className="overflow-x-clip">
      <Hero />
      <About />
      <Experience />
      <Certifications />
      <Skills />
      <Projects />
      <Contact />
    </main>
    <Footer />
  </MotionConfig>
);

export default App;
