import { useState, useEffect } from 'react';
import { PulseBackground } from './components/PulseBackground';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
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
        <section id="about" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>About Section</h2>
        </section>
        <section id="skills" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Skills Section</h2>
        </section>
        <section id="projects" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Projects Section</h2>
        </section>
        <section id="hobbies" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Hobbies Section</h2>
        </section>
        <section id="contact" style={{ minHeight: '100vh', padding: '2rem' }}>
          <h2>Contact Section</h2>
        </section>
      </main>
    </div>
  );
}

export default App;
