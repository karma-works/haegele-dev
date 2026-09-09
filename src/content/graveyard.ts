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
      "Built blind-first from the wrong direction: a sighted platformer with sounds bolted on, not a game designed from audio principles up. WCAG AAA turned out to be the wrong compass — built for static pages, not real-time spatial navigation under pressure. Stereo wasn't enough for spatial understanding, AI wasn't a real sparring partner for blind UX, and Rex is still down there waiting for the real users who never came.",
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
