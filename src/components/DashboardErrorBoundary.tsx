"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <main className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center" style={{ background: "#0a1628", color: "#f1f5f9" }}>
          <h1 className="text-xl font-bold text-ocean-text mb-2">Something went wrong</h1>
          <pre className="text-red-300 text-sm max-w-2xl overflow-auto p-4 rounded-lg bg-red-950/30 border border-red-500/30">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-ocean-cyan/20 text-ocean-cyan border border-ocean-cyan/40 hover:bg-ocean-cyan/30"
          >
            Try again
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
