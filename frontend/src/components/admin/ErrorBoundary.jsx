/**
 * components/admin/ErrorBoundary.jsx
 *
 * Catches runtime React render exceptions within admin pages.
 * Displays a custom Shinobi diagnostic crash panel with restart actions.
 */

import React from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { KatanaIcon } from '@/components/ui/ShinobiIcons';

export default function ErrorBoundaryWrapper(props) {
  return <ErrorBoundary {...props} />;
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught admin layout exception:', error, errorInfo);
  }

  handleRestart = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <section aria-label="Crash Diagnostic Panel" className="flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-surface/95 backdrop-blur-2xl border border-rose-500/30 rounded-xl max-w-xl mx-auto my-12 space-y-4 shadow-2xl relative overflow-hidden">
          {/* Top Katana Edge Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent pointer-events-none" />

          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-sm">
            <ShieldAlert size={24} />
          </div>

          <header className="space-y-1">
            <h2 className="text-lg font-display font-black text-white tracking-tight">Admin Component Crash Detected</h2>
            <p className="text-secondary text-xs leading-relaxed font-mono">
              A runtime rendering exception occurred in this sector of the admin workspace.
            </p>
          </header>

          {this.state.error && (
            <pre className="p-3 bg-black/50 border border-subtle text-[10.5px] text-rose-300 font-mono rounded-lg overflow-auto max-w-full text-left w-full shadow-inner">
              {this.state.error.toString()}
            </pre>
          )}

          <footer className="pt-2">
            <Button
              type="button"
              onClick={this.handleRestart}
              variant="primary"
              size="sm"
              icon={KatanaIcon}
              className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider"
            >
              <span>Reload Workspace Sector</span>
            </Button>
          </footer>
        </section>
      );
    }

    return this.props.children;
  }
}
