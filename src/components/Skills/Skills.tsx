import { memo } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import styles from "./Skills.module.css";

import { skillCategories, type SkillCategory } from "../../content/skills";
import { skillIcons } from "./skillIcons";
export type { Skill, SkillCategory } from "../../content/skills";

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
  return (
    <div
      className={`${styles.card} ${isVisible ? styles.visible : ""}`}
      style={{
        transitionDelay: `${index * 100}ms`,
      }}
      role="article"
      aria-label={`${category.title} skills`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconWrapper}>
          <div className={styles.icon}>{skillIcons[category.id]}</div>
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
          <span className={styles.titleAccent}>//</span> Range, with intent
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
