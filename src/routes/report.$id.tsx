import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Sparkles,
} from "lucide-react";
import { ReportHeader } from "@/components/ReportHeader";
import { OverallScoreCard } from "@/components/OverallScoreCard";
import { BiasCategoryList } from "@/components/BiasCategoryList";
import { BiasRadarChart } from "@/components/BiasRadarChart";
import { SeverityBarChart } from "@/components/SeverityBarChart";
import { RedFlagsList } from "@/components/RedFlagsList";
import { RecommendationsList } from "@/components/RecommendationsList";
import { ReportTabs } from "@/components/ReportTabs";
import { getReport as fetchReportFromAPI, downloadCleanCSV } from "@/services/api"; // ✅ real API
import type { BiasReport } from "@/lib/bias";

export const Route = createFileRoute("/report/$id")({
  head: () => ({ meta: [{ title: "Bias Report — FairScan AI" }] }),
  component: ReportPage,
});

// ✅ Maps backend response → BiasReport shape all components already expect
function mapApiResultToReport(result: any, file?: File): BiasReport {
  // Convert affected_groups object → groups array
  // e.g. { "male": 0.75, "female": 0.45 } → [{ group: "male", positiveRate: 0.75, count: 0 }]
  const totalRows = result.total_rows ?? 0;
  const groupEntries = Object.entries(result.affected_groups ?? {}) as [string, number][];
  const groupCount = groupEntries.length;

  const groups = groupEntries.map(([group, positiveRate]) => ({
    group,
    positiveRate: Number(positiveRate),
    count: groupCount > 0 ? Math.round(totalRows / groupCount) : 0,
  }));

  return {
    id: result.report_id ?? "new",
    filename: result.filename ?? file?.name ?? "dataset.csv",
    targetColumn: result.target_column ?? "",
    sensitiveColumn: result.sensitive_column ?? "",
    biasScore: result.bias_score ?? 0,
    biasLevel: result.bias_level ?? "Unknown",
    groups,
    explanation: result.explanation ?? "No explanation available.",
    impact: result.impact ?? "",
    recommendations: result.suggestions ?? [],
    cleanCsv: "",        // filled after download
    createdAt: new Date().toISOString(),
  };
}

function ReportPage() {
  const { id } = useParams({ from: "/report/$id" });
  const [report, setReport] = useState<BiasReport | null | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // ✅ First try: read result passed from Upload page via navigation state
    const navState = (window.history.state?.usr ?? window.history.state) as any;

    if (navState?.result) {
      const mapped = mapApiResultToReport(navState.result, navState.file);
      setReport(mapped);
      if (navState.file) setFile(navState.file);
      return;
    }

    // ✅ Fallback: fetch report by ID from backend (e.g. direct URL visit / History link)
    if (id && id !== "new") {
      fetchReportFromAPI(id)
        .then((data) => setReport(mapApiResultToReport(data)))
        .catch(() => setReport(null));
    } else {
      setReport(null);
    }
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
      topGroup: sorted[0],
      bottomGroup: sorted[sorted.length - 1],
      ratio: max > 0 ? min / max : 0,
    };
  }, [report]);

  if (report === undefined) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12 text-muted-foreground">
        Loading report…
      </main>
    );
  }

  if (!report || !stats) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-muted-foreground">Report not found.</p>
        <Link to="/" className="mt-4 inline-block text-primary hover:underline">
          ← Upload a new file
        </Link>
      </main>
    );
  }

  // ✅ Download debiased CSV from real backend
  const handleDownloadClean = async () => {
    if (!file) {
      alert("Original file not available. Please re-upload to download clean CSV.");
      return;
    }
    try {
      setDownloading(true);
      await downloadCleanCSV(file, report.sensitiveColumn);
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ReportHeader
        report={report}
        onDownloadClean={handleDownloadClean}
        downloading={downloading}
      />

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <OverallScoreCard
          report={report}
          topGroup={stats.topGroup.group}
          bottomGroup={stats.bottomGroup.group}
        />

        {/* Stat tiles */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon={<Users className="h-5 w-5" />}
            label="Total Rows"
            value={stats.totalRows.toLocaleString()}
            sub={`${stats.groupCount} groups`}
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

        {/* Charts row */}
        <section className="grid gap-6 lg:grid-cols-2">
          <SeverityBarChart report={report} />
          <BiasRadarChart report={report} />
        </section>

        {/* Findings + recommendations */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RedFlagsList
              report={report}
              max={stats.max}
              min={stats.min}
              ratio={stats.ratio}
              topGroup={stats.topGroup.group}
              bottomGroup={stats.bottomGroup.group}
            />
          </div>
          <RecommendationsList report={report} />
        </section>

        {/* ✅ AI Explanation — now shows real Gemini response */}
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

            {/* Explanation text */}
            <p className="leading-relaxed text-foreground/90">{report.explanation}</p>

            {/* ✅ Impact — new field from backend */}
            {report.impact && (
              <div className="mt-4 rounded-lg bg-destructive/10 px-4 py-3">
                <p className="text-sm font-semibold text-destructive mb-1">Real-world Impact</p>
                <p className="text-sm text-foreground/80">{report.impact}</p>
              </div>
            )}

            {/* ✅ Suggestions — shown inline as well */}
            {report.recommendations?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Suggested Fixes</p>
                <ul className="space-y-1">
                  {report.recommendations.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <BiasCategoryList report={report} max={stats.max} min={stats.min} />
        </section>

        {/* Deep-dive tabs */}
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Deep Dive</h2>
          <ReportTabs
            report={report}
            max={stats.max}
            min={stats.min}
            topGroup={stats.topGroup.group}
            bottomGroup={stats.bottomGroup.group}
          />
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
