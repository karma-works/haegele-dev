import { useState, useEffect } from 'react';
import { PulseBackground } from './components/PulseBackground';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { StravaCard } from './components/Strava';
import { useViewport } from './utils/responsive';

function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const { width, breakpoint } = useViewport();

  useEffect(() => {
    const sections = ['hero', 'about', 'skills', 'projects', 'hobbies', 'contact'];
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app">
      <PulseBackground />
      <Navigation activeSection={activeSection} />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <section id="hobbies" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Hobbies Section</h2>
          <StravaCard className="max-w-md" />
        </section>
        <section id="contact" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Contact Section</h2>
        </section>
      </main>
    </div>
  );
}

export default App;
