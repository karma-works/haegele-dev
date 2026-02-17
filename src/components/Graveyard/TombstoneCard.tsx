import { memo } from "react";
import type { GraveyardProject } from "./graveyardData";
import styles from "./Graveyard.module.css";

interface TombstoneCardProps {
  project: GraveyardProject;
  isVisible: boolean;
  index: number;
}

export const TombstoneCard = memo(function TombstoneCard({
  project,
  isVisible,
  index,
}: TombstoneCardProps) {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const calculateLifespan = (born: string, died: string): string => {
    const bornDate = new Date(born);
    const diedDate = new Date(died);
    const diffMs = diedDate.getTime() - bornDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    const months = Math.floor(diffDays / 30);
    return months === 1 ? "1 month" : `${months} months`;
  };

  return (
    <article
      className={`${styles.tombstone} ${isVisible ? styles.visible : ""}`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <div className={styles.stone}>
        <div className={styles.cross}>✟</div>
        <h3 className={styles.projectName}>{project.title}</h3>
        <p className={styles.epitaph}>"{project.epitaph}"</p>

        <div className={styles.dates}>
          <span className={styles.dateRow}>
            <span className={styles.dateLabel}>Born:</span>{" "}
            {formatDate(project.bornDate)}
          </span>
          <span className={styles.dateRow}>
            <span className={styles.dateLabel}>Died:</span>{" "}
            {formatDate(project.deathDate)}
          </span>
        </div>

        <div className={styles.lifespan}>
          Lived {calculateLifespan(project.bornDate, project.deathDate)}
        </div>

        <div className={styles.techStack}>
          {project.techStack.map((tech) => (
            <span key={tech} className={styles.techTag}>
              {tech}
            </span>
          ))}
        </div>

        {project.link && (
          <a
            href={project.link}
            className={styles.repoLink}
            aria-label={`View ${project.title} repository`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            View Remains
          </a>
        )}
      </div>

      <div className={styles.glowEffect} />
    </article>
  );
});
