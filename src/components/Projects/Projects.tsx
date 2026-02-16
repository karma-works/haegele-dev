import { memo, useRef, useState, useEffect } from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useReducedMotion } from '../../contexts/ReduceMotionContext';
import styles from './Projects.module.css';

interface Project {
  id: string;
  hash: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  link?: string;
  status: 'active' | 'archived' | 'wip';
}

const projects: Project[] = [
  {
    id: 'proj-1',
    hash: 'a1g3n7c',
    title: 'Agentic Tasks',
    description: 'A persistent task management system designed for AI agents. Enables reliable task tracking across sessions.',
    tags: ['JavaScript', 'TypeScript', 'Shell'],
    date: '2026-02',
    link: 'https://github.com/karma-works/agentic-tasks',
    status: 'active',
  },
  {
    id: 'proj-2',
    hash: 'p4p3rcr',
    title: 'Papercraft Web',
    description: 'Web-based tool to unwrap 3D models into printable papercraft patterns. Client/server app with Rust backend and React frontend.',
    tags: ['Rust', 'TypeScript', 'HTML'],
    date: '2026-01',
    link: 'https://github.com/karma-works/papercraft-web',
    status: 'active',
  },
  {
    id: 'proj-3',
    hash: 'cl4ud1n',
    title: 'Claudine Skills',
    description: 'Permissively-licensed reimplementations of proprietary Anthropic Claude skills for the open-source community.',
    tags: ['Python'],
    date: '2026-02',
    link: 'https://github.com/karma-works/claudine-skills',
    status: 'active',
  },
  {
    id: 'proj-4',
    hash: 'f0l10',
    title: 'Portfolio Website',
    description: 'Personal portfolio showcasing full-stack expertise. Features CSS animation showcase, interactive piano, and visual effects.',
    tags: ['React', 'TypeScript', 'CSS', 'Vite'],
    date: '2026-02',
    link: '#',
    status: 'active',
  },
  {
    id: 'proj-5',
    hash: 'sc2k-vw',
    title: 'SC2K City Viewer',
    description: 'Attempted open-source SimCity 2000 viewer using AI-generated tilemaps. Learned: AI struggles with systematic asset libraries requiring stylistic consistency.',
    tags: ['TypeScript', 'Python', 'Vite'],
    date: '2026-02',
    link: 'https://github.com/karma-works/sc2k-city-viewer',
    status: 'archived',
  },
];

interface ProjectCardProps {
  project: Project;
  index: number;
  isVisible: boolean;
  side: 'left' | 'right';
}

const ProjectCard = memo(function ProjectCard({ project, index, isVisible, side }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [isHovering, setIsHovering] = useState(false);
  const { disableNonCritical, isReducedMotion } = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableNonCritical || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rotateX = ((mouseY - centerY) / centerY) * -8;
    const rotateY = ((mouseX - centerX) / centerX) * 8;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`,
    });
  };

  const handleMouseLeave = () => {
    if (disableNonCritical) return;
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
    });
    setIsHovering(false);
  };

  const handleMouseEnter = () => {
    if (disableNonCritical) return;
    setIsHovering(true);
  };

  const getStatusClass = (status: string): string => {
    const statusMap: Record<string, string | undefined> = {
      active: styles.statusActive,
      archived: styles.statusArchived,
      wip: styles.statusWip,
    };
    return statusMap[status] ?? '';
  };

  return (
    <article
      ref={cardRef}
      className={`${styles.projectCard} ${isVisible ? styles.visible : ''} ${side === 'right' ? styles.cardRight : styles.cardLeft}`}
      style={{
        ...tiltStyle,
        transitionDelay: `${index * 150}ms`,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <div className={styles.cardInner}>
        <div className={styles.cardHeader}>
          <code className={styles.commitHash}>{project.hash}</code>
          <span className={`${styles.status} ${getStatusClass(project.status)}`}>
            {project.status === 'wip' ? 'WIP' : project.status}
          </span>
        </div>

        <h3 className={styles.projectTitle}>{project.title}</h3>
        
        <p className={styles.projectDescription}>{project.description}</p>

        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.cardFooter}>
          <time className={styles.date} dateTime={project.date}>
            <svg className={styles.dateIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDate(project.date)}
          </time>
          
          {project.link && (
            <a href={project.link} className={styles.projectLink} aria-label={`View ${project.title}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          )}
        </div>

        <div className={styles.cardGlare} data-hovering={isHovering} />
      </div>
    </article>
  );
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

const TimelineNode = memo(function TimelineNode({ index, isVisible }: { index: number; isVisible: boolean }) {
  return (
    <div
      className={`${styles.timelineNode} ${isVisible ? styles.visible : ''}`}
      style={{ transitionDelay: `${index * 150 + 75}ms` }}
    >
      <div className={styles.nodeCircle} />
    </div>
  );
});

export const Projects = memo(function Projects() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const { isReducedMotion } = useReducedMotion();

  return (
    <section id="projects" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ''}`}
      >
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titleAccent}>$</span> git log --oneline projects
          </h2>
          <p className={styles.subtitle}>
            A selection of projects I've worked on. Each represents a commit to learning and building.
          </p>
        </header>

        <div className={styles.timeline}>
          <div className={styles.timelineLine} data-visible={isVisible} />
          
          {projects.map((project, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            return (
              <div key={project.id} className={styles.timelineItem}>
                <TimelineNode index={index} isVisible={isVisible} />
                <div className={`${styles.cardWrapper} ${side === 'right' ? styles.wrapperRight : styles.wrapperLeft}`}>
                  <ProjectCard
                    project={project}
                    index={index}
                    isVisible={isVisible}
                    side={side}
                  />
                </div>
              </div>
            );
          })}

          <div className={styles.timelineEnd}>
            <div className={`${styles.endNode} ${isVisible ? styles.visible : ''}`}>
              <span className={styles.endText}>More coming soon...</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default Projects;
