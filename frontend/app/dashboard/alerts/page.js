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
