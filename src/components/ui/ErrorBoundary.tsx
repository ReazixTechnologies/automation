"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  /** Short name shown in the fallback, e.g. "live demo". */
  name: string;
  children: ReactNode;
  className?: string;
}

/** Contains a crash to one widget so the rest of the page keeps working. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Event-type only in production; full details help during development.
    if (process.env.NODE_ENV !== "production") console.error(`[${this.props.name}]`, error, info.componentStack);
    else console.error(`[${this.props.name}] render error`);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className={`rounded-card border border-border bg-card p-6 text-center ${this.props.className ?? ""}`}>
        <TriangleAlert aria-hidden className="mx-auto h-8 w-8 text-copper-700 dark:text-copper-400" />
        <p className="mt-2 font-semibold text-foreground">The {this.props.name} couldn&apos;t load.</p>
        <p className="mt-1 text-sm text-muted-foreground">The rest of the page still works.</p>
        <button
          type="button"
          onClick={() => this.setState({ failed: false })}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-foreground/5"
        >
          <RotateCcw aria-hidden className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }
}
