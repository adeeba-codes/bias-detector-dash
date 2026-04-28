import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
  max: number;
  min: number;
  topGroup: string;
  bottomGroup: string;
}

export function ReportTabs({ report, max, min, topGroup, bottomGroup }: Props) {
  const gap = max - min;
  const metrics = [
    { name: "Bias Score", value: report.biasScore.toFixed(3), desc: "Max-min positive rate gap (0-1)" },
    { name: "Fairness Score", value: `${((1 - report.biasScore) * 100).toFixed(1)}/100`, desc: "Inverse of bias score" },
    { name: "Disparity Gap", value: `${(gap * 100).toFixed(2)} pp`, desc: "Difference in positive rates" },
    { name: "Disparity Ratio", value: `${(min > 0 ? (min / max) * 100 : 0).toFixed(1)}%`, desc: "80%+ passes the four-fifths rule" },
    { name: "Groups Analyzed", value: String(report.groups.length), desc: `Distinct values in ${report.sensitiveColumn}` },
    { name: "Total Samples", value: report.groups.reduce((s, g) => s + g.count, 0).toLocaleString(), desc: "Rows analyzed" },
  ];

  const examples = [
    {
      title: `${bottomGroup} is under-favored`,
      body: `Members of ${bottomGroup} receive a positive ${report.targetColumn} only ${(min * 100).toFixed(1)}% of the time, vs. ${(max * 100).toFixed(1)}% for ${topGroup}.`,
    },
    {
      title: "Sample imbalance",
      body: `Group sizes range from ${Math.min(...report.groups.map((g) => g.count))} to ${Math.max(...report.groups.map((g) => g.count))} rows, which can skew model learning.`,
    },
    {
      title: "Proxy leakage risk",
      body: `Other features may correlate with ${report.sensitiveColumn} and re-introduce bias even after dropping it.`,
    },
  ];

  return (
    <Tabs defaultValue="metrics" className="w-full">
      <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
        <TabsTrigger value="metrics">All Metrics</TabsTrigger>
        <TabsTrigger value="examples">Problematic Examples</TabsTrigger>
        <TabsTrigger value="raw">Raw Data</TabsTrigger>
      </TabsList>

      <TabsContent value="metrics" className="mt-4">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Metric</th>
                <th className="px-6 py-3 text-left font-semibold">Value</th>
                <th className="px-6 py-3 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.name} className="border-t">
                  <td className="px-6 py-3 font-medium">{m.name}</td>
                  <td className="px-6 py-3 tabular-nums">{m.value}</td>
                  <td className="px-6 py-3 text-muted-foreground">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>

      <TabsContent value="examples" className="mt-4">
        <div className="grid gap-4 md:grid-cols-3">
          {examples.map((e, i) => (
            <div key={i} className="rounded-2xl border bg-card p-5 shadow-sm">
              <p className="text-sm font-semibold">{e.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{e.body}</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="raw" className="mt-4">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Group</th>
                <th className="px-6 py-3 text-right font-semibold">Count</th>
                <th className="px-6 py-3 text-right font-semibold">Positive Rate</th>
              </tr>
            </thead>
            <tbody>
              {report.groups.map((g) => (
                <tr key={g.group} className="border-t">
                  <td className="px-6 py-3 font-medium">{g.group}</td>
                  <td className="px-6 py-3 text-right tabular-nums">{g.count.toLocaleString()}</td>
                  <td className="px-6 py-3 text-right tabular-nums">
                    {(g.positiveRate * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
