export interface Project {
  id: string;
  hash: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  link?: string;
  demoUrl?: string;
  status: "active" | "archived" | "wip";
  image: string;
}

export const projects: Project[] = [
  {
    id: "proj-waterpark",
    hash: "w8trprk",
    title: "Azure Cascade",
    description:
      "A cinematic Three.js waterpark resort simulator—an interactive world-building experiment with atmosphere, systems, and playful detail.",
    tags: ["TypeScript", "Three.js", "WebGL"],
    date: "2026-08",
    link: "https://github.com/karma-works/waterpark",
    demoUrl: "https://karma-works.github.io/waterpark/",
    status: "active",
    image: "/assets/projects/waterpark.png",
  },
  {
    id: "proj-career-desk",
    hash: "crr-dsk",
    title: "Career Desk",
    description:
      "A private, agent-assisted career strategy workspace that turns research, positioning, and applications into a clear operating system.",
    tags: ["TypeScript", "AI agents", "Product systems"],
    date: "2026-09",
    status: "active",
    image: "/assets/projects/career-desk.png",
  },
  {
    id: "proj-9",
    hash: "g4phnt",
    title: "GapHunter",
    description:
      "AI-assisted market gap research for founder idea generation. Analyzes markets, identifies underserved niches, and surfaces opportunities using multi-agent pipelines.",
    tags: ["Python", "AI Agents", "Docker"],
    date: "2026-05",
    link: "https://github.com/karma-works/gaphunter",
    status: "active",
    image: "/assets/projects/gaphunter.png",
  },
  {
    id: "proj-8",
    hash: "m04tsh1",
    title: "Moatshift",
    description:
      "Three AI agents — Claude, Gemini, and OpenAI — each manage a $100K virtual portfolio in a live trading competition. Autonomous daily decisions, shared tools, and a SvelteKit leaderboard at moatshift.com.",
    tags: ["TypeScript", "SvelteKit", "AI Agents"],
    date: "2026-03",
    link: "https://moatshift.com",
    status: "active",
    image: "/assets/projects/moatshift.png",
  },
  {
    id: "proj-1",
    hash: "a1g3n7c",
    title: "Agentic Tasks",
    description:
      "A persistent task management system designed for AI agents. Enables reliable task tracking across sessions.",
    tags: ["JavaScript", "TypeScript", "Shell"],
    date: "2026-02",
    link: "https://github.com/karma-works/agentic-tasks",
    status: "active",
    image: "/assets/projects/agentic-tasks.webp",
  },
  {
    id: "proj-2",
    hash: "p4p3rcr",
    title: "Papercraft Web",
    description:
      "Web-based tool to unwrap 3D models into printable papercraft patterns. Client/server app with Rust backend and React frontend.",
    tags: ["Rust", "TypeScript", "HTML"],
    date: "2026-01",
    link: "https://github.com/karma-works/papercraft-web",
    status: "active",
    image: "/assets/projects/papercraft-web.webp",
  },
  {
    id: "proj-3",
    hash: "cl4ud1n",
    title: "Claudine Skills",
    description:
      "Permissively-licensed reimplementations of proprietary Anthropic Claude skills for the open-source community.",
    tags: ["Python"],
    date: "2026-02",
    link: "https://github.com/karma-works/claudine-skills",
    status: "active",
    image: "/assets/projects/claudine-skills.webp",
  },
  {
    id: "proj-6",
    hash: "3spr1t",
    title: "Esprit Racer",
    description:
      "Retro arcade racing game inspired by Lotus Challenge III and Outrun. Features pseudo-3D graphics, 2-player split-screen, and dynamic music system.",
    tags: ["TypeScript", "Canvas 2D", "Game Dev"],
    date: "2026-02",
    link: "https://github.com/karma-works/esprit-racer",
    demoUrl: "https://karma-works.github.io/esprit-racer/",
    status: "active",
    image: "/assets/projects/esprit-racer.webp",
  },
  {
    id: "proj-10",
    hash: "v01c34st",
    title: "Voice Assist",
    description:
      "Voice-based meeting scheduler — book meetings with Google Calendar through natural conversation with a low-latency AI voice agent built on Gemini Live.",
    tags: ["Python", "FastAPI", "Gemini Live"],
    date: "2026-06",
    link: "https://github.com/karma-works/voice-assist",
    status: "active",
    image: "/assets/projects/voice-assist.svg",
  },
  {
    id: "proj-11",
    hash: "v3rt-fn",
    title: "Vert Finder",
    description:
      "Trail discovery tool that helps find and combine nearby hiking segments based on elevation gain. Search any location and build custom multi-segment routes with elevation metrics.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    date: "2026-06",
    link: "https://github.com/karma-works/vert-finder",
    status: "active",
    image: "/assets/projects/vert-finder.png",
  },
  {
    id: "proj-5",
    hash: "sc2k-vw",
    title: "SC2K City Viewer",
    description:
      "Attempted open-source SimCity 2000 viewer using AI-generated tilemaps. Learned: AI struggles with systematic asset libraries requiring stylistic consistency.",
    tags: ["TypeScript", "Python", "Vite"],
    date: "2026-02",
    link: "https://github.com/karma-works/sc2k-city-viewer",
    status: "archived",
    image: "/assets/projects/sc2k-city-viewer.webp",
  },
];
