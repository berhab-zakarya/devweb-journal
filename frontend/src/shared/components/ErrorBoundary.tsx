'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="text-xl font-semibold text-primary mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-6">{this.state.message}</p>
            <button
              type="button"
              onClick={() => { this.setState({ hasError: false, message: '' }); window.location.reload(); }}
              className="inline-flex items-center h-10 px-4 text-sm rounded bg-brand-600 text-white font-semibold hover:bg-brand-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
