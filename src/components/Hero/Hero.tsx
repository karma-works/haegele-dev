import { Terminal } from './Terminal.tsx';
import styles from './Hero.module.css';

const terminalLines = [
  { type: 'prompt', content: 'whoami' } as const,
  { type: 'output', content: 'Developer | Runner | Problem Solver' } as const,
  { type: 'prompt', content: 'cat skills.txt' } as const,
  { type: 'output', content: 'TypeScript, React, Java, Go...' } as const,
];

const typewriterText = 'echo "Welcome to my portfolio"';

export function Hero() {
  return (
    <section className={styles.container} id="hero">
      <Terminal lines={terminalLines} typewriterText={typewriterText} />
      <div className={styles.scrollIndicator}>
        <span>Scroll to explore</span>
        <span>↓</span>
      </div>
    </section>
  );
}
