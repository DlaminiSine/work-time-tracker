import type { CompanyProjectOption, ProjectOption } from "@/lib/timer/options";

export type TimerSelection = {
  companyId: string;
  projectId: string;
};

export function getProjectsForCompany(options: CompanyProjectOption[], companyId: string): ProjectOption[] {
  return options.find((company) => company.id === companyId)?.projects ?? [];
}

export function getInitialTimerSelection(options: CompanyProjectOption[]): TimerSelection {
  const firstCompanyWithProject = options.find((company) => company.projects.length > 0);
  const company = firstCompanyWithProject ?? options[0];

  return {
    companyId: company?.id ?? "",
    projectId: company?.projects[0]?.id ?? "",
  };
}

export function getNextProjectSelection(
  options: CompanyProjectOption[],
  companyId: string,
  currentProjectId: string,
) {
  const projects = getProjectsForCompany(options, companyId);
  const currentProjectStillValid = projects.some((project) => project.id === currentProjectId);

  return currentProjectStillValid ? currentProjectId : projects[0]?.id ?? "";
}
