import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
}

export function BiasRadarChart({ report }: Props) {
  const data = report.groups.map((g) => ({
    group: g.group,
    fairness: Math.round((1 - Math.abs(g.positiveRate - 0.5) * 2) * 100),
    rate: Math.round(g.positiveRate * 100),
  }));

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-1 text-base font-semibold">Multi-Dimensional View</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Fairness vs. positive rate per group.
      </p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="group"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Radar
              name="Positive Rate"
              dataKey="rate"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.35}
            />
            <Radar
              name="Fairness"
              dataKey="fairness"
              stroke="var(--success)"
              fill="var(--success)"
              fillOpacity={0.2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
