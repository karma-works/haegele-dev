# Website Content Plan

## Overview

Personal developer portfolio showcasing full-stack expertise with a focus on AI technologies. The site combines technical depth with personal character through carefully crafted sections and spectacular visual effects.


## Base Design

Let's make a personal website. the design and navigation should be like https://brittanychiang.com/. the page is for a software developer. Personal developer portfolio showcasing full-stack expertise with a focus on AI technologies, github projects, hobbies: running, playing the piano, languages: German, English, French, Spanish, Chinese (Mandarin)

The design is playful, joyful. It uses modern web design and javascript/css tricks. Form follows function. UI elements are customized for the specific purposs, using icons, custom shapes etc. 

**Core Identity:**
- Full Stack Developer
- AI Enthusiast (Agentic Coding, RAG, Skills/LLM Tooling)
- Human: Jogger, Pianist, Polyglot
- Contact: christian@haegele.dev

---

## Site Structure

### 0. Navigation ("Polyglot" Navigation)
**Visual:** Minimalist glassmorphic navigation bar
**Behavior:**
- On hover, links cycle through names in different languages:
  - Home → Haus → Maison → Casa → Home
  - Work → Arbeit → Travail → Lavoro → Work
  - Hobbies → Hobbys → Loisirs → Hobby → Hobbies
**Effect Integration:**
- Glassmorphic background
- Smooth language transition animation
- Glow effect on active/hover state

### 1. Hero Section ("Performance Metrics" Hero)
**Visual:** Terminal-style typed greeting with sinusoidal wave background animation (dark theme)
**Content:**
- Name: Christian Hägele
- Title: Full Stack Developer & AI Explorer
- Subtitle: Building intelligent systems, one agent at a time
- CTA: "Explore my work" / "Get in touch"

**Effect Integration:**
- Terminal-style typing animation for greeting
- Sinusoidal wave background (mimics sound wave/heartbeat), see #pulse-background.md
- Text fades in with staggered delay
- Glassmorphic overlay elements
- Smooth scroll indicator at bottom

see #landing-view.md for more details.

---

### 2. About Section
**Visual:** Split layout - content left, visual right
**Content:**

#### Who I Am
> I'm a full-stack developer passionate about the intersection of code and intelligence. My journey spans from traditional web development to the cutting edge of AI—where I now spend most of my time building agents, implementing LLM tools, and creating skill frameworks for LLMs.

#### Beyond the Screen
When I'm not tweaking LLM integrations or debugging agents, you'll find me:
- 🏃 **Jogging** - Early morning runs to clear my mind
- 🎹 **Playing Piano** - Classical to balance the logic
- 🌍 **Learning Languages** - Currently exploring [Chinese] (always learning)

#### Philosophy
> Technology should feel magical. The best experiences combine technical excellence with human wonder.

**Effect Integration:**
- Scroll-triggered fade-in
- Highlighted text effect on key phrases ("AI", "agents", "magical")
- Subtle parallax on background elements

---

### 3. Expertise / Skills Section
**Visual:** Interactive grid or cards with hover effects
**Content:**

#### AI & Machine Learning
- **Agentic Coding** - multi-agent orchestration, tool use
- **RAG Systems** - Retrieval-augmented generation, vector databases, embeddings
- **Skills Framework** - LLM tool integration, function calling, skill libraries
- **LLM Engineering** - Prompt engineering, fine-tuning, model evaluation

#### Full Stack Development
- **Frontend** - React, TypeScript
- **Backend** - Java, Go, API design, microservices
- **Databases** - MSSQL, vector stores (DuckDB), graph stores 
- **DevOps** - Docker, CI/CD (Azure Pipelines), cloud platforms (Azure)

#### Tools & Technologies
- OpenAI API, GraphQL
- Vector databases, embeddings (OpenAI, HuggingFace)
- Java, TypeScript, Go
- React

**Effect Integration:**
- Magnetic hover effect on skill cards
- Icons animate on hover (subtle rotation/scale)
- Staggered reveal on scroll
- Highlighted text for category headers

---

### 4. Projects Section ("Continuous Integration" Portfolio)
**Visual:** Git log-style project cards with commit icons and hover reveal
**Content:**

