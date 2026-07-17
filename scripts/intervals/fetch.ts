interface IntervalsActivity {
  id: string;
  name?: string;
  type?: string;
  start_date?: string;
  start_date_local?: string;
  distance?: number;
  moving_time?: number;
  moving_time_secs?: number;
  elapsed_time?: number;
  elapsed_time_secs?: number;
}

interface RunningActivity {
  id: string;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  start_date: string;
}

interface RunningStats {
  totalDistance: number;
  totalRuns: number;
  totalTime: number;
  ytdDistance: number;
  ytdRuns: number;
  recentDistance: number;
  recentRuns: number;
}

interface StoredRunningData {
  stats: RunningStats;
  recentActivities: RunningActivity[];
  lastUpdated: string;
  expiresAt: string;
}

const INTERVALS_API_BASE = "https://intervals.icu/api/v1";
const RUN_TYPES = new Set(["Run", "VirtualRun", "TrailRun", "Treadmill"]);

function getAuthHeader(): string {
  const apiKey = process.env.INTERVALS_ICU_API_KEY;

  if (!apiKey) {
    throw new Error("INTERVALS_ICU_API_KEY must be set in environment");
  }

  return `Basic ${Buffer.from(`API_KEY:${apiKey}`).toString("base64")}`;
}

function getAthleteId(): string {
  return process.env.INTERVALS_ICU_ATHLETE_ID || "0";
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getActivityTime(activity: IntervalsActivity): number {
  return (
    activity.moving_time ??
    activity.moving_time_secs ??
    activity.elapsed_time ??
    activity.elapsed_time_secs ??
    0
  );
}

function isRun(activity: IntervalsActivity): boolean {
  const type = activity.type ?? "";
  return RUN_TYPES.has(type) || type.toLowerCase().includes("run");
}

function toRunningActivity(activity: IntervalsActivity): RunningActivity {
  return {
    id: activity.id,
    name: activity.name || "Run",
    type: activity.type || "Run",
    distance: activity.distance ?? 0,
    moving_time: getActivityTime(activity),
    start_date: activity.start_date || activity.start_date_local || new Date().toISOString(),
  };
}

function transformStats(activities: RunningActivity[], now: Date): RunningStats {
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const recentCutoff = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

  return activities.reduce<RunningStats>(
    (stats, activity) => {
      const startDate = new Date(activity.start_date);

      stats.totalDistance += activity.distance;
      stats.totalRuns += 1;
      stats.totalTime += activity.moving_time;

      if (startDate >= startOfYear) {
        stats.ytdDistance += activity.distance;
        stats.ytdRuns += 1;
      }

      if (startDate >= recentCutoff) {
        stats.recentDistance += activity.distance;
        stats.recentRuns += 1;
      }

      return stats;
    },
    {
      totalDistance: 0,
      totalRuns: 0,
      totalTime: 0,
      ytdDistance: 0,
      ytdRuns: 0,
      recentDistance: 0,
      recentRuns: 0,
    },
  );
}

async function fetchActivities(): Promise<IntervalsActivity[]> {
  const now = new Date();
  const oldest = process.env.INTERVALS_ICU_OLDEST || "1970-01-01";
  const newest = process.env.INTERVALS_ICU_NEWEST || formatDate(now);
  const url = new URL(`${INTERVALS_API_BASE}/athlete/${getAthleteId()}/activities`);

  url.searchParams.set("oldest", oldest);
  url.searchParams.set("newest", newest);

  const response = await fetch(url, {
    headers: {
      Authorization: getAuthHeader(),
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch Intervals.icu activities: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function fetchAndStoreData(outputPath: string): Promise<StoredRunningData> {
  console.log("Fetching Intervals.icu activities...");
  const activities = (await fetchActivities())
    .filter(isRun)
    .map(toRunningActivity)
    .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  const now = new Date();
  const data: StoredRunningData = {
    stats: transformStats(activities, now),
    recentActivities: activities.slice(0, 5),
    lastUpdated: now.toISOString(),
    expiresAt: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString(),
  };

  await Bun.write(outputPath, JSON.stringify(data, null, 2));
  console.log(`Data saved to ${outputPath}`);
  console.log(`Fetched ${activities.length} running activities`);

  return data;
}

if (import.meta.main) {
  const outputPath = process.argv[2] || "public/data/running.json";

  fetchAndStoreData(outputPath)
    .then((data) => {
      console.log("Running data fetched successfully");
      console.log(JSON.stringify(data.stats, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Running data fetch failed:", err);
      process.exit(1);
    });
}
