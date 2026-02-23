import { useState, useCallback } from "react";
import { useTypewriter } from "../../hooks/useTypewriter.ts";
import styles from "./Hero.module.css";

interface TerminalProps {
  lines: Array<{ type: "prompt" | "output"; content: string }>;
  typewriterText?: string;
}

type TerminalState = "open" | "minimized" | "closed";

export function Terminal({ lines, typewriterText }: TerminalProps) {
  const [state, setState] = useState<TerminalState>("open");
  const { displayText, isTyping } = useTypewriter({
    text: typewriterText ?? "",
    speed: 50,
    delay: 2000,
  });

  const handleClose = useCallback(() => {
    setState("closed");
  }, []);

  const handleMinimize = useCallback(() => {
    setState("minimized");
  }, []);

  const handleMaximize = useCallback(() => {
    setState("open");
  }, []);

  if (state === "closed") {
    return null;
  }

  return (
    <div
      className={styles.terminal}
      role="region"
      aria-label="Terminal display"
      data-state={state}
    >
      <div className={styles.header}>
        <button
          className={`${styles.button} ${styles.buttonClose}`}
          onClick={handleClose}
          aria-label="Close terminal"
          type="button"
        />
        <button
          className={`${styles.button} ${styles.buttonMinimize}`}
          onClick={handleMinimize}
          aria-label="Minimize terminal"
          type="button"
        />
        <button
          className={`${styles.button} ${styles.buttonMaximize}`}
          onClick={handleMaximize}
          aria-label="Maximize terminal"
          type="button"
        />
        <span className={styles.title}>terminal</span>
      </div>
      {state === "open" && (
        <div
          className={styles.content}
          role="log"
          aria-live="polite"
          aria-label="Terminal output"
        >
          {lines.map((line, index) => (
            <div key={index} className={styles.line}>
              {line.type === "prompt" ? (
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
              {isTyping && (
                <span className={styles.cursor} aria-hidden="true" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
