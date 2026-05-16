export interface GraveyardProject {
  id: string;
  title: string;
  epitaph: string;
  bornDate: string;
  deathDate: string;
  techStack: string[];
  link?: string;
}

export const graveyardProjects: GraveyardProject[] = [
  {
    id: "grave-2",
    title: "Descend Into Darkness",
    epitaph:
      "A blind-first audio platformer where Rex and Dr. Mara Voss navigate a cave that grows darker with every level. The concept was genuinely compelling — killed by scope. When the cave swallowed the developer too, the lights went out for good.",
    bornDate: "2026-05",
    deathDate: "2026-05",
    techStack: ["TypeScript", "HTML"],
    link: "https://github.com/karma-works/descend-into-darkness",
  },
  {
    id: "grave-1",
    title: "SC2K City Viewer",
    epitaph:
      "Killed by AI's inability to maintain stylistic consistency across 200+ pixel art tiles. The dream was noble, the execution... inconsistent.",
    bornDate: "2026-02",
    deathDate: "2026-02",
    techStack: ["TypeScript", "Python", "Vite"],
    link: "https://github.com/karma-works/sc2k-city-viewer",
  },
];
