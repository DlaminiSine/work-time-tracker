import "server-only";

import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ActionContext =
  | {
      ok: true;
      userId: string;
      supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
    }
  | {
      ok: false;
      message: string;
    };

export async function getActionContext(): Promise<ActionContext> {
  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: "Supabase is not configured yet. Add the environment variables before managing records.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      ok: false,
      message: "Your session has expired. Sign in again and retry.",
    };
  }

  return {
    ok: true,
    userId: data.user.id,
    supabase,
  };
}
