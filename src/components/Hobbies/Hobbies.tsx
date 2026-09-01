import { memo } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { StravaCard } from "../Strava";
import { MidiPlayButton } from "./MidiPlayButton";
import styles from "./Hobbies.module.css";

interface Language {
  name: string;
  level: number;
  flag: string;
}

const languages: Language[] = [
  { name: "German", level: 100, flag: "🇩🇪" },
  { name: "English", level: 90, flag: "🇺🇸" },
  { name: "Spanish", level: 90, flag: "🇲🇽" },
  { name: "French", level: 80, flag: "🇫🇷" },
  { name: "Chinese (Mandarin)", level: 60, flag: "🇨🇳" },
];

interface HobbyCardProps {
  title: string;
  icon: React.ReactNode;
  index: number;
  isVisible: boolean;
  children: React.ReactNode;
  className?: string;
}

const HobbyCard = memo(function HobbyCard({
  title,
  icon,
  index,
  isVisible,
  children,
  className,
}: HobbyCardProps) {
  return (
    <div
      className={`${styles.card} ${isVisible ? styles.visible : ""} ${className || ""}`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
      role="article"
      aria-label={`${title} hobby`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>{icon}</div>
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <div className={styles.cardContent}>{children}</div>
      <div className={styles.cardGlow} />
    </div>
  );
});

function LanguageProgress({
  languages: langs,
  isVisible,
}: {
  languages: Language[];
  isVisible: boolean;
}) {
  return (
    <div className={styles.languageList}>
      {langs.map((lang, index) => (
        <div key={lang.name} className={styles.languageItem}>
          <span className={styles.languageName}>
            {lang.flag} {lang.name}
          </span>
          <div className={styles.languageBar}>
            <div
              className={styles.languageProgress}
              style={{
                width: isVisible ? `${lang.level}%` : "0%",
                transitionDelay: `${index * 100}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const Hobbies = memo(function Hobbies() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section id="hobbies" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
      >
        <h2 className={styles.title}>
          <span className={styles.titleAccent}>05 /</span> Inputs beyond the screen
        </h2>

        <div className={styles.grid}>
          <HobbyCard
            title="Running"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="24"
                height="24"
              >
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zM7.731 8.712l2.928 5.772h4.574L7.731 0 0 14.484h4.574l3.157-5.772z" />
              </svg>
            }
            index={0}
            isVisible={isVisible}
          >
            <StravaCard className={styles.stravaCard} />
          </HobbyCard>

          <HobbyCard
            title="Piano"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="4" x2="6" y2="14" />
                <line x1="10" y1="4" x2="10" y2="14" />
                <line x1="14" y1="4" x2="14" y2="14" />
                <line x1="18" y1="4" x2="18" y2="14" />
              </svg>
            }
            index={1}
            isVisible={isVisible}
          >
            <div className={styles.pianoWrapper}>
              <p className={styles.pianoDescription}>
                I enjoy playing piano in my free time.
              </p>
              <MidiPlayButton />
            </div>
          </HobbyCard>

          <HobbyCard
            title="Languages"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
            }
            index={2}
            isVisible={isVisible}
          >
            <div className={styles.languageWrapper}>
              <p className={styles.languageDescription}>
                Learning new languages is a passion of mine.
              </p>
              <LanguageProgress languages={languages} isVisible={isVisible} />
            </div>
          </HobbyCard>
        </div>
      </div>
    </section>
  );
});

export default Hobbies;
