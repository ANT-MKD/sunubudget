import React, { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Une erreur est survenue.' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-950">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Une erreur s&apos;est produite</h1>
          <p className="mt-2 max-w-md text-sm text-slate-600 dark:text-slate-400">{this.state.message}</p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            onClick={() => window.location.reload()}
          >
            Recharger l&apos;application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
