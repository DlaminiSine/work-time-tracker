"use client";

import * as React from "react";
import { useActionState } from "react";
import { Archive, RotateCcw } from "lucide-react";
import { archiveCompanyAction, restoreCompanyAction } from "@/lib/companies/actions";
import { initialFormActionState } from "@/lib/forms/action-state";
import { Button } from "@/components/ui/button";
import { FieldMessage } from "@/components/ui/form-message";

export function CompanyArchiveButton({
  companyId,
  isArchived,
}: {
  companyId: string;
  isArchived: boolean;
}) {
  const action = isArchived ? restoreCompanyAction : archiveCompanyAction;
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
      <input type="hidden" name="id" value={companyId} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isArchived ? <RotateCcw className="size-4" aria-hidden="true" /> : <Archive className="size-4" aria-hidden="true" />}
        {isPending ? "Saving..." : isArchived ? "Restore" : "Archive"}
      </Button>
      <FieldMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FieldMessage>
    </form>
  );
}
