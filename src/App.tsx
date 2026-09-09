import { useState, useEffect, lazy, Suspense } from "react";
import { Navigation } from "./components/Navigation";
import { Hero } from "./components/Hero";

const AgentInterface = lazy(() => import("./components/AgentInterface"));
const About = lazy(() => import("./components/About"));
const Skills = lazy(() => import("./components/Skills"));
const Projects = lazy(() => import("./components/Projects"));
const Graveyard = lazy(() => import("./components/Graveyard"));
const Hobbies = lazy(() => import("./components/Hobbies"));
const AIFeed = lazy(() => import("./components/AIFeed"));
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
    const controller = new AbortController();
    const register = () => {
      void import("./webmcp").then(({ registerWebMCPTools }) =>
        registerWebMCPTools(controller.signal)
      ).catch(() => { /* Optional browser integration must not disrupt the page. */ });
    };
    const idle = typeof window.requestIdleCallback === "function";
    const handle = idle ? window.requestIdleCallback(register, { timeout: 2000 }) : window.setTimeout(register, 0);
    return () => {
      controller.abort();
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, []);

  useEffect(() => {
    const sections = [
      "hero",
      "about",
      "skills",
      "projects",
      "graveyard",
      "hobbies",
      "contact",
      "agents",
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

    const observed = new Set<Element>();
    const observeSections = () => sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element && !observed.has(element)) {
        observer.observe(element);
        observed.add(element);
      }
    });
    observeSections();
    const mutations = new MutationObserver(observeSections);
    mutations.observe(document.getElementById("main-content")!, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
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
          <AIFeed />
        </LazySection>
        <LazySection>
          <AgentInterface />
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
