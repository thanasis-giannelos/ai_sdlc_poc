import React from 'react';

interface Props {
  name: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.name}]`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-lg font-semibold text-neutral-900">
            {this.props.name} failed to load
          </p>
          <p className="text-sm text-neutral-500">{this.state.error?.message}</p>
          <button
            type="button"
            className="px-4 py-2 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
