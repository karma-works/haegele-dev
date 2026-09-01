import { useEffect, useState } from "react";
import styles from "./Hero.module.css";

const capabilities = ["Discover", "Design", "Build", "Ship"];

export function Hero() {
  const [pointer, setPointer] = useState({ x: 50, y: 46 });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const reveal = window.requestAnimationFrame(() => setIsReady(true));
    return () => window.cancelAnimationFrame(reveal);
  }, []);

  return (
    <section
      className={`${styles.container} ${isReady ? styles.ready : ""}`}
      id="hero"
      aria-labelledby="hero-heading"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - bounds.left) / bounds.width) * 100,
          y: ((event.clientY - bounds.top) / bounds.height) * 100,
        });
      }}
      style={{
        "--pointer-x": `${pointer.x}%`,
        "--pointer-y": `${pointer.y}%`,
      } as React.CSSProperties}
    >
      <div className={styles.aurora} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />

      <div className={styles.topline}>
        <span className={styles.availability}><i /> Available for ambitious builds</span>
        <span>Zurich · Switzerland · Remote</span>
      </div>

      <div className={styles.copy}>
        <p className={styles.eyebrow}>Christian Hägele / AI-enabled engineering</p>
        <h1 id="hero-heading">
          I turn complex ideas into <em>working systems.</em>
        </h1>
        <p className={styles.intro}>
          Technical lead and hands-on builder for products where agentic thinking,
          strong engineering, and a sharp visual finish all matter.
        </p>
        <div className={styles.actions}>
          <a className={styles.primaryAction} href="#projects">Explore selected work <span>↘</span></a>
          <a className={styles.secondaryAction} href="https://www.linkedin.com/in/christian-haegele-3403aaa/" target="_blank" rel="noreferrer">Connect on LinkedIn <span>↗</span></a>
        </div>
      </div>

      <div className={styles.agentScene} aria-label="An interactive map of an AI delivery workflow">
        <div className={styles.sceneHeader}>
          <span>ORCHESTRATION / 01</span>
          <span className={styles.live}><i /> live system</span>
        </div>
        <svg className={styles.connections} viewBox="0 0 620 520" aria-hidden="true">
          <path d="M100 125 C200 85, 236 178, 308 197 S432 160, 516 95" />
          <path d="M100 125 C164 234, 203 324, 309 346 S453 372, 531 413" />
          <path d="M308 197 C313 259, 307 292, 309 346" />
          <path d="M516 95 C479 213, 418 273, 309 346" />
        </svg>
        <div className={`${styles.node} ${styles.nodeDiscovery}`}><b>01</b><span>Context<br />mapping</span></div>
        <div className={`${styles.node} ${styles.nodeDesign}`}><b>02</b><span>System<br />design</span></div>
        <div className={`${styles.node} ${styles.nodeBuild}`}><b>03</b><span>Agentic<br />build loop</span></div>
        <div className={`${styles.node} ${styles.nodeQuality}`}><b>04</b><span>Quality<br />signal</span></div>
        <div className={`${styles.node} ${styles.nodeShip}`}><b>05</b><span>Shipped<br />outcome</span></div>
        <div className={styles.scenePulse} aria-hidden="true" />
        <div className={styles.sceneFooter}>
          <span>Human direction × AI acceleration</span>
          <span>0→1 &nbsp; / &nbsp; 1→n</span>
        </div>
      </div>

      <div className={styles.capabilityRail} aria-label="Core capabilities">
        {capabilities.map((capability, index) => (
          <span key={capability}><b>0{index + 1}</b> {capability}</span>
        ))}
      </div>
      <a className={styles.scrollCue} href="#about">Scroll for the operating model <span>↓</span></a>
    </section>
  );
}
