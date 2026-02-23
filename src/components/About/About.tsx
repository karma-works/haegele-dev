import { memo, useRef, useEffect, useState, useCallback } from "react";
import {
  useScrollAnimation,
  useParallax,
} from "../../hooks/useScrollAnimation";
import { useReducedMotion } from "../../contexts/ReduceMotionContext";
import styles from "./About.module.css";

type CodeBlockState = "open" | "minimized" | "closed";

const aboutContent = {
  title: "About Me",
  paragraphs: [
    {
      text: "I'm a passionate developer with a love for creating elegant solutions to complex problems.",
      highlight: "passionate developer",
    },
    {
      text: "With expertise in modern web technologies and a background in software architecture, I build scalable applications that deliver exceptional user experiences.",
      highlight: "modern web technologies",
    },
    {
      text: "When I'm not coding, you'll find me exploring new technologies, contributing to open source, or playing the piano.",
      highlight: "playing the piano",
    },
  ],
};

export const About = memo(function About() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.2,
  });
  const [parallaxRef, parallaxOffset] = useParallax(0.3);
  const { isReducedMotion } = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });
  const [codeBlockState, setCodeBlockState] = useState<CodeBlockState>("open");

  useEffect(() => {
    if (isReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isReducedMotion]);

  const handleClose = useCallback(() => {
    setCodeBlockState("closed");
  }, []);

  const handleMinimize = useCallback(() => {
    setCodeBlockState("minimized");
  }, []);

  const handleMaximize = useCallback(() => {
    setCodeBlockState("open");
  }, []);

  return (
    <section id="about" className={styles.section} ref={containerRef}>
      <div
        className={styles.parallaxBg}
        ref={parallaxRef}
        style={
          {
            transform: `translateY(${parallaxOffset}px)`,
            "--mouse-x": `${mousePosition.x * 100}%`,
            "--mouse-y": `${mousePosition.y * 100}%`,
          } as React.CSSProperties
        }
      />

      <div
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
        ref={contentRef}
      >
        <div className={styles.splitLayout}>
          <div className={styles.textContent}>
            <h2 className={styles.title}>
              <span className={styles.titleAccent}>//</span>{" "}
              {aboutContent.title}
            </h2>

            <div className={styles.paragraphs}>
              {aboutContent.paragraphs.map((para, index) => (
                <p
                  key={index}
                  className={styles.paragraph}
                  style={{
                    transitionDelay: `${(index + 1) * 150}ms`,
                  }}
                >
                  {renderHighlightedText(para.text, para.highlight)}
                </p>
              ))}
            </div>
          </div>

          <div className={styles.visualContent}>
            {codeBlockState !== "closed" && (
              <div className={styles.codeBlock} data-state={codeBlockState}>
                <div className={styles.codeHeader}>
                  <button
                    className={`${styles.codeDot} ${styles.codeDotClose}`}
                    onClick={handleClose}
                    aria-label="Close code block"
                    type="button"
                  />
                  <button
                    className={`${styles.codeDot} ${styles.codeDotMinimize}`}
                    onClick={handleMinimize}
                    aria-label="Minimize code block"
                    type="button"
                  />
                  <button
                    className={`${styles.codeDot} ${styles.codeDotMaximize}`}
                    onClick={handleMaximize}
                    aria-label="Maximize code block"
                    type="button"
                  />
                </div>
                {codeBlockState === "open" && (
                  <pre className={styles.codeContent}>
                    {`const developer = {
  name: "Christian Hägele",
  location: "Switzerland, Office and Home Office",
  skills: ["Java", 
           "React", 
           "Go"],
  passion: "Building things",
  coffee: Infinity
};`}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});

function renderHighlightedText(
  text: string,
  highlight: string,
): React.ReactNode {
  const parts = text.split(highlight);
  if (parts.length === 1) return text;

  return (
    <>
      {parts[0]}
      <span className={styles.highlight}>{highlight}</span>
      {parts.slice(1).join(highlight)}
    </>
  );
}

export default About;
