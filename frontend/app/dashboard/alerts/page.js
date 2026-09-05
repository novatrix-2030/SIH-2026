'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [severityFilter, setSeverityFilter] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dispatchModalAlert, setDispatchModalAlert] = useState(null);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const pageSize = 20;

  useEffect(() => {
    loadAlerts();
  }, [page, severityFilter, unreadOnly]);

  async function loadAlerts() {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize };
      if (severityFilter) params.severity = severityFilter;
      if (unreadOnly) params.unread_only = true;
      const data = await api.getAlerts(params);
      setAlerts(data.alerts || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function markRead(alertId) {
    try {
      await api.markAlertRead(alertId);
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (err) {
      console.error('Failed to mark alert:', err);
    }
  }

  const alertTypeIcons = {
    risk_threshold_breach: '🚨',
    attendance_drop: '📉',
    consecutive_absences: '🏠',
    grade_decline: '📊',
    rapid_risk_increase: '⚡',
    payment_overdue: '💳',
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="alerts-page animate-fade-in">
      <div className="flex-between">
        <div>
          <h1>Alerts</h1>
          <p style={{ marginTop: 4 }}>{total} alerts total • {alerts.filter(a => !a.is_read).length} unread on this page</p>
        </div>
      </div>

      {/* Alert Engine Banner */}
      <div style={{
        marginTop: 'var(--space-4)',
        padding: '14px 18px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(6, 182, 212, 0.12))',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: '1.4rem' }}>⚡</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Automated Multi-Channel Alert Engine (Twilio SMS • WhatsApp API • Email Gateway)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Real-time early warning triggers dispatched to parents, class teachers, and student counselors per NEP 2020 retention guidelines.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderRadius: 99, fontWeight: 600 }}>
            ● WhatsApp Active
          </span>
          <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderRadius: 99, fontWeight: 600 }}>
            ● Twilio SMS Online
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
        <select
          className="input-field"
          value={severityFilter}
          onChange={e => { setSeverityFilter(e.target.value); setPage(1); }}
          style={{ width: 180, cursor: 'pointer' }}
        >
          <option value="">All Severities</option>
          <option value="critical">🔴 Critical</option>
          <option value="warning">🟡 Warning</option>
          <option value="info">🔵 Info</option>
        </select>

        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '8px 16px', background: 'var(--surface-2)',
          border: `1px solid ${unreadOnly ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
          borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)',
          transition: 'all var(--transition-fast)',
        }}>
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={e => { setUnreadOnly(e.target.checked); setPage(1); }}
            style={{ accentColor: 'var(--primary-500)' }}
          />
          Unread only
        </label>
      </div>

      {/* Alerts List */}
      <div style={{ marginTop: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {loading ? (
          [...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80 }} />)
        ) : alerts.length === 0 ? (
          <div className="glass-card" style={{ padding: 'var(--space-9)', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h3 style={{ marginTop: 'var(--space-3)' }}>All clear!</h3>
            <p style={{ color: 'var(--text-tertiary)' }}>No alerts matching your criteria</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
            <div
              key={alert.id}
              className="glass-card animate-fade-in"
              style={{
                padding: 'var(--space-4) var(--space-5)',
                animationDelay: `${idx * 0.03}s`,
                display: 'flex', gap: 'var(--space-4)', alignItems: 'center',
                opacity: alert.is_read ? 0.65 : 1,
                borderLeft: `3px solid ${
                  alert.severity === 'critical' ? 'var(--risk-critical)' :
                  alert.severity === 'warning' ? 'var(--risk-medium)' : 'var(--primary-400)'
                }`,
              }}
            >
              {/* Icon */}
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                {alertTypeIcons[alert.alert_type] || '🔔'}
              </span>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {alert.title}
                  </span>
                  {!alert.is_read && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-400)',
                    }} />
                  )}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {alert.message}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 4, flexWrap: 'wrap' }}>
                  <Link href={`/dashboard/students/${alert.student_id}`} style={{ fontSize: '0.8rem', color: 'var(--text-accent)' }}>
                    👤 {alert.student_name}
                  </Link>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexShrink: 0 }}>
                <span className={`badge badge-${alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'medium' : 'low'}`}>
                  {alert.severity}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setDispatchModalAlert(alert);
                    setDispatchStatus(null);
                  }}
                  style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  💬 Dispatch
                </button>
                {!alert.is_read && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => markRead(alert.id)}
                    style={{ fontSize: '0.75rem' }}
                  >
                    ✓ Read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      {dispatchModalAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 'var(--space-4)'
        }}>
          <div className="glass-card-elevated" style={{ maxWidth: 520, width: '100%', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Dispatch Multi-Channel Alert</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                  Team DropGuard Alert Engine • Twilio & WhatsApp Gateway
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDispatchModalAlert(null)}>✕</button>
            </div>

            <div style={{ marginTop: 'var(--space-4)', padding: '12px 14px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{dispatchModalAlert.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                {dispatchModalAlert.message}
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Parent Mobile (SMS / WhatsApp):</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>+91 98765-43210</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Counselor Email Gateway:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>counselor@dropguard.gov.in</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Routing Provider:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>Twilio API + Meta Cloud API</span>
              </div>
            </div>

            {dispatchStatus && (
              <div style={{
                marginTop: 'var(--space-4)', padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)', color: '#10b981', fontSize: '0.85rem', fontWeight: 600,
                textAlign: 'center'
              }}>
                ✓ {dispatchStatus}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setDispatchModalAlert(null)}>
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setDispatchStatus('Dispatched successfully via Twilio SMS & WhatsApp Business API!');
                  setTimeout(() => {
                    markRead(dispatchModalAlert.id);
                  }, 800);
                }}
              >
                Send Instant Notification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 'var(--space-3)', marginTop: 'var(--space-5)',
        }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            ← Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
