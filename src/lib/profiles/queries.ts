import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";

export type ProfilePreferences = Pick<
  Profile,
  "timezone" | "time_format" | "week_starts_on" | "default_currency"
>;

export const defaultProfilePreferences: ProfilePreferences = {
  timezone: "America/New_York",
  time_format: "12h",
  week_starts_on: 0,
  default_currency: "USD",
};

export async function getProfilePreferences(userId: string): Promise<ProfilePreferences> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("timezone,time_format,week_starts_on,default_currency")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load profile preferences: ${error.message}`);
  }

  return data ?? defaultProfilePreferences;
}
