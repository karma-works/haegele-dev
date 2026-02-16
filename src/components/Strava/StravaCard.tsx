import { memo, useCallback, useState } from 'react';
import { useEffects } from '../../contexts/EffectsContext.tsx';
import { useStravaData, type StravaStats } from '../../hooks/useStravaData.ts';
import styles from './StravaCard.module.css';

interface StravaCardProps {
  className?: string;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km.toFixed(1);
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  if (hours >= 1) {
    return `${hours}h ${Math.floor((seconds % 3600) / 60)}m`;
  }
  return `${Math.floor(seconds / 60)}m`;
}

function StatsDisplay({ stats }: { stats: StravaStats }) {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>This Year</span>
        <span className={styles.statValue}>{formatDistance(stats.ytdDistance)} km</span>
        <span className={styles.statSub}>{stats.ytdRuns} runs</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Last 4 Weeks</span>
        <span className={styles.statValue}>{formatDistance(stats.recentDistance)} km</span>
        <span className={styles.statSub}>{stats.recentRuns} runs</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>All Time</span>
        <span className={styles.statValue}>{formatDistance(stats.totalDistance)} km</span>
        <span className={styles.statSub}>{stats.totalRuns} runs</span>
      </div>
    </div>
  );
}

function PlaceholderStats() {
  return (
    <div className={styles.statsGrid}>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>This Year</span>
        <span className={styles.statValue}>-- km</span>
        <span className={styles.statSub}>-- runs</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>Last 4 Weeks</span>
        <span className={styles.statValue}>-- km</span>
        <span className={styles.statSub}>-- runs</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statLabel}>All Time</span>
        <span className={styles.statValue}>-- km</span>
        <span className={styles.statSub}>-- runs</span>
      </div>
    </div>
  );
}

function StravaCardBase({ className }: StravaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { stats, isLoading, isAvailable } = useStravaData();
  const { waveSetHeartbeat } = useEffects();

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    waveSetHeartbeat(true);
  }, [waveSetHeartbeat]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    waveSetHeartbeat(false);
  }, [waveSetHeartbeat]);

  return (
    <div
      className={`${styles.card} ${isHovered ? styles.hovered : ''} ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Running Statistics from Strava"
    >
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zM7.731 8.712l2.928 5.772h4.574L7.731 0 0 14.484h4.574l3.157-5.772z" />
          </svg>
        </div>
        <div className={styles.title}>
          <h3>Running</h3>
          {!isAvailable && <span className={styles.unavailable}>Connect Strava</span>}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Loading stats...</span>
        </div>
      ) : isAvailable && stats ? (
        <StatsDisplay stats={stats} />
      ) : (
        <PlaceholderStats />
      )}

      {isHovered && (
        <div className={styles.heartbeatIndicator}>
          <span className={styles.pulse} />
        </div>
      )}
    </div>
  );
}

export const StravaCard = memo(StravaCardBase);
