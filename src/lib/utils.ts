import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ============================================================
 * Bias / fairness helpers
 * ============================================================ */

export type RiskLevel = "low" | "medium" | "high";

export const BIAS_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
} as const;

export function getRiskLevel(biasScore: number): RiskLevel {
  if (biasScore < BIAS_THRESHOLDS.low) return "low";
  if (biasScore < BIAS_THRESHOLDS.medium) return "medium";
  return "high";
}

export function getRiskLabel(biasScore: number): string {
  const level = getRiskLevel(biasScore);
  return level === "low" ? "Low Risk" : level === "medium" ? "Medium Risk" : "High Risk";
}

export function getRiskVerdict(biasScore: number): string {
  const level = getRiskLevel(biasScore);
  return level === "low"
    ? "well balanced"
    : level === "medium"
      ? "moderately biased"
      : "significantly biased";
}

/** Returns a CSS variable reference matching the bias level. */
export function getScoreColor(biasScore: number): string {
  const level = getRiskLevel(biasScore);
  return level === "low"
    ? "var(--bias-low)"
    : level === "medium"
      ? "var(--bias-medium)"
      : "var(--bias-high)";
}

/** Inverse of bias: 0 (worst) → 100 (perfectly fair). */
export function getFairnessScore(biasScore: number): number {
  return Math.round((1 - clamp01(biasScore)) * 100);
}

export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Four-fifths rule: selection ratio ≥ 80% passes. */
export function passesFourFifthsRule(min: number, max: number): boolean {
  if (max <= 0) return false;
  return min / max >= 0.8;
}

/* ============================================================
 * Formatters
 * ============================================================ */

export function formatPercent(v: number, digits = 1): string {
  return `${(v * 100).toFixed(digits)}%`;
}

export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input) : input;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}
