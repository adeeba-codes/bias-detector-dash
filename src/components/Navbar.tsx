import { Link } from "@tanstack/react-router";
import { Scale } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  actions?: ReactNode;
}

export function Navbar({ actions }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Scale className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-semibold tracking-tight">FairScan AI</span>
            <span className="block text-[10px] uppercase tracking-widest text-muted-foreground">
              Bias Detection
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1 text-sm font-medium">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-accent text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-2 transition-colors"
            >
              Upload
            </Link>
            <Link
              to="/history"
              activeProps={{ className: "bg-accent text-foreground" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
              className="rounded-md px-3 py-2 transition-colors"
            >
              History
            </Link>
          </nav>
          {actions ? (
            <div className="flex items-center gap-2 border-l pl-4">{actions}</div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
