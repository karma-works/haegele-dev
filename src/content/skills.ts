export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  id: string;
  title: string;
  skills: Skill[];
  isSoftSkill?: boolean;
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    title: "Experience systems",
    skills: [
      { name: "React", level: 90 },
      { name: "TypeScript", level: 90 },
      { name: "Interactive UI", level: 85 },
    ],
  },
  {
    id: "backend",
    title: "Production engineering",
    skills: [
      { name: "Quarkus", level: 90 },
      { name: "Go", level: 85 },
      { name: "Wildfly", level: 75 },
      { name: "ChromaDB", level: 85 },
    ],
  },
  {
    id: "devops",
    title: "Delivery infrastructure",
    skills: [
      { name: "Docker", level: 90 },
      { name: "CI/CD", level: 75 },
      { name: "Kubernetes", level: 75 },
      { name: "Azure", level: 70 },
    ],
  },
  {
    id: "tools",
    title: "AI-accelerated practice",
    skills: [
      { name: "Agent workflows", level: 90 },
      { name: "LLM tools", level: 90 },
      { name: "Context design", level: 85 },
      { name: "Linux", level: 85 },
    ],
  },
  {
    id: "languages",
    title: "Technical range",
    skills: [
      { name: "Java", level: 100 },
      { name: "Kotlin", level: 90 },
      { name: "Typescript", level: 90 },
      { name: "Go", level: 85 },
    ],
  },
  {
    id: "soft",
    title: "Leadership",
    skills: [
      { name: "Leadership", level: 85 },
      { name: "Communication", level: 90 },
      { name: "Problem Solving", level: 80 },
    ],
    isSoftSkill: true,
  },
];
