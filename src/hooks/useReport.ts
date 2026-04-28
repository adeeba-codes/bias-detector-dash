import { useEffect, useState } from "react";
import { getReport, getReports } from "@/lib/bias-store";
import type { BiasReport } from "@/lib/bias";

type State<T> = { data: T; loading: boolean; error: Error | null };

/** Load a single report by id from local storage. */
export function useReport(id: string): State<BiasReport | null> {
  const [state, setState] = useState<State<BiasReport | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    try {
      const r = getReport(id) ?? null;
      if (!cancelled) setState({ data: r, loading: false, error: null });
    } catch (e) {
      if (!cancelled)
        setState({ data: null, loading: false, error: e as Error });
    }
    return () => {
      cancelled = true;
    };
  }, [id]);

  return state;
}

/** Load all stored reports. */
export function useReports(): State<BiasReport[]> {
  const [state, setState] = useState<State<BiasReport[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    try {
      setState({ data: getReports(), loading: false, error: null });
    } catch (e) {
      setState({ data: [], loading: false, error: e as Error });
    }
  }, []);

  return state;
}
