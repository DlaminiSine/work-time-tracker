"use client";

import * as React from "react";
import { useActionState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { archiveProjectAction, restoreProjectAction } from "@/lib/projects/actions";
import { initialFormActionState } from "@/lib/forms/action-state";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";

export function ProjectArchiveButton({
  projectId,
  isArchived,
}: {
  projectId: string;
  isArchived: boolean;
}) {
  const action = isArchived ? restoreProjectAction : archiveProjectAction;
  const [state, formAction, isPending] = useActionState(action, initialFormActionState);

  function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    React.startTransition(() => {
      formAction(formData);
    });
  }

  return (
    <form onSubmit={submitForm} className="space-y-2">
      <input type="hidden" name="id" value={projectId} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isArchived ? <RotateCcw className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}
        {isPending ? "Saving..." : isArchived ? "Restore" : "Archive"}
      </Button>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
    </form>
  );
}
