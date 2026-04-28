import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
  max: number;
  min: number;
  ratio: number;
  topGroup: string;
  bottomGroup: string;
}

type Flag = { level: "high" | "medium" | "low"; title: string; detail: string };

export function RedFlagsList({ report, max, min, ratio, topGroup, bottomGroup }: Props) {
  const flags: Flag[] = [];
  if (report.biasScore > 0.6) {
    flags.push({
      level: "high",
      title: "Significant disparity detected",
      detail: `${(min * 100).toFixed(1)}% vs ${(max * 100).toFixed(1)}% positive rate between ${bottomGroup} and ${topGroup}.`,
    });
  } else if (report.biasScore > 0.3) {
    flags.push({
      level: "medium",
      title: "Moderate disparity",
      detail: `Gap of ${((max - min) * 100).toFixed(1)} pp between ${topGroup} and ${bottomGroup}.`,
    });
  }
  if (ratio < 0.8 && ratio > 0) {
    flags.push({
      level: "high",
      title: "Fails the 80% rule",
      detail: `Selection ratio is ${(ratio * 100).toFixed(0)}% — below the legal 80% threshold for adverse impact.`,
    });
  }
  const minGroup = report.groups.reduce((a, b) => (a.count < b.count ? a : b));
  const maxGroup = report.groups.reduce((a, b) => (a.count > b.count ? a : b));
  if (minGroup.count > 0 && maxGroup.count / minGroup.count > 4) {
    flags.push({
      level: "medium",
      title: "Imbalanced sample sizes",
      detail: `${maxGroup.group} is ${(maxGroup.count / minGroup.count).toFixed(1)}× larger than ${minGroup.group}.`,
    });
  }
  if (report.groups.length < 3) {
    flags.push({
      level: "low",
      title: "Few comparison groups",
      detail: `Only ${report.groups.length} groups in ${report.sensitiveColumn} — results may be coarse.`,
    });
  }
  if (flags.length === 0) {
    flags.push({
      level: "low",
      title: "No major red flags",
      detail: "The dataset passes baseline fairness checks.",
    });
  }

  const styleFor = (l: Flag["level"]) =>
    l === "high"
      ? { color: "var(--destructive)", Icon: AlertTriangle, label: "High" }
      : l === "medium"
        ? { color: "var(--warning)", Icon: AlertCircle, label: "Medium" }
        : { color: "var(--success)", Icon: Info, label: "Low" };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h2 className="text-base font-semibold">Red Flags</h2>
      </div>
      <ul className="space-y-3">
        {flags.map((f, i) => {
          const { color, Icon, label } = styleFor(f.level);
          return (
            <li
              key={i}
              className="flex gap-3 rounded-lg border p-3"
              style={{
                borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
                backgroundColor: `color-mix(in oklab, ${color} 6%, transparent)`,
              }}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{f.title}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      color,
                      backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
