import { useState, useEffect, lazy, Suspense } from "react";
import { PulseBackground } from "./components/PulseBackground";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";

const About = lazy(() => import("./components/About"));
const Skills = lazy(() => import("./components/Skills"));
const Projects = lazy(() => import("./components/Projects"));
const Graveyard = lazy(() => import("./components/Graveyard"));
const Hobbies = lazy(() => import("./components/Hobbies"));
const Contact = lazy(() => import("./components/Contact"));
const Footer = lazy(() => import("./components/Footer"));

function SectionLoader() {
  return (
    <div
      style={{
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-busy="true"
      aria-label="Loading section"
    />
  );
}

interface LazySectionProps {
  children: React.ReactNode;
}

function LazySection({ children }: LazySectionProps) {
  return <Suspense fallback={<SectionLoader />}>{children}</Suspense>;
}

function App() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const sections = [
      "hero",
      "about",
      "skills",
      "projects",
      "graveyard",
      "hobbies",
      "contact",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 },
    );

    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <PulseBackground />
      <Navigation activeSection={activeSection} />
      <main id="main-content" role="main">
        <Hero />
        <LazySection>
          <About />
        </LazySection>
        <LazySection>
          <Skills />
        </LazySection>
        <LazySection>
          <Projects />
        </LazySection>
        <LazySection>
          <Graveyard />
        </LazySection>
        <LazySection>
          <Hobbies />
        </LazySection>
        <LazySection>
          <Contact />
        </LazySection>
      </main>
      <LazySection>
        <Footer />
      </LazySection>
    </div>
  );
}

export default App;
