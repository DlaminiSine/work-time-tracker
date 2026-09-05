import { describe, expect, it } from "vitest";
import {
  getInitialTimerSelection,
  getNextProjectSelection,
  getProjectsForCompany,
} from "@/lib/timer/selectors";
import type { CompanyProjectOption } from "@/lib/timer/options";

const options: CompanyProjectOption[] = [
  {
    id: "company-a",
    name: "Company A",
    color: "#0f766e",
    is_archived: false,
    projects: [],
  },
  {
    id: "company-b",
    name: "Company B",
    color: "#2563eb",
    is_archived: false,
    projects: [
      { id: "project-b1", name: "Project B1", company_id: "company-b", color: "#2563eb" },
      { id: "project-b2", name: "Project B2", company_id: "company-b", color: "#7c3aed" },
    ],
  },
];

describe("timer selector helpers", () => {
  it("starts with the first company that has an active project", () => {
    expect(getInitialTimerSelection(options)).toEqual({
      companyId: "company-b",
      projectId: "project-b1",
    });
  });

  it("returns projects for a selected company", () => {
    expect(getProjectsForCompany(options, "company-a")).toEqual([]);
    expect(getProjectsForCompany(options, "company-b")).toHaveLength(2);
  });

  it("resets the project when the selected company changes", () => {
    expect(getNextProjectSelection(options, "company-b", "project-b2")).toBe("project-b2");
    expect(getNextProjectSelection(options, "company-a", "project-b2")).toBe("");
  });
});
