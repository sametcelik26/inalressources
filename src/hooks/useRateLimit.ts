/**
 * Client-side rate limiter using localStorage.
 * Tracks submission timestamps per form key and enforces
 * a cooldown period + max submissions within a time window.
 */

interface RateLimitConfig {
  /** Unique key for this form (e.g. "contact", "candidate") */
  key: string;
  /** Minimum seconds between submissions (default: 30) */
  cooldownSeconds?: number;
  /** Max submissions allowed within the time window (default: 5) */
  maxSubmissions?: number;
  /** Time window in seconds for maxSubmissions check (default: 3600 = 1 hour) */
  windowSeconds?: number;
}

interface RateLimitResult {
  /** Whether the user is currently rate-limited */
  isLimited: boolean;
  /** Seconds remaining until next submission allowed (0 if not limited) */
  remainingSeconds: number;
  /** Record a new submission */
  recordSubmission: () => void;
  /** Check if submission is allowed (returns true if OK) */
  checkLimit: () => boolean;
}

const STORAGE_PREFIX = "rl_";

function getTimestamps(key: string): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return [];
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

function setTimestamps(key: string, timestamps: number[]) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(timestamps));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function useRateLimit({
  key,
  cooldownSeconds = 30,
  maxSubmissions = 5,
  windowSeconds = 3600,
}: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cooldownMs = cooldownSeconds * 1000;

  // Clean old timestamps outside window
  const timestamps = getTimestamps(key).filter((ts) => now - ts < windowMs);

  const lastSubmission = timestamps.length > 0 ? timestamps[timestamps.length - 1] : 0;
  const cooldownRemaining = Math.max(0, cooldownMs - (now - lastSubmission));
  const isOverMax = timestamps.length >= maxSubmissions;
  const isInCooldown = cooldownRemaining > 0;
  const isLimited = isInCooldown || isOverMax;

  let remainingSeconds = 0;
  if (isInCooldown) {
    remainingSeconds = Math.ceil(cooldownRemaining / 1000);
  } else if (isOverMax && timestamps.length > 0) {
    // Time until the oldest timestamp in window expires
    const oldest = timestamps[0];
    remainingSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);
  }

  const recordSubmission = () => {
    timestamps.push(Date.now());
    setTimestamps(key, timestamps);
  };

  const checkLimit = (): boolean => {
    const freshNow = Date.now();
    const fresh = getTimestamps(key).filter((ts) => freshNow - ts < windowMs);
    const lastTs = fresh.length > 0 ? fresh[fresh.length - 1] : 0;
    if (freshNow - lastTs < cooldownMs) return false;
    if (fresh.length >= maxSubmissions) return false;
    return true;
  };

  return { isLimited, remainingSeconds, recordSubmission, checkLimit };
}
