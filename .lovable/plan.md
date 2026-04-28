
# Plan — Presentation-Ready UI Polish for FairScan AI

Goal: make every screen judges see look like a finished SaaS product. We keep your existing logic (CSV parsing, bias scoring, report) and only upgrade visual design, hierarchy, and "wow" moments.

## Design language

- **Palette**: white background, primary `#4285F4`, soft slate text, subtle gradients (`from-primary/5 via-transparent`), success green / amber / red for risk states (already defined).
- **Typography**: keep system sans, but use stronger scale — display 48–60px on hero, semibold tracking-tight on section titles.
- **Surfaces**: rounded-3xl cards, 1px borders, soft shadows, micro gradients on hero/score cards only (avoid over-decorating).
- **Motion**: fade-in + translate-y on mount, animated number counters on score, shimmer on the analyze loader. All CSS-only.
- **Iconography**: lucide-react, in colored "chip" backgrounds (h-9 w-9 rounded-lg).

## 1. Upload page (`src/routes/index.tsx`) — add a real landing

Replace the centered-form-only layout with a 2-section landing:

**A. Hero band**
- Left: eyebrow "AI-Powered Fairness Audits", H1 "Detect bias in your dataset in seconds.", subcopy, two CTAs ("Try with sample CSV", "View demo report").
- Right: a stylized preview card (mini gauge + 3 group bars) — pure SVG/CSS, no data needed, just signals what the product does.
- Soft radial gradient background, faint grid pattern.

**B. Upload card** (current dropzone, refined)
- Sits in a max-w-3xl card, "Step 1 / Step 2 / Step 3" indicator above it (Upload → Configure → Analyze).
- Dropzone: larger, animated dashed border, file-type chip ".CSV up to 50MB".
- After upload: file chip + a 5-row table preview (first 5 rows × first 5 columns) so judges see the data is real.
- Target/Sensitive selects in a 2-col grid with helper text under each.
- Big primary "Analyze Bias" button full width, with right-arrow icon.

**C. Trust strip below**
- 3 small feature tiles: "Privacy-first (runs locally)", "Powered by Gemini", "Exportable reports". Pure visual credibility.

## 2. Loading state — make it memorable

Currently a spinner inside the button. Upgrade to a **full-card overlay** while analyzing:
- Animated concentric rings around a Sparkles icon.
- Rotating status lines: "Parsing CSV…" → "Computing group rates…" → "Asking Gemini for explanation…" → "Generating recommendations…" (cycle every 600ms).
- Progress bar that fills proportionally.
- Keeps users engaged for the simulated 1.5s and reads as "real AI work" on stage.

## 3. Navbar (`src/components/Navbar.tsx`) — minor polish

- Add a subtle "Beta" pill next to the wordmark.
- Add a "New Analysis" primary button on the right (only on non-upload pages).
- Underline indicator under the active nav link instead of background fill (more modern).

## 4. History page (`src/routes/history.tsx`) — turn into a dashboard

Currently just a table. Upgrade to:
- **Header row**: Title + "New Analysis" CTA.
- **Stat strip (4 tiles)**: Total Reports, Avg Bias Score, % Passing 80% Rule, Last Run.
- **Filter bar**: search input + risk filter chips (All / Low / Medium / High).
- **Cards-or-table toggle**: keep table as default, but each row gains a risk pill (Low/Med/High), sensitive column tag, and a chevron — feels like Linear/Vercel.
- Empty state already good; add an illustration-style icon cluster.

## 5. Report page — small finishing touches only

The report page is already rich. Just:
- Add a **print-friendly stylesheet** so the "PDF" button output looks clean (hide nav/buttons via `@media print` in `styles.css`).
- Animate the gauge number counting from 0 → final value on mount (300ms ease-out).
- Add a small "Share via link" toast confirmation.

## 6. Global polish (`src/styles.css`)

- Add a `.bg-grid` utility (faint 1px dotted grid) for the hero.
- Add `@keyframes shimmer` and `.animate-shimmer` for the loader bar.
- Add `@media print` rules: hide `.no-print`, force white background, remove shadows.
- Add `.fade-in-up` utility for section reveals.

## File changes

| File | Change |
|------|--------|
| `src/routes/index.tsx` | Rewrite layout: hero + step indicator + refined upload card + trust strip + new loading overlay |
| `src/routes/history.tsx` | Add stat strip, search/filter, risk pills, "New Analysis" CTA |
| `src/components/Navbar.tsx` | Beta pill, underline active state, conditional CTA button |
| `src/components/HeroPreview.tsx` (new) | Decorative SVG/CSS preview card for hero |
| `src/components/AnalyzingOverlay.tsx` (new) | Full-card animated loader with rotating steps |
| `src/components/CsvPreviewTable.tsx` (new) | First-5-rows table preview after upload |
| `src/components/StatTile.tsx` (new, shared) | Extract the existing inline `StatTile` so history + report share it |
| `src/components/BiasGauge.tsx` | Add count-up animation for the fairness number |
| `src/styles.css` | `.bg-grid`, shimmer keyframes, fade-in-up, `@media print` rules |

## What this gives you on stage

- A landing screen that explains the product in 3 seconds.
- A demo flow with a satisfying loader that "feels intelligent".
- A dashboard (history) that proves the product works repeatedly.
- A report page that already looks like a real analytics tool, now with print-quality PDF export.

No new dependencies. No backend changes. Approve and I'll implement in one pass.
