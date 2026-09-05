import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Company, Project, WorkSession } from "@/lib/supabase/types";
import {
  getDayRange,
  getMonthRange,
  getWeekRange,
  type ReportingRange,
  type SessionLike,
} from "@/lib/time/duration";

export type WorkSessionProject = Pick<
  Project,
  "id" | "name" | "company_id" | "color" | "is_archived" | "weekly_target_minutes" | "hourly_rate" | "currency"
>;

export type WorkSessionCompany = Pick<Company, "id" | "name" | "color" | "is_archived">;

export type WorkSessionWithDetails = WorkSession & {
  project: WorkSessionProject | null;
  company: WorkSessionCompany | null;
};

export function toSessionLike(session: Pick<WorkSession, "clock_in" | "clock_out">): SessionLike {
  return {
    clockIn: session.clock_in,
    clockOut: session.clock_out,
  };
}

async function hydrateWorkSessions(userId: string, sessions: WorkSession[]): Promise<WorkSessionWithDetails[]> {
  if (sessions.length === 0) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const projectIds = Array.from(new Set(sessions.map((session) => session.project_id)));
  const { data: projects, error: projectError } = await supabase
    .from("projects")
    .select("id,name,company_id,color,is_archived,weekly_target_minutes,hourly_rate,currency")
    .eq("user_id", userId)
    .in("id", projectIds);

  if (projectError) {
    throw new Error(`Unable to load session projects: ${projectError.message}`);
  }

  const projectRows = projects ?? [];
  const companyIds = Array.from(new Set(projectRows.map((project) => project.company_id)));
  const { data: companies, error: companyError } =
    companyIds.length > 0
      ? await supabase
          .from("companies")
          .select("id,name,color,is_archived")
          .eq("user_id", userId)
          .in("id", companyIds)
      : { data: [], error: null };

  if (companyError) {
    throw new Error(`Unable to load session companies: ${companyError.message}`);
  }

  const projectsById = new Map(projectRows.map((project) => [project.id, project]));
  const companiesById = new Map((companies ?? []).map((company) => [company.id, company]));

  return sessions.map((session) => {
    const project = projectsById.get(session.project_id) ?? null;

    return {
      ...session,
      project,
      company: project ? companiesById.get(project.company_id) ?? null : null,
    };
  });
}

export async function getActiveWorkSession(userId: string): Promise<WorkSessionWithDetails | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("work_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("clock_out", null)
    .order("clock_in", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load active work session: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [session] = await hydrateWorkSessions(userId, [data]);
  return session ?? null;
}

export async function getSessionsOverlappingRange({
  userId,
  range,
  completedOnly = false,
}: {
  userId: string;
  range: ReportingRange;
  completedOnly?: boolean;
}): Promise<WorkSessionWithDetails[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("work_sessions")
    .select("*")
    .eq("user_id", userId)
    .lt("clock_in", range.end.toISOString())
    .or(`clock_out.is.null,clock_out.gt.${range.start.toISOString()}`);

  if (completedOnly) {
    query = query.not("clock_out", "is", null);
  }

  const { data, error } = await query.order("clock_in", { ascending: false });

  if (error) {
    throw new Error(`Unable to load work sessions: ${error.message}`);
  }

  return hydrateWorkSessions(userId, data ?? []);
}

export function getTodaySessions({
  userId,
  date,
  timezone,
}: {
  userId: string;
  date: Date | string;
  timezone: string;
}) {
  return getSessionsOverlappingRange({ userId, range: getDayRange(date, timezone) });
}

export function getCurrentWeekSessions({
  userId,
  date,
  timezone,
  weekStartsOn,
}: {
  userId: string;
  date: Date | string;
  timezone: string;
  weekStartsOn: 0 | 1;
}) {
  return getSessionsOverlappingRange({ userId, range: getWeekRange(date, timezone, weekStartsOn) });
}

export function getCurrentMonthSessions({
  userId,
  date,
  timezone,
}: {
  userId: string;
  date: Date | string;
  timezone: string;
}) {
  return getSessionsOverlappingRange({ userId, range: getMonthRange(date, timezone) });
}
