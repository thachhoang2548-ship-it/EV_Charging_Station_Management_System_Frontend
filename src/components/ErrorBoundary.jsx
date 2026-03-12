import React from 'react';

/**
 * ErrorBoundary — bắt lỗi runtime trong component tree,
 * hiển thị UI thân thiện thay vì trắng trang (WSOD).
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    padding: '40px 24px',
                    textAlign: 'center',
                    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: '#fef2f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 36,
                        marginBottom: 20,
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#1e293b',
                        margin: '0 0 8px',
                    }}>
                        Đã xảy ra lỗi
                    </h2>
                    <p style={{
                        fontSize: '0.9rem',
                        color: '#64748b',
                        maxWidth: 400,
                        lineHeight: 1.6,
                        margin: '0 0 24px',
                    }}>
                        Trang không thể tải được. Vui lòng thử lại hoặc liên hệ bộ phận hỗ trợ nếu lỗi lặp lại.
                    </p>
                    <button
                        onClick={this.handleReload}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 28px',
                            borderRadius: 12,
                            border: 'none',
                            background: 'linear-gradient(135deg, #16a34a, #15803d)',
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(22,163,74,0.35)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(22,163,74,0.25)';
                        }}
                    >
                        🔄 Thử lại
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{
                            marginTop: 24,
                            padding: 16,
                            background: '#f8fafc',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            maxWidth: 500,
                            width: '100%',
                            textAlign: 'left',
                        }}>
                            <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
                                Chi tiết lỗi (dev only)
                            </summary>
                            <pre style={{
                                marginTop: 8,
                                fontSize: '0.75rem',
                                color: '#ef4444',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                            }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
