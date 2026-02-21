/**
 * ErrorBoundary – Fängt React-Rendering-Fehler ab und zeigt eine Fallback-UI.
 */
import React from 'react';

interface Props {
    children: React.ReactNode;
    appName?: string;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[ErrorBoundary${this.props.appName ? ` - ${this.props.appName}` : ''}]`, error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#0f172a', color: '#e2e8f0', padding: 40,
                    gap: 16,
                }}>
                    <div style={{ fontSize: '3rem' }}>⚠️</div>
                    <h2 style={{ margin: 0, color: '#f8fafc' }}>
                        {this.props.appName ? `${this.props.appName}: ` : ''}Etwas ist schiefgelaufen
                    </h2>
                    <p style={{ color: '#94a3b8', maxWidth: 500, textAlign: 'center', lineHeight: 1.6 }}>
                        Ein unerwarteter Fehler ist aufgetreten. Versuchen Sie, die Komponente neu zu laden.
                    </p>
                    <pre style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 8, padding: '12px 20px', fontSize: '0.8rem',
                        color: '#fca5a5', maxWidth: 600, overflow: 'auto',
                    }}>
                        {this.state.error?.message || 'Unbekannter Fehler'}
                    </pre>
                    <button
                        onClick={() => this.setState({ hasError: false, error: undefined })}
                        style={{
                            padding: '10px 24px', background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                            border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.9rem',
                        }}
                    >
                        🔄 Erneut versuchen
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
