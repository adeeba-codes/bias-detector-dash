import { Lightbulb, CheckCircle2 } from "lucide-react";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
}

export function RecommendationsList({ report }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-base font-semibold">Recommendations</h2>
      </div>
      <ol className="space-y-4">
        {report.fixes.map((f, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <div>
              <p className="text-sm leading-relaxed">{f}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-success" style={{ color: "var(--success)" }}>
                <CheckCircle2 className="h-3 w-3" /> Actionable
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
