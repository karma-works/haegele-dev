import type { ReactNode, MouseEvent, MouseEventHandler } from "react";
import styles from "./Navigation.module.css";

interface NavLinkProps {
  href: string;
  isActive: boolean;
  isHovered: boolean;
  children: ReactNode;
  onMouseEnter: MouseEventHandler;
  onMouseLeave: MouseEventHandler;
  onClick: (e: MouseEvent) => void;
}

export default function NavLink({
  href,
  isActive,
  isHovered: _isHovered,
  children,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: NavLinkProps) {
  return (
    <li role="none">
      <a
        href={href}
        className={styles.link}
        data-active={isActive}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        role="menuitem"
      >
        <span className={styles.glow} aria-hidden="true" />
        {children}
      </a>
    </li>
  );
}
