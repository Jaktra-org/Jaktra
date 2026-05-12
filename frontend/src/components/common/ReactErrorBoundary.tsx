import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
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
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#010102] p-6 text-center text-[#f7f8f8]">
          <div className="w-full max-w-md bg-[#0f1011] border border-[#23252a] rounded-xl p-8 shadow-none">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/40 border border-red-900/50 mb-5">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-[#f7f8f8] mb-1.5">Something went wrong</h1>
            <p className="text-xs text-[#8a8f98] mb-6">
              An unexpected error occurred while rendering this page.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-[#010102] border border-[#23252a] rounded-lg p-3.5 mb-6 text-left max-h-40 overflow-auto">
                <code className="text-[11px] text-red-400 block break-all whitespace-pre-wrap font-mono">
                  {getErrorMessage(this.state.error)}
                </code>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center rounded-md bg-[#5e6ad2] text-white font-medium hover:bg-[#828fff] px-3.5 py-1.5 text-xs transition-colors"
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center rounded-md border border-[#23252a] bg-[#0f1011] text-[#f7f8f8] font-medium hover:bg-[#141516] px-3.5 py-1.5 text-xs transition-colors"
              >
                <Home className="mr-1.5 h-3.5 w-3.5 text-[#8a8f98]" />
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
