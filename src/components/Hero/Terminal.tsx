import { useTypewriter } from '../../hooks/useTypewriter.ts';
import styles from './Hero.module.css';

interface TerminalProps {
  lines: Array<{ type: 'prompt' | 'output'; content: string }>;
  typewriterText?: string;
}

export function Terminal({ lines, typewriterText }: TerminalProps) {
  const { displayText, isTyping } = useTypewriter({
    text: typewriterText ?? '',
    speed: 50,
    delay: 2000,
  });

  return (
    <div className={styles.terminal} role="region" aria-label="Terminal display">
      <div className={styles.header}>
        <span className={`${styles.button} ${styles.buttonClose}`} aria-hidden="true" />
        <span className={`${styles.button} ${styles.buttonMinimize}`} aria-hidden="true" />
        <span className={`${styles.button} ${styles.buttonMaximize}`} aria-hidden="true" />
        <span className={styles.title}>terminal</span>
      </div>
      <div className={styles.content} role="log" aria-live="polite" aria-label="Terminal output">
        {lines.map((line, index) => (
          <div key={index} className={styles.line}>
            {line.type === 'prompt' ? (
              <>
                <span className={styles.prompt}>$</span>
                <span className={styles.command}>{line.content}</span>
              </>
            ) : (
              <span className={styles.output}>{line.content}</span>
            )}
          </div>
        ))}
        {typewriterText && (
          <div className={styles.line}>
            <span className={styles.prompt}>$</span>
            <span className={styles.command}>{displayText}</span>
            {isTyping && <span className={styles.cursor} aria-hidden="true" />}
          </div>
        )}
      </div>
    </div>
  );
}
