import { memo } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { useMagneticHover } from "../../hooks/useMagneticHover";
import styles from "./Skills.module.css";

interface Skill {
  name: string;
  level: number;
}

interface SkillCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  skills: Skill[];
  isSoftSkill?: boolean;
}

const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    title: "Frontend",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9l3 3-3 3" />
        <path d="M14 15h3" />
      </svg>
    ),
    skills: [
      { name: "React", level: 80 },
      { name: "TypeScript", level: 75 },
      { name: "JSF", level: 60 },
    ],
  },
  {
    id: "backend",
    title: "Backend",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="6" rx="1" />
        <rect x="2" y="15" width="20" height="6" rx="1" />
        <path d="M6 6h.01M6 18h.01" />
      </svg>
    ),
    skills: [
      { name: "Quarkus", level: 90 },
      { name: "Go", level: 85 },
      { name: "Wildfly", level: 75 },
      { name: "ChromaDB", level: 85 },
    ],
  },
  {
    id: "devops",
    title: "DevOps",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4" />
        <path d="M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
      </svg>
    ),
    skills: [
      { name: "Docker", level: 90 },
      { name: "CI/CD", level: 75 },
      { name: "Kubernetes", level: 75 },
      { name: "Azure", level: 70 },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    skills: [
      { name: "VSCode", level: 95 },
      { name: "Langchain", level: 80 },
      { name: "OpenCode", level: 70 },
      { name: "Linux", level: 85 },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
    skills: [
      { name: "Java", level: 100 },
      { name: "Kotlin", level: 90 },
      { name: "Typescript", level: 90 },
      { name: "Go", level: 85 },
    ],
  },
  {
    id: "soft",
    title: "Soft Skills",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    skills: [
      { name: "Leadership", level: 85 },
      { name: "Communication", level: 90 },
      { name: "Problem Solving", level: 80 },
    ],
    isSoftSkill: true,
  },
];

interface SkillCardProps {
  category: SkillCategory;
  index: number;
  isVisible: boolean;
}

const getLevelLabel = (level: number): string => {
  if (level >= 85) return "Expert";
  if (level >= 70) return "Advanced";
  return "Intermediate";
};

const SkillCard = memo(function SkillCard({
  category,
  index,
  isVisible,
}: SkillCardProps) {
  const { ref, style, handlers } = useMagneticHover({ strength: 0.2 });

  return (
    <div
      ref={ref}
      className={`${styles.card} ${isVisible ? styles.visible : ""}`}
      style={{
        ...style,
        transitionDelay: `${index * 100}ms`,
      }}
      {...handlers}
      role="article"
      aria-label={`${category.title} skills`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>{category.icon}</div>
        </div>
        <h3 className={styles.cardTitle}>{category.title}</h3>
      </div>

      <div className={styles.skillsList}>
        {category.skills.map((skill, skillIndex) => (
          <div key={skill.name} className={styles.skillItem}>
            {category.isSoftSkill ? (
              <div className={styles.softSkillBadge}>
                <span className={styles.skillName}>{skill.name}</span>
                <span className={styles.levelBadge}>
                  {getLevelLabel(skill.level)}
                </span>
              </div>
            ) : (
              <>
                <span className={styles.skillName}>{skill.name}</span>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillProgress}
                    style={{
                      width: isVisible ? `${skill.level}%` : "0%",
                      transitionDelay: `${index * 100 + skillIndex * 50}ms`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className={styles.cardGlow} />
    </div>
  );
});

export const Skills = memo(function Skills() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });

  return (
    <section id="skills" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
      >
        <h2 className={styles.title}>
          <span className={styles.titleAccent}>//</span> Skills
        </h2>

        <div className={styles.grid}>
          {skillCategories.map((category, index) => (
            <SkillCard
              key={category.id}
              category={category}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
});

export default Skills;
