import {
  getDayRange,
  getMonthRange,
  getWeekRange,
  sumSessionMinutesInRange,
  type ReportingRange,
  type SessionLike,
} from "@/lib/time/duration";

export type TimerSummaryTotals = {
  today: number;
  week: number;
  month: number;
  ranges: {
    today: ReportingRange;
    week: ReportingRange;
    month: ReportingRange;
    query: ReportingRange;
  };
};

export function getEarliestRangeStart(ranges: ReportingRange[]) {
  return ranges.reduce((earliest, range) => (range.start < earliest ? range.start : earliest), ranges[0].start);
}

export function getTimerSummaryTotals({
  sessions,
  now,
  timezone,
  weekStartsOn,
}: {
  sessions: SessionLike[];
  now: Date;
  timezone: string;
  weekStartsOn: 0 | 1;
}): TimerSummaryTotals {
  const today = getDayRange(now, timezone);
  const week = getWeekRange(now, timezone, weekStartsOn);
  const month = getMonthRange(now, timezone);
  const query = {
    start: getEarliestRangeStart([today, week, month]),
    end: now,
  };

  return {
    today: sumSessionMinutesInRange(sessions, today.start, now, now),
    week: sumSessionMinutesInRange(sessions, week.start, now, now),
    month: sumSessionMinutesInRange(sessions, month.start, now, now),
    ranges: {
      today,
      week,
      month,
      query,
    },
  };
}

export function getProjectMinutesForRange({
  sessions,
  projectId,
  range,
  now,
}: {
  sessions: (SessionLike & { projectId?: string })[];
  projectId: string;
  range: ReportingRange;
  now: Date;
}) {
  return sumSessionMinutesInRange(
    sessions.filter((session) => session.projectId === projectId),
    range.start,
    now,
    now,
  );
}
