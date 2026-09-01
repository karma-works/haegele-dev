import { memo, useRef, useEffect, useState, useCallback } from "react";
import {
  useScrollAnimation,
  useParallax,
} from "../../hooks/useScrollAnimation";
import { useReducedMotion } from "../../contexts/ReduceMotionContext";
import styles from "./About.module.css";

type CodeBlockState = "open" | "minimized" | "closed";

const aboutContent = {
  title: "The operating model",
  paragraphs: [
    {
      text: "I work where product ambiguity meets technical ambition: turning rough opportunities into systems people can actually use.",
      highlight: "systems people can actually use",
    },
    {
      text: "AI is part of the build loop—not a substitute for judgment. I use agents, skills, and fast feedback to explore more options while keeping architecture, quality, and accountability human-led.",
      highlight: "AI is part of the build loop",
    },
    {
      text: "The result is pragmatic: clearer decisions, stronger delivery momentum, and experiences that feel considered from the first interaction to production.",
      highlight: "stronger delivery momentum",
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
  approach: "agentic, human-directed",
  stack: ["AI systems", "product engineering", "experience design"],
  outcome: "shipping high-leverage work"
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
