export interface GroupStat {
  group: string;
  count: number;
  positiveRate: number;
}

export interface BiasReport {
  id: string;
  filename: string;
  date: string;
  targetColumn: string;
  sensitiveColumn: string;
  biasScore: number;
  groups: GroupStat[];
  explanation: string;
  fixes: string[];
  cleanCsv: string;
}

/** Severity tier for findings, recommendations, and red flags. */
export type Severity = "low" | "medium" | "high";

/** A single bias category (e.g. Gender, Age) with its own score breakdown. */
export interface BiasCategory {
  name: string;
  score: number; // 0..1 bias score
  severity: Severity;
  groupCount: number;
  topGroup: string;
  bottomGroup: string;
}

/** Actionable remediation suggestion. */
export interface Recommendation {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
  effort?: "low" | "medium" | "high";
}

/** Red flag / key finding surfaced in the report. */
export interface RedFlag {
  id: string;
  level: Severity;
  title: string;
  detail: string;
}

/** Aggregated, presentation-ready report shape used by UI components. */
export interface ReportData {
  report: BiasReport;
  fairnessScore: number; // 0..100
  severity: Severity;
  totalRows: number;
  disparityGap: number; // max - min positive rate
  disparityRatio: number; // min / max
  categories: BiasCategory[];
  redFlags: RedFlag[];
  recommendations: Recommendation[];
}

type Row = Record<string, string>;

function isPositive(v: string): boolean {
  const s = (v ?? "").toString().trim().toLowerCase();
  return ["1", "true", "yes", "y", "positive", "approved", "hired", "good"].includes(s);
}

export function analyzeBias(
  rows: Row[],
  targetColumn: string,
  sensitiveColumn: string,
  filename: string,
): BiasReport {
  const groupsMap = new Map<string, { count: number; positives: number }>();

  for (const row of rows) {
    const g = (row[sensitiveColumn] ?? "Unknown").toString().trim() || "Unknown";
    const t = row[targetColumn];
    const entry = groupsMap.get(g) ?? { count: 0, positives: 0 };
    entry.count += 1;
    if (isPositive(t)) entry.positives += 1;
    groupsMap.set(g, entry);
  }

  const groups: GroupStat[] = Array.from(groupsMap.entries())
    .map(([group, v]) => ({
      group,
      count: v.count,
      positiveRate: v.count ? v.positives / v.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const rates = groups.map((g) => g.positiveRate);
  const max = Math.max(...rates, 0);
  const min = Math.min(...rates, 0);
  const biasScore = Math.min(1, Math.max(0, max - min));

  const sortedByRate = [...groups].sort((a, b) => b.positiveRate - a.positiveRate);
  const top = sortedByRate[0];
  const bottom = sortedByRate[sortedByRate.length - 1];

  const explanation =
    groups.length < 2
      ? `Only one group was detected in "${sensitiveColumn}", so no comparative bias could be measured. Try a column with multiple distinct values.`
      : `Across ${groups.length} groups in "${sensitiveColumn}", the positive outcome rate for "${targetColumn}" ranges from ${(bottom.positiveRate * 100).toFixed(1)}% (${bottom.group}) to ${(top.positiveRate * 100).toFixed(1)}% (${top.group}). This ${biasScore > 0.6 ? "substantial" : biasScore > 0.3 ? "moderate" : "small"} disparity (${biasScore.toFixed(2)}) suggests the model or dataset may ${biasScore > 0.3 ? "systematically favor" : "slightly favor"} ${top.group} over ${bottom.group}.`;

  const fixes = [
    `Rebalance training samples so each group in "${sensitiveColumn}" is proportionally represented.`,
    `Apply reweighing or threshold adjustment to equalize positive rates across ${top.group} and ${bottom.group}.`,
    `Audit feature correlations with "${sensitiveColumn}" — drop or transform proxies that leak sensitive information.`,
  ];

  // "Clean" dataset: balance group counts to the smallest group size.
  const minCount = Math.min(...groups.map((g) => g.count));
  const headers = Object.keys(rows[0] ?? {});
  const balanced: Row[] = [];
  for (const g of groups) {
    const subset = rows.filter(
      (r) => ((r[sensitiveColumn] ?? "Unknown").toString().trim() || "Unknown") === g.group,
    );
    balanced.push(...subset.slice(0, minCount));
  }
  const cleanCsv = [
    headers.join(","),
    ...balanced.map((r) =>
      headers
        .map((h) => {
          const v = (r[h] ?? "").toString().replace(/"/g, '""');
          return /[",\n]/.test(v) ? `"${v}"` : v;
        })
        .join(","),
    ),
  ].join("\n");

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    filename,
    date: new Date().toISOString(),
    targetColumn,
    sensitiveColumn,
    biasScore,
    groups,
    explanation,
    fixes,
    cleanCsv,
  };
}