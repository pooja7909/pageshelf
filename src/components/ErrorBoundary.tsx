import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      showDetails: false
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      localStorage.removeItem('ps.categories');
      localStorage.removeItem('ps.links');
      localStorage.removeItem('ps.config');
      localStorage.removeItem('ps.timelineMilestones');
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      const errMessage = this.state.error?.message || 'An unexpected runtime error occurred.';

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#eef1ef',
          color: '#16211d',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid #d3dbd7'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#fef2f2',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>
                  Page Shelf Encountered an Issue
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#5b6a64' }}>
                  The application ran into an unexpected error during loading.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8faf9',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #e5eae7',
              marginBottom: '20px',
              fontSize: '0.85rem',
              color: '#374151'
            }}>
              <strong>Error summary:</strong> {errMessage}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1d6b57',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} /> Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 size={15} /> Reset Local Cache
              </button>

              <button
                type="button"
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  padding: '9px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                {this.state.showDetails ? (
                  <>Hide Technical Details <ChevronUp size={14} /></>
                ) : (
                  <>Show Technical Details <ChevronDown size={14} /></>
                )}
              </button>
            </div>

            {this.state.showDetails && (
              <pre style={{
                margin: 0,
                padding: '12px',
                backgroundColor: '#111827',
                color: '#f3f4f6',
                borderRadius: '8px',
                fontSize: '0.75rem',
                overflowX: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace'
              }}>
                {this.state.error?.stack || String(this.state.error)}
                {this.state.errorInfo?.componentStack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
