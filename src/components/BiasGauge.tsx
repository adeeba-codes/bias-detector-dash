interface Props {
  score: number;
  size?: number;
}

export function BiasGauge({ score, size = 280 }: Props) {
  const pct = Math.max(0, Math.min(1, score));
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - pct);

  const color =
    pct < 0.3 ? "var(--success)" : pct < 0.6 ? "var(--warning)" : "var(--destructive)";
  const risk = pct < 0.3 ? "Low Risk" : pct < 0.6 ? "Medium Risk" : "High Risk";
  const fairness = (1 - pct) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.7" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1000ms ease, stroke 400ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Fairness
          </span>
          <span
            className="text-7xl font-bold tracking-tight tabular-nums"
            style={{ color }}
          >
            {fairness.toFixed(0)}
          </span>
          <span className="-mt-1 text-sm text-muted-foreground">
            Bias score {pct.toFixed(2)}
          </span>
        </div>
      </div>
      <span
        className="mt-5 rounded-full px-5 py-1.5 text-sm font-bold uppercase tracking-wide"
        style={{
          backgroundColor: `color-mix(in oklab, ${color} 15%, transparent)`,
          color,
        }}
      >
        ● {risk}
      </span>
      <div className="mt-4 w-full max-w-[240px]">
        <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Confidence</span>
          <span className="font-semibold text-foreground">92%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full"
            style={{ width: "92%", backgroundColor: "var(--primary)" }}
          />
        </div>
      </div>
    </div>
  );
}
