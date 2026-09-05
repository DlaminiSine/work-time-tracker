import { formatInTimeZone } from "date-fns-tz";
import type { TimeFormat } from "@/lib/supabase/types";

const secondMs = 1_000;

function toDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }

  return date;
}

export function getElapsedSeconds(clockIn: Date | string, now = new Date()) {
  const elapsed = now.getTime() - toDate(clockIn).getTime();
  return Math.max(0, Math.floor(elapsed / secondMs));
}

export function formatElapsedClock(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

export function formatClockTime(
  timestamp: Date | string,
  timezone: string,
  timeFormat: TimeFormat = "12h",
) {
  return formatInTimeZone(toDate(timestamp), timezone, timeFormat === "24h" ? "HH:mm" : "h:mm a");
}

export function formatClockTimeRange(
  clockIn: Date | string,
  clockOut: Date | string | null,
  timezone: string,
  timeFormat: TimeFormat = "12h",
) {
  const start = formatClockTime(clockIn, timezone, timeFormat);
  const end = clockOut ? formatClockTime(clockOut, timezone, timeFormat) : "Now";

  return `${start}-${end}`;
}
