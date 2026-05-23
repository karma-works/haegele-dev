import { memo, useEffect, useRef } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import styles from "./AIFeed.module.css";

const AI_FEED_HANDLE = "moatshfit";
const AI_FEED_URL = `https://twitter.com/${AI_FEED_HANDLE}`;
const AI_FEED_LABEL = `AI research feed by @${AI_FEED_HANDLE}`;

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

  useEffect(() => {
    const wrapper = timelineRef.current;
    if (!wrapper) return;

    const observer = new MutationObserver(() => {
      const iframe = wrapper.querySelector('iframe');
      if (iframe && !iframe.getAttribute('title')) {
        iframe.setAttribute('title', `${AI_FEED_LABEL} on X`);
        observer.disconnect();
      }
    });

    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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

        <div ref={timelineRef} className={styles.timelineWrapper} aria-label="Embedded X/Twitter feed">
          <a
            className="twitter-timeline"
            data-lang="en"
            data-dnt="true"
            data-theme="dark"
            data-height="400"
            data-chrome="noheader nofooter noborders transparent"
            href={`${AI_FEED_URL}?ref_src=twsrc%5Etfw`}
          >
            View {AI_FEED_LABEL} on X (Twitter)
          </a>
        </div>
        <p className={styles.fallbackLink}>
          <a
            href={AI_FEED_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${AI_FEED_LABEL} on X, opens in new tab`}
          >
            View full feed on X ↗
          </a>
        </p>
      </div>
    </section>
  );
});

export default AIFeed;
