'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';
import ScrollReveal from '../components/ScrollReveal';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container">
        <ScrollReveal variant="scale-up" duration={700}>
          <div className="login-card glass-card-elevated">
            {/* Logo */}
            <div className="login-logo">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#818cf8' }} />
                    <stop offset="100%" style={{ stopColor: '#06b6d4' }} />
                  </linearGradient>
                </defs>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>

            <h1 className="login-title">
              <span className="text-gradient">DropGuard</span>
            </h1>
            <p className="login-subtitle">
              Student Dropout Early Warning System
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              SIH 2026 • Smart Education
            </p>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Username
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={{ marginBottom: 'var(--space-5)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>
                  Password
                </label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                  color: 'var(--risk-critical)', fontSize: '0.85rem',
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', fontSize: '0.9375rem' }}
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="spinner" /> Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Demo credentials */}
            <div style={{
              marginTop: 'var(--space-5)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Demo Credentials
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { role: 'Admin', user: 'admin', pass: 'admin123' },
                  { role: 'Teacher', user: 'teacher', pass: 'teacher123' },
                  { role: 'Counselor', user: 'counselor', pass: 'counselor123' },
                ].map(cred => (
                  <button
                    key={cred.user}
                    type="button"
                    onClick={() => { setUsername(cred.user); setPassword(cred.pass); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      padding: '4px 8px', borderRadius: 4, color: 'var(--text-secondary)', fontSize: '0.8rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>{cred.role}:</strong> {cred.user} / {cred.pass}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Features strip */}
        <div className="login-features">
          {['AI-Powered Predictions', 'SHAP Explainability', 'Real-Time Alerts', 'Intervention Tracking'].map((f, i) => (
            <ScrollReveal
              key={i}
              variant={i % 2 === 0 ? 'assemble-left' : 'assemble-right'}
              delay={300 + i * 100}
              duration={500}
            >
              <div className="login-feature-chip">
                {['🤖', '🔍', '🔔', '💡'][i]} {f}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .login-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 8s ease-in-out infinite;
        }

        .login-orb-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.3), transparent);
          top: -100px; right: -100px;
          animation-delay: 0s;
        }

        .login-orb-2 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(6,182,212,0.2), transparent);
          bottom: -80px; left: -80px;
          animation-delay: -3s;
        }

        .login-orb-3 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(139,92,246,0.2), transparent);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -5s;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }

        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: var(--space-5);
        }

        .login-card {
          padding: var(--space-8);
          text-align: center;
        }

        .login-logo {
          margin-bottom: var(--space-4);
        }

        .login-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .login-subtitle {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-2);
        }

        .login-features {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          justify-content: center;
          margin-top: var(--space-5);
        }

        .login-feature-chip {
          padding: 6px 14px;
          background: var(--surface-1);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
          backdrop-filter: blur(12px);
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
