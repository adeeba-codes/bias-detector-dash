import { Link } from "@tanstack/react-router";
import { ArrowLeft, Download, FileDown, Share2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
  onDownloadClean: () => void;
}

export function ReportHeader({ report, onDownloadClean }: Props) {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: `FairScan: ${report.filename}`, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">FairScan AI</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link to="/history">History</Link>
            </Button>
            <Button size="sm" variant="outline" onClick={share}>
              <Share2 className="mr-1.5 h-4 w-4" /> Share
            </Button>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <FileDown className="mr-1.5 h-4 w-4" /> PDF
            </Button>
            <Button
              size="sm"
              onClick={onDownloadClean}
              style={{ backgroundColor: "var(--success)", color: "white" }}
              className="hover:opacity-90"
            >
              <Download className="mr-1.5 h-4 w-4" /> Clean CSV
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
          <div className="min-w-0">
            <Link
              to="/"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> New analysis
            </Link>
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              Fairness Report
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{report.filename}</span> · Target{" "}
              <span className="font-medium text-foreground">{report.targetColumn}</span> ·
              Sensitive{" "}
              <span className="font-medium text-foreground">{report.sensitiveColumn}</span> ·{" "}
              {new Date(report.date).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
