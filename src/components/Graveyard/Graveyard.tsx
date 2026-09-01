import { memo } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { TombstoneCard } from "./TombstoneCard";
import { graveyardProjects } from "./graveyardData";
import styles from "./Graveyard.module.css";

export const Graveyard = memo(function Graveyard() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.15,
  });

  return (
    <section id="graveyard" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleAccent}>04 /</span> Learning archive
          </h2>
          <p className={styles.subtitle}>
            Experiments that did not ship as planned, but sharpened the
            judgment behind the next build.
          </p>
        </header>

        <div className={styles.graveyard}>
          <div className={styles.fog} />

          {graveyardProjects.map((project, index) => (
            <TombstoneCard
              key={project.id}
              project={project}
              isVisible={isVisible}
              index={index}
            />
          ))}
        </div>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            "The only real mistake is the one from which we learn nothing."
          </p>
          <p className={styles.footerAuthor}>— Henry Ford</p>
        </footer>
      </div>

      <div className={styles.grainOverlay} />
    </section>
  );
});

export default Graveyard;
