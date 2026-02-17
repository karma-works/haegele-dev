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
