import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Inbox, RefreshCw, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { getReports } from "@/services/api"; // ✅ real backend

// ✅ Lightweight type for history rows (no need for full BiasReport)
interface ReportRow {
  id: string;
  filename: string;
  bias_score: number;
  bias_level: string;
  sensitive_column: string;
  target_column: string;
  created_at: string;
}

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History — FairScan AI" }],
  }),
  component: HistoryPage,
});

function scoreColor(s: number) {
  if (s < 0.1) return "var(--success)";
  if (s < 0.2) return "var(--warning)";
  return "var(--destructive)";
}

function levelBadgeStyle(level: string) {
  switch (level?.toLowerCase()) {
    case "low":      return "var(--success)";
    case "moderate": return "var(--warning)";
    case "high":     return "var(--destructive)";
    case "critical": return "#9b1c1c";
    default:         return "var(--muted-foreground)";
  }
}

function HistoryPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(); // ✅ GET /reports from backend
      setReports(data ?? []);
    } catch (err: any) {
      setError("Failed to load reports. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-10">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Past Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Click any row to view the full bias analysis.
            </p>
          </div>
          {/* ✅ Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Refresh</span>
          </Button>
        </div>

        {/* ✅ Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading reports from database…</p>
          </div>
        )}

        {/* ✅ Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-16 text-center">
            <p className="font-medium text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchReports}>
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && reports.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border bg-card px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium">No reports yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run your first analysis to see it here.
            </p>
            <Button asChild className="mt-6">
              <Link to="/">Upload a CSV</Link>
            </Button>
          </div>
        )}

        {/* ✅ Reports table */}
        {!loading && !error && reports.length > 0 && (
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-accent/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Filename</th>
                  <th className="px-6 py-3 text-left font-semibold">Sensitive Column</th>
                  <th className="px-6 py-3 text-left font-semibold">Bias Score</th>
                  <th className="px-6 py-3 text-left font-semibold">Level</th>
                  <th className="px-6 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() =>
                      navigate({ to: "/report/$id", params: { id: r.id } })
                    }
                    className="cursor-pointer border-t transition-colors hover:bg-accent/40"
                  >
                    {/* Filename */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="font-medium">{r.filename}</span>
                      </div>
                    </td>

                    {/* Sensitive column */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {r.sensitive_column}
                    </td>

                    {/* Bias score pill */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${scoreColor(r.bias_score)} 15%, transparent)`,
                          color: scoreColor(r.bias_score),
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: scoreColor(r.bias_score) }}
                        />
                        {r.bias_score.toFixed(3)}
                      </span>
                    </td>

                    {/* Bias level badge */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{
                          backgroundColor: `color-mix(in oklab, ${levelBadgeStyle(r.bias_level)} 15%, transparent)`,
                          color: levelBadgeStyle(r.bias_level),
                        }}
                      >
                        {r.bias_level}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ Row count footer */}
            <div className="border-t bg-accent/20 px-6 py-3">
              <p className="text-xs text-muted-foreground">
                {reports.length} report{reports.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}