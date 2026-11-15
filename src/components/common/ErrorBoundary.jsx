import React from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "./button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[Global ErrorBoundary Caught Exception]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-[480px] w-full flex items-center justify-center p-6 text-[hsl(var(--foreground))]"
        >
          <div className="max-w-lg w-full rounded-2xl border border-rose-500/30 bg-[hsl(var(--card))] p-8 shadow-2xl space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Something Went Wrong</h2>
              <p className="text-sm text-muted leading-relaxed">
                An unexpected application rendering error occurred. You can attempt to refresh the view or return to the main dashboard.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left rounded-xl bg-slate-950 p-4 font-mono text-xs text-rose-300 overflow-x-auto max-h-40 border border-rose-900/40">
                <p className="font-bold">{this.state.error.toString()}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={this.handleReset}
              >
                <RotateCcw className="h-4 w-4" /> Try Again
              </Button>
              <Button
                variant="gradient"
                className="gap-2"
                onClick={() => {
                  window.location.href = "/";
                }}
              >
                <Home className="h-4 w-4" /> Return to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
