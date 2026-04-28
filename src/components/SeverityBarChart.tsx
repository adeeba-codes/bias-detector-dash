import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
}

export function SeverityBarChart({ report }: Props) {
  const rates = report.groups.map((g) => g.positiveRate);
  const mean = rates.reduce((a, b) => a + b, 0) / Math.max(1, rates.length);
  const data = report.groups
    .map((g) => ({
      group: g.group,
      severity: Math.round(Math.abs(g.positiveRate - mean) * 200),
    }))
    .sort((a, b) => b.severity - a.severity);

  const sev = (v: number) =>
    v > 40 ? "var(--destructive)" : v > 20 ? "var(--warning)" : "var(--success)";

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-base font-semibold">Bias Severity by Group</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Distance from the mean positive rate (0–100).
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="var(--muted-foreground)"
              fontSize={11}
            />
            <YAxis
              type="category"
              dataKey="group"
              stroke="var(--muted-foreground)"
              fontSize={12}
              width={90}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar dataKey="severity" radius={[0, 6, 6, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={sev(d.severity)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
