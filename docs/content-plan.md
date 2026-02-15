# Website Content Plan

## Overview

Personal developer portfolio showcasing full-stack expertise with a focus on AI technologies. The site combines technical depth with personal character through carefully crafted sections and spectacular visual effects.

**Core Identity:**
- Full Stack Developer
- AI Enthusiast (Agentic Coding, RAG, Skills/LLM Tooling)
- Human: Jogger, Pianist, Polyglot
- Contact: christian@haegele.dev

---

## Site Structure

### 1. Hero Section
**Visual:** CSS Blossoming Flowers animation (dark theme)
**Content:**
- Name: Christian Hägele
- Title: Full Stack Developer & AI Explorer
- Subtitle: Building intelligent systems, one agent at a time
- CTA: "Explore my work" / "Get in touch"

**Effect Integration:**
- Full-screen flower animation on load
- Text fades in after flowers bloom (staggered 0.5s delay)
- Floating light particles (from flower effect) create magical atmosphere
- Smooth scroll indicator at bottom

---

### 2. About Section
**Visual:** Split layout - content left, visual right
**Content:**

#### Who I Am
> I'm a full-stack developer passionate about the intersection of code and intelligence. My journey spans from traditional web development to the cutting edge of AI—where I now spend most of my time building agents, implementing RAG systems, and creating skill frameworks for LLMs.

#### Beyond the Screen
When I'm not training models or debugging agents, you'll find me:
- 🏃 **Jogging** - Early morning runs to clear my mind
- 🎹 **Playing Piano** - Classical and jazz to balance the logic
- 🌍 **Learning Languages** - Currently exploring [language] (always learning)

#### Philosophy
> Technology should feel magical. Whether it's a flower blooming in CSS or an AI agent reasoning through a complex problem, the best experiences combine technical excellence with human wonder.

**Effect Integration:**
- Scroll-triggered fade-in
- Highlighted text effect on key phrases ("AI", "agents", "magical")
- Subtle parallax on background elements

---

### 3. Expertise / Skills Section
**Visual:** Interactive grid or cards with hover effects
**Content:**

#### AI & Machine Learning
- **Agentic Coding** - Autonomous systems, multi-agent orchestration, tool use
- **RAG Systems** - Retrieval-augmented generation, vector databases, embeddings
- **Skills Framework** - LLM tool integration, function calling, skill libraries
- **LLM Engineering** - Prompt engineering, fine-tuning, model evaluation

#### Full Stack Development
- **Frontend** - React, TypeScript, Next.js, CSS architecture
- **Backend** - Node.js, Python, API design, microservices
- **Databases** - PostgreSQL, vector stores (Pinecone, Weaviate), Redis
- **DevOps** - Docker, CI/CD, cloud platforms (AWS/GCP)

#### Tools & Technologies
- LangChain, LlamaIndex, OpenAI API
- Vector databases, embeddings (OpenAI, HuggingFace)
- TypeScript, Python, Go
- React, Next.js, Tailwind CSS

**Effect Integration:**
- Magnetic hover effect on skill cards
- Icons animate on hover (subtle rotation/scale)
- Staggered reveal on scroll
- Highlighted text for category headers

---

### 4. Projects Section
**Visual:** Project cards with hover reveal
**Content:**

#### Featured Project 1: AI Agent Framework
**Title:** Agent Orchestration System
**Description:** A modular framework for building and orchestrating AI agents with tool use, memory management, and multi-agent collaboration.
**Tech:** Python, LangChain, FastAPI, PostgreSQL
**Links:** GitHub | Live Demo

#### Featured Project 2: RAG Implementation
**Title:** Knowledge Base Assistant
**Description:** Document ingestion pipeline with semantic search, chunking strategies, and contextual response generation.
**Tech:** TypeScript, Next.js, Pinecone, OpenAI
**Links:** GitHub | Case Study

#### Featured Project 3: Skill Library
**Title:** LLM Skills Toolkit
**Description:** Collection of reusable skills for LLMs including web search, code execution, data analysis, and API integration.
**Tech:** Python, Pydantic, Docker
**Links:** GitHub | Documentation

#### Web Experiments
- CSS Animation Showcase (this website!)
- Interactive visualizations
- Open source contributions

**Effect Integration:**
- Cards have 3D tilt effect on hover
- Image reveal with clip-path animation
- Staggered grid animation on scroll
- Project titles use highlight effect on hover

---

### 5. Writing / Blog Section (Optional/Minimal)
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
- GitHub: github.com/[username]
- LinkedIn: linkedin.com/in/[username]

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

### 7. Footer
**Content:**
- © 2025 Christian Hägele
- Built with TypeScript, React & CSS magic
- "Made with ♥ and lots of coffee"

**Effect Integration:**
- Minimal - just fade in
- Links have underline animation on hover

---

## Visual Theme & Effects Summary

### Color Palette

**Primary:**
- Background: #000 (black) to #0a0a0a (near black)
- Accent: #a7ffee (cyan/mint from flowers)
- Secondary: #54b8aa (teal)
- Highlight: #ffe83e (yellow), #5be95c (green), #ff64b9 (pink)

**Text:**
- Primary: #ffffff (white)
- Secondary: rgba(255,255,255,0.7)
- Muted: rgba(255,255,255,0.5)

### Typography

- **Headings:** Inter or System UI, bold weights
- **Body:** Inter, regular weight
- **Accents/Quotes:** "Mansalva" or handwriting font (from highlight effect)

### Effects Map

| Section | Primary Effect | Secondary Effects |
|---------|---------------|-------------------|
| Hero | Full flower animation | Floating lights, text fade |
| About | Scroll reveal | Highlighted text |
| Skills | Magnetic hover | Staggered cards |
| Projects | 3D card tilt | Clip-path reveal |
| Contact | Floating petals | Magnetic inputs |
| Global | Smooth scroll | Page transitions |

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
