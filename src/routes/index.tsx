import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import Papa from "papaparse";
import { UploadCloud, FileText, X, Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { analyzeCSV } from "@/services/api"; // ✅ real backend

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FairScan AI — Detect Bias in Your Datasets" },
      {
        name: "description",
        content:
          "Upload a CSV and get an instant fairness report: bias score, group breakdown, and AI-powered remediation suggestions.",
      },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [target, setTarget] = useState<string>("");
  const [sensitive, setSensitive] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    if (!f.name.toLowerCase().endsWith(".csv")) {
      setError("Please upload a .csv file.");
      return;
    }
    setFile(f);
    Papa.parse<Record<string, string>>(f, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const fields = res.meta.fields ?? [];
        setHeaders(fields);
        setRows(res.data);
        setTarget("");
        setSensitive("");
      },
      error: (e) => setError(e.message),
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setFile(null);
    setHeaders([]);
    setRows([]);
    setTarget("");
    setSensitive("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ✅ REPLACED: mock analyze → real backend call
  const analyze = async () => {
    if (!file || !target || !sensitive) return;

    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeCSV(file, target, sensitive);
      // ✅ Navigate to report page, passing full API result + file
      navigate({
        to: "/report/$id",
        params: { id: result.report_id ?? "new" },
        state: { result, file },
      });
    } catch (err: any) {
      // ✅ Show user-friendly error
      const msg =
        err?.response?.data?.detail ||
        "Analysis failed. Please check your backend is running.";
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Detect bias in your dataset
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload a CSV, choose your target and sensitive columns, and get a
            fairness report in seconds.
          </p>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card px-8 py-16 transition-colors ${
              dragOver
                ? "border-primary bg-accent"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-primary transition-transform group-hover:scale-110">
              <UploadCloud className="h-7 w-7" />
            </div>
            <p className="mt-4 text-base font-medium">Drop your CSV here</p>
            <p className="mt-1 text-sm text-muted-foreground">
              or click to browse files
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            {/* File info */}
            <div className="flex items-center justify-between rounded-lg bg-accent px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {rows.length} rows · {headers.length} columns
                  </p>
                </div>
              </div>
              <button
                onClick={reset}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Column selectors */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Target Column</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outcome column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sensitive Column</Label>
                <Select value={sensitive} onValueChange={setSensitive}>
                  <SelectTrigger>
                    <SelectValue placeholder="e.g. gender, race" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers
                      .filter((h) => h !== target)
                      .map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Analyze button */}
            <Button
              onClick={analyze}
              disabled={!target || !sensitive || analyzing}
              className="mt-6 w-full"
              size="lg"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing bias with Gemini AI…
                </>
              ) : (
                "Analyze Bias"
              )}
            </Button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-4 rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
