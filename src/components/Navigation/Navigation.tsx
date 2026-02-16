import { useState, useCallback, useEffect } from 'react';
import { useReducedMotion } from '../../contexts/ReduceMotionContext.tsx';
import {
  translations,
  type NavKey,
  type Language,
  getNextLanguage,
} from './translations.ts';
import NavLink from './NavLink.tsx';
import styles from './Navigation.module.css';

interface NavigationProps {
  activeSection?: string;
}

const navItems: NavKey[] = ['about', 'skills', 'projects', 'hobbies', 'contact'];

export function Navigation({ activeSection = 'hero' }: NavigationProps) {
  const [hoveredKey, setHoveredKey] = useState<NavKey | null>(null);
  const [languages, setLanguages] = useState<Record<NavKey, Language>>(() =>
    Object.fromEntries(navItems.map((key) => [key, 'en'])) as Record<NavKey, Language>
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (isReducedMotion) {
      setMobileOpen(false);
    }
  }, [isReducedMotion]);

  const handleMouseEnter = useCallback((key: NavKey) => {
    if (isReducedMotion) return;
    setHoveredKey(key);
    setLanguages((prev) => ({
      ...prev,
      [key]: getNextLanguage(prev[key]),
    }));
  }, [isReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setHoveredKey(null);
  }, []);

  const handleClick = useCallback((key: NavKey, e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    const element = document.getElementById(key);
    element?.scrollIntoView({ behavior: isReducedMotion ? 'auto' : 'smooth' });
  }, [isReducedMotion]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  return (
    <nav className={styles.container}>
      <button
        className={styles.mobileToggle}
        onClick={toggleMobile}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>
      <ul className={styles.nav} data-open={mobileOpen} role="menubar">
        {navItems.map((key) => (
          <NavLink
            key={key}
            href={`#${key}`}
            isActive={activeSection === key}
            isHovered={hoveredKey === key}
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(key, e)}
          >
            {translations[key][languages[key]]}
          </NavLink>
        ))}
      </ul>
    </nav>
  );
}

export { navItems };
export type { NavigationProps };
