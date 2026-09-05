import "server-only";

import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUserResult = {
  isConfigured: boolean;
  user: User | null;
  error?: string;
};

export async function getCurrentUser(): Promise<CurrentUserResult> {
  if (!isSupabaseConfigured()) {
    return { isConfigured: false, user: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { isConfigured: true, user: null, error: error.message };
  }

  return { isConfigured: true, user: data.user };
}
