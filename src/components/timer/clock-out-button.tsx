"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";
import { initialFormActionState } from "@/lib/forms/action-state";
import { clockOutAction } from "@/lib/work-sessions/actions";

export function ClockOutButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(clockOutAction, initialFormActionState);

  React.useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [router, state.status]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="sessionId" value={sessionId} />
      <Button type="submit" size="lg" variant="destructive" className="w-full">
        <LogOut className="size-4" aria-hidden="true" />
        {isPending ? "Clocking out..." : "Clock Out"}
      </Button>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
    </form>
  );
}
