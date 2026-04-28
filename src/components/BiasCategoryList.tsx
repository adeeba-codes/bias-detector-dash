import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
  max: number;
  min: number;
}

export function BiasCategoryList({ report, max, min }: Props) {
  const color = (rate: number) => {
    if (rate === max) return "var(--success)";
    if (rate === min) return "var(--destructive)";
    return "var(--primary)";
  };
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">Group Breakdown</h2>
      <div className="space-y-4">
        {report.groups.map((g) => {
          const c = color(g.positiveRate);
          return (
            <div key={g.group}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium">{g.group}</span>
                <span className="tabular-nums" style={{ color: c }}>
                  {(g.positiveRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${g.positiveRate * 100}%`,
                    backgroundColor: c,
                    transition: "width 800ms ease",
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {g.count.toLocaleString()} rows
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
