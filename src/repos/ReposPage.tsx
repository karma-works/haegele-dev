import { useState, useEffect } from 'react';
import styles from './ReposPage.module.css';

interface Repo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  archived: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReposPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const res = await fetch(
          'https://api.github.com/users/karma-works/repos?per_page=100&sort=updated',
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const data: Repo[] = await res.json();
        setRepos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repos');
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="/" className={styles.backLink}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" />
            </svg>
            haegele.dev
          </a>
          <div className={styles.headerMeta}>
            <h1 className={styles.title}>
              <span className={styles.titleAccent}>$</span> gh repo list karma-works
            </h1>
            <div className={styles.links}>
              <a
                href="https://github.com/karma-works"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                github.com/karma-works
              </a>
              <a
                href="https://x.com/moatshfit"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.externalLink}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.213 5.567L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                </svg>
                @moatshfit
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {loading && (
          <div className={styles.state}>
            <span className={styles.stateText}>Fetching repos...</span>
          </div>
        )}
        {error && (
          <div className={styles.state}>
            <span className={styles.stateError}>{error}</span>
          </div>
        )}
        {!loading && !error && (
          <>
            <p className={styles.count}>
              <span className={styles.countNum}>{repos.length}</span> repositories
            </p>
            <ul className={styles.repoList}>
              {repos.map((repo) => (
                <li key={repo.id} className={styles.repoItem}>
                  <div className={styles.repoMain}>
                    <div className={styles.repoTitleRow}>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.repoName}
                      >
                        {repo.name}
                      </a>
                      {repo.archived && (
                        <span className={styles.archivedBadge}>archived</span>
                      )}
                    </div>
                    {repo.description && (
                      <p className={styles.repoDescription}>{repo.description}</p>
                    )}
                    {repo.topics.length > 0 && (
                      <div className={styles.topics}>
                        {repo.topics.map((topic) => (
                          <span key={topic} className={styles.topic}>
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={styles.repoMeta}>
                    {repo.language && (
                      <span className={styles.metaItem}>
                        <span className={styles.langDot} />
                        {repo.language}
                      </span>
                    )}
                    {repo.stargazers_count > 0 && (
                      <span className={styles.metaItem}>
                        <svg viewBox="0 0 16 16" fill="currentColor" className={styles.metaIcon}>
                          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
                        </svg>
                        {repo.stargazers_count}
                      </span>
                    )}
                    <span className={styles.metaItem}>
                      Updated {formatDate(repo.updated_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
