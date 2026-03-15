import { memo, useEffect, useRef } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import styles from "./AIFeed.module.css";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (element?: HTMLElement) => void;
      };
    };
  }
}

export const AIFeed = memo(function AIFeed() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });
  const timelineRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!isVisible || scriptLoadedRef.current) return;

    const loadTwitterWidget = () => {
      if (window.twttr?.widgets && timelineRef.current) {
        window.twttr.widgets.load(timelineRef.current);
        scriptLoadedRef.current = true;
      }
    };

    if (window.twttr) {
      loadTwitterWidget();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.charset = "utf-8";
    script.onload = loadTwitterWidget;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [isVisible]);

  return (
    <section id="ai-feed" className={styles.section}>
      <div
        ref={containerRef}
        className={`${styles.container} ${isVisible ? styles.visible : ""}`}
      >
        <h2 className={styles.title}>
          <span className={styles.titleAccent}>//</span> AI Feed
        </h2>
        <p className={styles.subtitle}>
          AI research and developments I&apos;m following
        </p>

        <div ref={timelineRef} className={styles.timelineWrapper}>
          <a
            className="twitter-timeline"
            data-lang="en"
            data-dnt="true"
            data-theme="dark"
            data-height="400"
            data-chrome="noheader nofooter noborders transparent"
            href="https://twitter.com/symbian2111?ref_src=twsrc%5Etfw"
          >
            Tweets by symbian2111
          </a>
        </div>
      </div>
    </section>
  );
});

export default AIFeed;
