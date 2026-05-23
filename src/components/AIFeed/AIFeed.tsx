import { memo, useEffect, useState } from "react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import styles from "./AIFeed.module.css";

const BLUESKY_HANDLE = "moatshift.bsky.social";
const BLUESKY_PROFILE_URL = `https://bsky.app/profile/${BLUESKY_HANDLE}`;
const BLUESKY_FEED_URL = `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${BLUESKY_HANDLE}&limit=5`;

interface BlueskyPost {
  uri: string;
  cid: string;
  record: {
    text?: string;
    createdAt?: string;
  };
  author: {
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  likeCount?: number;
  repostCount?: number;
  replyCount?: number;
}

interface BlueskyFeedItem {
  post: BlueskyPost;
}

interface BlueskyFeedResponse {
  feed?: BlueskyFeedItem[];
}

export const AIFeed = memo(function AIFeed() {
  const [containerRef, isVisible] = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
  });
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!isVisible || status !== "idle") return;

    const controller = new AbortController();

    const loadFeed = async () => {
      setStatus("loading");

      try {
        const response = await fetch(BLUESKY_FEED_URL, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Bluesky feed request failed: ${response.status}`);
        }

        const data = (await response.json()) as BlueskyFeedResponse;
        setPosts(data.feed?.map((item) => item.post) ?? []);
        setStatus("ready");
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setStatus("error");
        }
      }
    };

    void loadFeed();

    return () => controller.abort();
  }, [isVisible, status]);

  const getPostUrl = (post: BlueskyPost) => {
    const postId = post.uri.split("/").pop();
    return `${BLUESKY_PROFILE_URL}/post/${postId}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "";

    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  };

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

        <div className={styles.feedWrapper} aria-live="polite">
          {status === "loading" && (
            <p className={styles.feedState}>Loading Bluesky feed...</p>
          )}

          {status === "error" && (
            <p className={styles.feedState}>
              Bluesky feed is unavailable right now.
            </p>
          )}

          {status === "ready" &&
            posts.map((post) => (
              <article key={post.cid} className={styles.postCard}>
                <header className={styles.postHeader}>
                  {post.author.avatar && (
                    <img
                      src={post.author.avatar}
                      alt=""
                      className={styles.avatar}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className={styles.authorName}>
                      {post.author.displayName || post.author.handle}
                    </p>
                    <p className={styles.authorHandle}>@{post.author.handle}</p>
                  </div>
                  <time
                    className={styles.postDate}
                    dateTime={post.record.createdAt}
                  >
                    {formatDate(post.record.createdAt)}
                  </time>
                </header>

                <p className={styles.postText}>{post.record.text}</p>

                <a
                  className={styles.postLink}
                  href={getPostUrl(post)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open post
                </a>
              </article>
            ))}
        </div>
        <p className={styles.fallbackLink}>
          <a
            href={BLUESKY_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View @${BLUESKY_HANDLE} on Bluesky, opens in new tab`}
          >
            View full feed on Bluesky ↗
          </a>
        </p>
      </div>
    </section>
  );
});

export default AIFeed;