#### Featured Project 1: AI Agent Framework
**Title:** Agentic Tasks
**Description:** A persistent task management system designed for AI agents 
**Tech:** JavaScript, Typescript, SHell
**Links:** [GitHub](https://github.com/karma-works/agentic-tasks)

#### Featured Project 2: Migrations with AI
**Title:** Papercraft Web
**Description:** A web-based tool to unwrap 3D models into printable papercraft patterns. This is a client/server application with a Rust backend and React frontend. 
**Tech:** Rust, TypeScript, HTML
**Links:** [GitHub](https://github.com/karma-works/papercraft-web)

#### Featured Project 3: Skill Library
**Title:** Claudine Skills
**Description:** Permissively-licensed reimplementations of proprietary Anthropic Claude skills 
**Tech:** Python
**Links:** [GitHub | Documentation](https://github.com/karma-works/claudine-skills)

#### Web Experiments
- CSS Animation Showcase (this website!)
- Interactive visualizations

**Effect Integration:**
- Git log-style layout with commit icons showing technologies
- Cards have 3D tilt effect on hover
- Image reveal with clip-path animation
- Staggered grid animation on scroll
- Project titles use highlight effect on hover
- Glassmorphic card backgrounds

---

### 5. Hobbies Section (The "Trifecta")
**Visual:** Three-column glassmorphic cards with interactive widgets
**Content:**

#### Running
- Latest Strava stats (distance, pace, weekly total)
- Minimalist heat map of favorite routes
- Personal records with subtle animations

#### Piano
- Mini interactive keyboard (also in footer)
- Current repertoire or learning pieces
- Musical journey timeline

#### Languages
- "Language Level" grid with progress bars styled like code loading sequences
- Languages: German (native), English (fluent), French (learning), Spanish (exploring)
- Visual progress indicators

**Effect Integration:**
- Glassmorphic card backgrounds
- Running: Animated stats counters, route map hover effects
- Piano: Clickable keys with sound, theme color shifts
- Languages: Progress bars animate on scroll into view

---

### 6. Writing / Blog Section (Optional/Minimal)
**Visual:** Clean list with hover states
**Content:**

#### Articles
1. **"Building Effective AI Agents: Lessons Learned"**
   Practical insights from building production agent systems

2. **"RAG Beyond the Basics"**
   Advanced retrieval strategies and evaluation metrics

3. **"The Art of CSS Animation"**
   How we built the flower effect (meta!)

**Effect Integration:**
- List items slide in from left on scroll
- Hover: slight indent + highlight color
- Reading time indicator with subtle animation

---

### 6. Contact Section
**Visual:** Clean, centered with floating elements
**Content:**

#### Let's Build Something Together
> Whether you want to discuss AI architecture, collaborate on a project, or just chat about piano and running routes—I'd love to hear from you.

**Primary Contact:**
- Email: christian@haegele.dev
- GitHub: https://github.com/karma-works/
- LinkedIn: https://www.linkedin.com/in/christian-haegele-3403aaa/

**Quick Form (optional):**
- Name
- Email
- Message
- Submit with satisfying interaction

**Effect Integration:**
- Floating flower petals (subtle, 3-4 elements)
- Input fields have magnetic cursor attraction
- Submit button with liquid hover effect
- Success state with particle burst

---

### 8. Footer
**Content:**
- © 2025 Christian Hägele
- Built with TypeScript, React & CSS magic
- "Made with ♥ and lots of coffee"
- Interactive SVG piano keyboard

**Effect Integration:**
- Minimal - just fade in
- Links have underline animation on hover
- Interactive piano keyboard: plays soft note on click, triggers UI theme changes (e.g., C-major shifts accent to yellow)

---

## Visual Theme & Effects Summary

### Design Philosophy

**Aesthetic:** Sophisticated, high-performance dark-mode terminal aesthetic blended with elegant, flowing transitions that mimic a musical score or a running path. "Late-night coding session" energy that remains polished for recruiters and collaborators.

### Color Palette

**Primary:**
- Background: #0d1117 (Deep Charcoal/Near Black)
- Accent: #00f5d4 (Electric Mint/Cyan)
- Secondary: #00bbff (Cyber Blue)
- Highlight: #f72585 (Neon Pink), #fee440 (Cyber Yellow), #72efdd (Soft Teal)

**Text:**
- Primary: #f0f6fc (Off-white/High Contrast)
- Secondary: #8b949e (Cool Gray)
- Muted: #484f58 (Deep Slate)

### Typography

- **Headings:** Inter or System UI, bold weights
- **Body:** Inter, regular weight
- **Accents/Quotes:** Caveat or La Belle Aurore - human, handwritten touch for language learning notes or running logs

### Layout & Elements

#### The "Polyglot" Navigation
- Minimalist navigation bar
- On hover, links (Home, Work, Hobbies) cycle through names in different languages spoken

#### The "Performance Metrics" Hero
- Terminal-style typed greeting
- Subtle background animation of **sinusoidal wave** (mimics sound wave/piano and heartbeat/running)

#### The "Continuous Integration" Portfolio
- Projects displayed like a git log
- Small commits/icons showing technologies used
- Professional, data-driven senior dev vibe

#### The Hobby "Trifecta" Section
- **Running:** Dynamic widget with latest Strava stats or minimalist heat map of favorite routes
- **Piano:** Interactive SVG keyboard in footer - plays soft note on click, triggers UI theme change (e.g., C-major shifts accent to yellow)
- **Languages:** "Language Level" grid with progress bars styled like code loading sequences

### UI Effects

- **Glassmorphism:** Frosted glass effects for cards - maintain depth against black background
- **Glow Effects:** On buttons to make cyan accent pop
- **Transitions:** Elegant, flowing animations mimicking musical scores

**Don'ts**
- Never use rainbow effect in fonts!

### Effects Map

| Section | Primary Effect | Secondary Effects |
|---------|---------------|-------------------|
| Navigation | Polyglot hover cycle | Minimalist glass effect, glow |
| Hero | Terminal typed greeting + sinusoidal wave | Floating lights, text fade |
| About | Scroll reveal | Highlighted text |
| Skills | Magnetic hover | Glassmorphic cards |
| Projects | Git log style + 3D card tilt | Clip-path reveal |
| Hobbies | Interactive Trifecta widgets | Strava stats, piano keyboard, language progress |
| Contact | Floating petals | Magnetic inputs |
| Footer | Interactive piano keyboard | Theme color shifts on key press |
| Global | Smooth scroll | Glassmorphism, glow effects |

---

## Technical Implementation Notes

### Performance Priorities
1. Lazy load below-fold sections
2. Use `will-change` sparingly
3. Prefer CSS animations over JS where possible
4. Optimize images (WebP format)
5. Use Intersection Observer for scroll triggers

### Accessibility
1. Respect `prefers-reduced-motion`
2. Maintain color contrast (WCAG AA minimum)
3. Keyboard navigation support
4. Screen reader friendly structure
5. Focus states on all interactive elements

### Responsive Breakpoints
- Mobile: < 768px (simplified animations)
- Tablet: 768px - 1024px
- Desktop: > 1024px (full effects)

---

## Content Writing Guidelines

### Tone
- Professional but approachable
- Technical without being jargon-heavy
- Enthusiastic about AI, grounded in reality
- Personal touches (hobbies) show human side

### Language
- English (primary)
- German (optional toggle for local context)
- Code examples in English

### Key Messages
1. **AI-First:** Not just using AI, building AI systems
2. **Full-Stack:** End-to-end capability
3. **Continuous Learning:** Always exploring (tech & life)
4. **Craft:** Care about details, visual polish, user experience

---

## SEO & Meta

**Title:** Christian Hägele | Full Stack Developer & AI Engineer

**Description:** Full-stack developer specializing in AI agents, RAG systems, and intelligent applications. Building the future of software, one agent at a time.

**Keywords:** Full Stack Developer, AI Engineer, Agentic Coding, RAG, LLM, TypeScript, Python, React

---

## Future Content Ideas

### Phase 2
- Case studies for each project
- Technical blog with regular posts
- Newsletter signup
- Speaking engagements / conferences
- Open source contribution tracker

### Phase 3
- Interactive AI demos (in-browser)
- Project showcase with live examples
- Testimonials / client work
- Podcast / interview appearances
