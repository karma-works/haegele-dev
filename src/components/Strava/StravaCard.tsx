import { memo, useCallback, useState } from 'react';
import { useEffects } from '../../contexts/EffectsContext.tsx';
import { useStravaData, type StravaStats, type StravaActivity } from '../../hooks/useStravaData.ts';
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

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

function ActivityItem({ activity }: { activity: StravaActivity }) {
  return (
    <li className={styles.activityItem}>
      <span className={styles.activityName}>{activity.name}</span>
      <span className={styles.activityDistance}>{formatDistance(activity.distance)} km</span>
      <span className={styles.activityDate}>{formatRelativeDate(activity.start_date)}</span>
    </li>
  );
}

function ActivityList({ activities, isStale }: { activities: StravaActivity[]; isStale: boolean }) {
  if (activities.length === 0) {
    return <div className={styles.noActivities}>No recent activities</div>;
  }

  return (
    <div className={styles.activitiesSection}>
      <div className={styles.activitiesHeader}>
        <span className={styles.activitiesTitle}>Recent Activities</span>
        {isStale && <span className={styles.staleIndicator}>Using cached data</span>}
      </div>
      <ul className={styles.activityList} aria-label="Recent activities">
        {activities.slice(0, 3).map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </ul>
    </div>
  );
}

function PlaceholderActivities() {
  return (
    <div className={styles.activitiesSection}>
      <div className={styles.activitiesHeader}>
        <span className={styles.activitiesTitle}>Recent Activities</span>
      </div>
      <ul className={styles.activityList} aria-label="Recent activities placeholder">
        {[1, 2, 3].map((i) => (
          <li key={i} className={styles.activityItem}>
            <span className={styles.activityName}>--</span>
            <span className={styles.activityDistance}>-- km</span>
            <span className={styles.activityDate}>--</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className={styles.errorState} role="alert">
      <span className={styles.errorIcon}>!</span>
      <span className={styles.errorMessage}>{message}</span>
    </div>
  );
}

function StravaCardBase({ className }: StravaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { stats, activities, isLoading, isAvailable, error, isStale } = useStravaData();
  const { waveSetHeartbeat } = useEffects();

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    waveSetHeartbeat(true);
  }, [waveSetHeartbeat]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    waveSetHeartbeat(false);
  }, [waveSetHeartbeat]);

  const showStats = isAvailable && stats;
  const showActivities = isAvailable;
  const showError = error && !isAvailable;

  return (
    <div
      className={`${styles.card} ${isHovered ? styles.hovered : ''} ${isStale ? styles.stale : ''} ${className ?? ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label="Running Statistics from Strava"
      aria-busy={isLoading}
    >
      <div className={styles.header}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066l-2.084 4.116zM7.731 8.712l2.928 5.772h4.574L7.731 0 0 14.484h4.574l3.157-5.772z" />
          </svg>
        </div>
        <div className={styles.title}>
          <h3>Running</h3>
          {!isAvailable && !isLoading && <span className={styles.unavailable}>Connect Strava</span>}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span>Loading stats...</span>
        </div>
      ) : (
        <>
          {showError && <ErrorState message={error} />}
          {showStats ? <StatsDisplay stats={stats} /> : !showError && <PlaceholderStats />}
          {showActivities ? (
            <ActivityList activities={activities} isStale={isStale} />
          ) : !showError ? (
            <PlaceholderActivities />
          ) : null}
        </>
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
