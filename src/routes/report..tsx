import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Bot,
  Download,
  Lightbulb,
  ArrowLeft,
  Share2,
  FileDown,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { BiasGauge } from "@/components/BiasGauge";
import { Button } from "@/components/ui/button";
import { getReport } from "@/lib/bias-store";
import type { BiasReport } from "@/lib/bias";

export const Route = createFileRoute("/report/")({
  head: () => ({ meta: [{ title: "Bias Report — FairScan AI" }] }),
  component: ReportPage,
});

function ReportPage() {
  const { id } = useParams({ from: "/report/$id" });
  const [report, setReport] = useState<BiasReport | null | undefined>(undefined);

  useEffect(() => {
    setReport(getReport(id) ?? null);
  }, [id]);

  const stats = useMemo(() => {
    if (!report) return null;
    const rates = report.groups.map((g) => g.positiveRate);
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const totalRows = report.groups.reduce((s, g) => s + g.count, 0);
    const sorted = [...report.groups].sort((a, b) => b.positiveRate - a.positiveRate);
    return {
      max,
      min,
      totalRows,
      groupCount: report.groups.length,
      disparity: max - min,
      topGroup: sorted[0],
      bottomGroup: sorted[sorted.length - 1],
      ratio: min > 0 ? min / max : 0,
    };
  }, [report]);

  if (report === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-12 text-muted-foreground">Loading…</main>
      </div>
    );
  }

  if (!report || !stats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-6 py-12">
          <p className="text-muted-foreground">Report not found.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            ← Upload a new file
          </Link>
        </main>
      </div>
    );
  }

  const downloadClean = () => {
    const blob = new Blob([report.cleanCsv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clean_${report.filename}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `FairScan: ${report.filename}`, url });
      } catch {
        /* user cancel */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const exportPdf = () => window.print();

  const barColor = (rate: number) => {
    if (rate === stats.max) return "var(--success)";
    if (rate === stats.min) return "var(--destructive)";
    return "var(--primary)";
  };

  const fairness = ((1 - report.biasScore) * 100).toFixed(0);
  const riskColor =
    report.biasScore < 0.3
      ? "var(--success)"
      : report.biasScore < 0.6
        ? "var(--warning)"
        : "var(--destructive)";

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        actions={
          <>
            <Button size="sm" variant="outline" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button size="sm" variant="outline" onClick={exportPdf}>
              <FileDown className="mr-1.5 h-4 w-4" /> PDF
            </Button>
          </>
        }
      />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Title row */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Link
              to="/"
              className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> New analysis
            </Link>
            <h1 className="truncate text-3xl font-bold tracking-tight sm:text-4xl">
              Fairness Report
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{report.filename}</span> · Target{" "}
              <span className="font-medium text-foreground">{report.targetColumn}</span> ·
              Sensitive{" "}
              <span className="font-medium text-foreground">{report.sensitiveColumn}</span> ·{" "}
              {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={downloadClean}
            size="lg"
            style={{ backgroundColor: "var(--success)", color: "white" }}
            className="hover:opacity-90"
          >
            <Download className="mr-2 h-4 w-4" /> Download Clean Dataset
          </Button>
        </div>

        {/* HERO: Overall score */}
        <section className="mb-6 overflow-hidden rounded-3xl border bg-card shadow-sm">
          <div
            className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:gap-10 md:p-10"
            style={{
              background: `linear-gradient(135deg, color-mix(in oklab, ${riskColor} 6%, transparent), transparent 60%)`,
            }}
          >
            <div className="flex justify-center">
              <BiasGauge score={report.biasScore} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Overall Fairness Score
              </span>
              <h2 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                Your dataset is{" "}
                <span style={{ color: riskColor }}>
                  {report.biasScore < 0.3
                    ? "well balanced"
                    : report.biasScore < 0.6
                      ? "moderately biased"
                      : "significantly biased"}
                </span>
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
                A fairness score of <strong className="text-foreground">{fairness}/100</strong>{" "}
                across <strong className="text-foreground">{stats.groupCount} groups</strong> in{" "}
                <strong className="text-foreground">{report.sensitiveColumn}</strong>. The largest
                gap is between{" "}
                <strong className="text-foreground">{stats.topGroup.group}</strong> and{" "}
                <strong className="text-foreground">{stats.bottomGroup.group}</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Stat tiles */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="Total Rows"
            value={stats.totalRows.toLocaleString()}
            sub={`${stats.groupCount} groups analyzed`}
          />
          <StatTile
            icon={<TrendingUp className="h-5 w-5" />}
            label="Highest Rate"
            value={`${(stats.max * 100).toFixed(1)}%`}
            sub={stats.topGroup.group}
            tone="success"
          />
          <StatTile
            icon={<AlertTriangle className="h-5 w-5" />}
            label="Lowest Rate"
            value={`${(stats.min * 100).toFixed(1)}%`}
            sub={stats.bottomGroup.group}
            tone="destructive"
          />
          <StatTile
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Disparity Ratio"
            value={`${(stats.ratio * 100).toFixed(0)}%`}
            sub={stats.ratio >= 0.8 ? "Passes 80% rule" : "Fails 80% rule"}
            tone={stats.ratio >= 0.8 ? "success" : "destructive"}
          />
        </section>

        {/* Main grid: chart + sidebar */}
        <section className="mb-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-base font-semibold">Positive Rate by Group</h2>
              <span className="text-xs text-muted-foreground">{report.targetColumn}</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Green = highest, red = lowest, blue = mid-range.
            </p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={report.groups.map((g) => ({ ...g, rate: g.positiveRate }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="group" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    domain={[0, 1]}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--accent)", opacity: 0.4 }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, "Positive rate"]}
                  />
                  <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                    {report.groups.map((g, i) => (
                      <Cell key={i} fill={barColor(g.positiveRate)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Suggested Fixes</h2>
            </div>
            <ol className="space-y-4">
              {report.fixes.map((f, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Deep dive: AI explanation + group breakdown */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold">AI Explanation</h2>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" /> Generated by Gemini
                </p>
              </div>
            </div>
            <p className="leading-relaxed text-foreground/90">{report.explanation}</p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">Group Breakdown</h2>
            <div className="space-y-4">
              {report.groups.map((g) => {
                const c = barColor(g.positiveRate);
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
        </section>
      </main>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "success" | "destructive";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "destructive"
        ? "var(--destructive)"
        : "var(--primary)";
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{
            backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
            color,
          }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 truncate text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
