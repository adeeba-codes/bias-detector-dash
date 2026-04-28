import { BiasGauge } from "@/components/BiasGauge";
import type { BiasReport } from "@/lib/bias";

interface Props {
  report: BiasReport;
  topGroup: string;
  bottomGroup: string;
}

export function OverallScoreCard({ report, topGroup, bottomGroup }: Props) {
  const fairness = ((1 - report.biasScore) * 100).toFixed(0);
  const riskColor =
    report.biasScore < 0.3
      ? "var(--success)"
      : report.biasScore < 0.6
        ? "var(--warning)"
        : "var(--destructive)";
  const verdict =
    report.biasScore < 0.3
      ? "well balanced"
      : report.biasScore < 0.6
        ? "moderately biased"
        : "significantly biased";

  return (
    <section className="overflow-hidden rounded-3xl border bg-card shadow-sm">
      <div
        className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:gap-10 md:p-10"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${riskColor} 7%, transparent), transparent 60%)`,
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
            Your dataset is <span style={{ color: riskColor }}>{verdict}</span>
          </h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
            A fairness score of <strong className="text-foreground">{fairness}/100</strong> across{" "}
            <strong className="text-foreground">{report.groups.length} groups</strong> in{" "}
            <strong className="text-foreground">{report.sensitiveColumn}</strong>. The largest
            disparity is between <strong className="text-foreground">{topGroup}</strong> and{" "}
            <strong className="text-foreground">{bottomGroup}</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
