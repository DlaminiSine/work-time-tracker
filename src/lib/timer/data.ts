import "server-only";

import { getProfilePreferences, type ProfilePreferences } from "@/lib/profiles/queries";
import { getActiveCompanyProjectOptions, type CompanyProjectOption } from "@/lib/timer/options";
import { getProjectMinutesForRange, getTimerSummaryTotals } from "@/lib/timer/summary";
import { getWeeklyTargetProgress, type WeeklyTargetProgress } from "@/lib/timer/targets";
import { sessionOverlapsRange } from "@/lib/time/duration";
import {
  getActiveWorkSession,
  getSessionsOverlappingRange,
  toSessionLike,
  type WorkSessionWithDetails,
} from "@/lib/work-sessions/queries";

export type TimerPageData = {
  profile: ProfilePreferences;
  options: CompanyProjectOption[];
  activeSession: WorkSessionWithDetails | null;
  todayCompletedSessions: WorkSessionWithDetails[];
  totals: {
    today: number;
    week: number;
    month: number;
  };
  activeProjectWeeklyTarget: WeeklyTargetProgress | null;
};

export async function getTimerPageData(userId: string, now = new Date()): Promise<TimerPageData> {
  const [profile, options, activeSession] = await Promise.all([
    getProfilePreferences(userId),
    getActiveCompanyProjectOptions(userId),
    getActiveWorkSession(userId),
  ]);

  const emptyTotals = getTimerSummaryTotals({
    sessions: [],
    now,
    timezone: profile.timezone,
    weekStartsOn: profile.week_starts_on,
  });
  const sessions = await getSessionsOverlappingRange({
    userId,
    range: emptyTotals.ranges.query,
  });
  const summarySessions = sessions.map((session) => toSessionLike(session));
  const totals = getTimerSummaryTotals({
    sessions: summarySessions,
    now,
    timezone: profile.timezone,
    weekStartsOn: profile.week_starts_on,
  });
  const activeProjectWeeklyMinutes = activeSession?.project
    ? getProjectMinutesForRange({
        sessions: sessions.map((session) => ({
          ...toSessionLike(session),
          projectId: session.project_id,
        })),
        projectId: activeSession.project.id,
        range: totals.ranges.week,
        now,
      })
    : 0;

  return {
    profile,
    options,
    activeSession,
    todayCompletedSessions: sessions.filter(
      (session) =>
        session.clock_out !== null &&
        sessionOverlapsRange(toSessionLike(session), totals.ranges.today.start, totals.ranges.today.end),
    ),
    totals: {
      today: totals.today,
      week: totals.week,
      month: totals.month,
    },
    activeProjectWeeklyTarget: getWeeklyTargetProgress(
      activeProjectWeeklyMinutes,
      activeSession?.project?.weekly_target_minutes,
    ),
  };
}
