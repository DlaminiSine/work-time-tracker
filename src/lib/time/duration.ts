import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export type SessionLike = {
  clockIn: Date | string;
  clockOut: Date | string | null;
};

export type DailyDuration = {
  date: string;
  minutes: number;
};

export type ReportingRange = {
  start: Date;
  end: Date;
};

const minuteMs = 60_000;
const dayCountInWeek = 7;

function toDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${String(value)}`);
  }

  return date;
}

function assertValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new Error(`Invalid timezone: ${timezone}`);
  }
}

function getDateParts(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  return { year, month, day };
}

function toDateKey(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
}

function addDaysToDateKey(dateKey: string, amount: number) {
  const { year, month, day } = getDateParts(dateKey);
  return toDateKey(year, month, day + amount);
}

function getWeekday(dateKey: string) {
  const { year, month, day } = getDateParts(dateKey);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function getDateKeyInTimezone(date: Date | string, timezone: string) {
  assertValidTimezone(timezone);
  return formatInTimeZone(toDate(date), timezone, "yyyy-MM-dd");
}

function startOfLocalDay(dateKey: string, timezone: string) {
  return fromZonedTime(`${dateKey}T00:00:00`, timezone);
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

export function getDayRange(date: Date | string, timezone: string): ReportingRange {
  const dateKey = getDateKeyInTimezone(date, timezone);
  const nextDateKey = addDaysToDateKey(dateKey, 1);

  return {
    start: startOfLocalDay(dateKey, timezone),
    end: startOfLocalDay(nextDateKey, timezone),
  };
}

export function splitSessionByDay(session: SessionLike, timezone: string, now = new Date()): DailyDuration[] {
  assertValidTimezone(timezone);

  const start = toDate(session.clockIn);
  const end = session.clockOut ? toDate(session.clockOut) : now;

  if (end <= start) {
    return [];
  }

  const slices: DailyDuration[] = [];
  let cursor = start;

  while (cursor < end) {
    const dateKey = getDateKeyInTimezone(cursor, timezone);
    const nextDateKey = addDaysToDateKey(dateKey, 1);
    const nextDayStart = startOfLocalDay(nextDateKey, timezone);
    const sliceEnd = new Date(Math.min(end.getTime(), nextDayStart.getTime()));
    const minutes = getDurationMinutes(cursor, sliceEnd);

    if (minutes > 0) {
      slices.push({
        date: dateKey,
        minutes,
      });
    }

    cursor = sliceEnd;
  }

  return slices;
}

export function getWeekRange(date: Date | string, timezone: string, weekStartsOn: 0 | 1 = 0): ReportingRange {
  const dateKey = getDateKeyInTimezone(date, timezone);
  const diff = (getWeekday(dateKey) - weekStartsOn + dayCountInWeek) % dayCountInWeek;
  const startDateKey = addDaysToDateKey(dateKey, -diff);
  const endDateKey = addDaysToDateKey(startDateKey, dayCountInWeek);

  return {
    start: startOfLocalDay(startDateKey, timezone),
    end: startOfLocalDay(endDateKey, timezone),
  };
}

export function getMonthRange(date: Date | string, timezone: string): ReportingRange {
  const dateKey = getDateKeyInTimezone(date, timezone);
  const { year, month } = getDateParts(dateKey);
  const startDateKey = toDateKey(year, month, 1);
  const endDateKey = toDateKey(year, month + 1, 1);

  return {
    start: startOfLocalDay(startDateKey, timezone),
    end: startOfLocalDay(endDateKey, timezone),
  };
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

export function sessionOverlapsRange(
  session: SessionLike,
  rangeStart: Date | string,
  rangeEnd: Date | string,
) {
  const start = toDate(rangeStart).getTime();
  const end = toDate(rangeEnd).getTime();
  const sessionStart = toDate(session.clockIn).getTime();
  const sessionEnd = session.clockOut ? toDate(session.clockOut).getTime() : Number.POSITIVE_INFINITY;

  return sessionStart < end && sessionEnd > start;
}

export function getDailyTotalMinutes(sessions: SessionLike[], date: Date | string, timezone: string, now = new Date()) {
  const range = getDayRange(date, timezone);
  return sumSessionMinutesInRange(sessions, range.start, range.end, now);
}

export function getWeeklyTotalMinutes(
  sessions: SessionLike[],
  date: Date | string,
  timezone: string,
  weekStartsOn: 0 | 1 = 0,
  now = new Date(),
) {
  const range = getWeekRange(date, timezone, weekStartsOn);
  return sumSessionMinutesInRange(sessions, range.start, range.end, now);
}

export function getMonthlyTotalMinutes(sessions: SessionLike[], date: Date | string, timezone: string, now = new Date()) {
  const range = getMonthRange(date, timezone);
  return sumSessionMinutesInRange(sessions, range.start, range.end, now);
}
