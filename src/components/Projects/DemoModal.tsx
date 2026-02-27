import { memo, useEffect, useCallback } from "react";
import styles from "./DemoModal.module.css";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoUrl: string;
  title: string;
}

export const DemoModal = memo(function DemoModal({
  isOpen,
  onClose,
  demoUrl,
  title,
}: DemoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-modal-title"
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 id="demo-modal-title" className={styles.title}>
            {title}
          </h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close demo"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <iframe
            src={demoUrl}
            title={`${title} Demo`}
            className={styles.iframe}
            allow="fullscreen"
            loading="lazy"
          />
        </div>
        <div className={styles.footer}>
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15,3 21,3 21,9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open in new tab
          </a>
        </div>
      </div>
    </div>
  );
});

export default DemoModal;
