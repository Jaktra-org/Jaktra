import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { getErrorMessage } from "../../utils/error-utils";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ReactErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled runtime rendering error caught by boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0b0c0e] bg-gradient-to-b from-[#0b0c0e] via-[#0f1117] to-[#0b0c0e] flex flex-col items-center justify-center p-6 text-[#f7f8f8]">
          {/* Top Brand Tag */}
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#f7f8f8]">Jaktra</span>
          </div>

          {/* Main Error Container */}
          <div className="w-full max-w-lg bg-[#13161c]/90 border border-[#1e2025] rounded-2xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
            {/* Status Pill Badge */}
            <div className="inline-flex items-center justify-center">
              <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-red-950/50 text-red-400 border border-red-900/60 tracking-wide uppercase">
                System Exception
              </span>
            </div>

            {/* Error Message Header */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#f7f8f8]">
                Something went wrong
              </h1>
              <p className="text-xs text-[#8a8f98] max-w-sm mx-auto leading-relaxed">
                An unexpected application rendering error occurred. You can reload the current view or return to your main dashboard.
              </p>
            </div>

            {/* Technical Exception Stack Trace (Dev Mode) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-[#0e1013] border border-[#1e2025] rounded-xl p-4 text-left max-h-48 overflow-y-auto custom-scrollbar">
                <span className="text-[10px] font-semibold text-[#8a8f98] uppercase tracking-wider block mb-1.5">
                  Error Details
                </span>
                <code className="text-[11px] text-red-400 block break-all whitespace-pre-wrap font-mono leading-relaxed">
                  {getErrorMessage(this.state.error)}
                </code>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center rounded-xl bg-[#5e6ad2] text-white font-semibold hover:bg-[#828fff] h-10 px-5 text-xs transition-all shadow-lg shadow-[#5e6ad2]/20 active:scale-[0.98] cursor-pointer"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center rounded-xl border border-[#1e2025] bg-[#13161c] hover:bg-[#1d212a] text-[#f7f8f8] font-semibold h-10 px-5 text-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
