import type { BiasReport } from "./bias";

const KEY = "fairscan_reports";

export function getReports(): BiasReport[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveReport(report: BiasReport) {
  const all = getReports();
  all.unshift(report);
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50)));
}

export function getReport(id: string): BiasReport | undefined {
  return getReports().find((r) => r.id === id);
}