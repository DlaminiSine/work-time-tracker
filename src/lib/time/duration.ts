export type SessionLike = {
  clockIn: Date | string;
  clockOut: Date | string | null;
};

export type DailyDuration = {
  date: string;
  minutes: number;
};

const minuteMs = 60_000;
const dayMs = 24 * 60 * minuteMs;

function toDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }

  return date;
}

function utcDayStart(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function getDurationMinutes(clockIn: Date | string, clockOut: Date | string | null, now = new Date()) {
  const start = toDate(clockIn);
  const end = clockOut ? toDate(clockOut) : now;
  const elapsed = end.getTime() - start.getTime();

  return Math.max(0, Math.floor(elapsed / minuteMs));
}

export function formatDuration(totalMinutes: number) {
  const safeMinutes = Math.max(0, Math.floor(totalMinutes));
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

export function toDecimalHours(totalMinutes: number) {
  return totalMinutes / 60;
}

export function estimateEarnings(totalMinutes: number, hourlyRate: number | null | undefined) {
  if (hourlyRate == null) {
    return null;
  }

  return toDecimalHours(totalMinutes) * hourlyRate;
}

export function splitSessionByUtcDay(session: SessionLike, now = new Date()): DailyDuration[] {
  const start = toDate(session.clockIn);
  const end = session.clockOut ? toDate(session.clockOut) : now;

  if (end <= start) {
    return [];
  }

  const slices: DailyDuration[] = [];
  let cursor = start;

  while (cursor < end) {
    const dayStart = utcDayStart(cursor);
    const nextDayStart = new Date(dayStart.getTime() + dayMs);
    const sliceEnd = new Date(Math.min(end.getTime(), nextDayStart.getTime()));
    const minutes = getDurationMinutes(cursor, sliceEnd);

    if (minutes > 0) {
      slices.push({
        date: dayStart.toISOString().slice(0, 10),
        minutes,
      });
    }

    cursor = sliceEnd;
  }

  return slices;
}

export function getUtcWeekRange(date: Date | string, weekStartsOn: 0 | 1 = 0) {
  const target = toDate(date);
  const dayStart = utcDayStart(target);
  const day = dayStart.getUTCDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const start = new Date(dayStart.getTime() - diff * dayMs);
  const end = new Date(start.getTime() + 7 * dayMs);

  return { start, end };
}

export function getUtcMonthRange(date: Date | string) {
  const target = toDate(date);
  const start = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), 1));
  const end = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 1));

  return { start, end };
}

export function sumSessionMinutesInRange(
  sessions: SessionLike[],
  rangeStart: Date | string,
  rangeEnd: Date | string,
  now = new Date(),
) {
  const start = toDate(rangeStart).getTime();
  const end = toDate(rangeEnd).getTime();

  if (end <= start) {
    return 0;
  }

  return sessions.reduce((total, session) => {
    const sessionStart = toDate(session.clockIn).getTime();
    const sessionEnd = session.clockOut ? toDate(session.clockOut).getTime() : now.getTime();
    const overlapStart = Math.max(start, sessionStart);
    const overlapEnd = Math.min(end, sessionEnd);

    if (overlapEnd <= overlapStart) {
      return total;
    }

    return total + Math.floor((overlapEnd - overlapStart) / minuteMs);
  }, 0);
}

export function getWeeklyTotalMinutes(sessions: SessionLike[], date: Date | string, weekStartsOn: 0 | 1 = 0) {
  const range = getUtcWeekRange(date, weekStartsOn);
  return sumSessionMinutesInRange(sessions, range.start, range.end);
}

export function getMonthlyTotalMinutes(sessions: SessionLike[], date: Date | string) {
  const range = getUtcMonthRange(date);
  return sumSessionMinutesInRange(sessions, range.start, range.end);
}
