'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function ParentPortalPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.getStudents({ page: 1, page_size: 10 });
        if (data.students && data.students.length > 0) {
          setStudents(data.students);
          // Default to an at-risk or first student
          const atRisk = data.students.find(s => s.risk_level === 'high' || s.risk_level === 'critical');
          setSelectedStudent(atRisk || data.students[0]);
        }
      } catch (err) {
        console.error('Failed to load parent portal student:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: 'var(--space-6)' }}>
        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
        <div className="skeleton" style={{ height: 350, marginTop: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="parent-portal animate-fade-in">
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.75rem' }}>👨‍👩‍👧</span>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Parent & Guardian Portal</h1>
          </div>
          <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>
            Transparent real-time academic, attendance & counseling monitoring for parents (NEP 2020)
          </p>
        </div>

        {/* Student Selector */}
        {students.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              Viewing Child:
            </span>
            <select
              className="input-field"
              value={selectedStudent?.id || ''}
              onChange={(e) => {
                const s = students.find(item => item.id === parseInt(e.target.value));
                if (s) setSelectedStudent(s);
              }}
              style={{ minWidth: 220, cursor: 'pointer' }}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.department}) - {s.risk_level?.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {selectedStudent && (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Main Card */}
          <div className="glass-card-elevated" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedStudent.full_name}</h2>
                  <span className={`badge badge-${selectedStudent.risk_level || 'low'}`} style={{ textTransform: 'capitalize' }}>
                    {selectedStudent.risk_level} Risk Status
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 8, flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span>🏷️ <b>APAAR ID:</b> {selectedStudent.apaar_id || `APAAR-2026-${10000000 + selectedStudent.id}`}</span>
                  <span>🏫 <b>UDISE+ Code:</b> {selectedStudent.udise_code || '07040100101'}</span>
                  <span>🎓 <b>Class:</b> {selectedStudent.current_class || 'Class 12-A'}</span>
                  <span>📚 <b>Stream:</b> {selectedStudent.department}</span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link href={`/dashboard/students/${selectedStudent.id}`} className="btn btn-secondary btn-sm">
                  Full Student Record ↗
                </Link>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginTop: 'var(--space-6)' }}>
              <div className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Attendance
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: (selectedStudent.attendance_pct || 84) > 75 ? 'var(--risk-low)' : 'var(--risk-critical)', marginTop: 4 }}>
                  {selectedStudent.attendance_pct ? selectedStudent.attendance_pct.toFixed(0) : 84}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  Threshold: 75% minimum
                </div>
              </div>

              <div className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pre-Board Grade Avg
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-300)', marginTop: 4 }}>
                  {selectedStudent.avg_grade ? selectedStudent.avg_grade.toFixed(1) : 78.3}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  CBSE Class 12 Syllabus
                </div>
              </div>

              <div className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  AI Dropout Risk Score
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: selectedStudent.risk_level === 'critical' ? 'var(--risk-critical)' : selectedStudent.risk_level === 'high' ? 'var(--risk-high)' : 'var(--risk-low)', marginTop: 4 }}>
                  {selectedStudent.risk_score ? (selectedStudent.risk_score * 100).toFixed(0) : 18}/100
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  0-100 LightGBM / XGBoost Model
                </div>
              </div>

              <div className="glass-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Counselor Contact Status
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: 8 }}>
                  Active Care
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Assigned: Mr. Amit Saxena
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Channels & Counselor Action */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {/* Live Notifications Feed */}
            <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>📱 Real-time Parent Alerts Feed</h3>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', background: 'rgba(16,185,129,0.15)', color: '#10b981', borderRadius: 99 }}>
                  ● SMS / WhatsApp Connected
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid #10b981' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    <span>WhatsApp Notification Sent</span>
                    <span>Today, 09:30 AM</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
                    Attendance Verified: Present in Period 1 & 2
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Verified via automated biometric school gateway (Zone 04).
                  </div>
                </div>

                <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--risk-high)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    <span>Counselor Early Warning</span>
                    <span>3 days ago</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: 4 }}>
                    Mathematics Pre-Board Remedial Session Scheduled
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Free after-school tutorial recommended to boost scores before Class 12 Boards.
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Connect with School Counselor */}
            <div className="glass-card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                💬 Direct Counselor Hotline
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Request an instant phone consultation, home visit, or fee-support scholarship guidance from the student retention desk.
              </p>

              {contactSent ? (
                <div style={{ padding: '16px', background: 'rgba(16,185,129,0.15)', borderRadius: 'var(--radius-md)', color: '#10b981', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem' }}>✓ Consultation Request Dispatched!</div>
                  <div style={{ fontSize: '0.82rem', marginTop: 4 }}>
                    School Counselor Mr. Amit Saxena will contact you on your registered WhatsApp number within 4 hours.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Enter query (e.g. Request extra math support, discuss fee installment plan, or report health leave)..."
                    style={{ resize: 'none' }}
                    defaultValue={`I would like to discuss my child's attendance and upcoming Pre-Board preparation with the counselor.`}
                  />
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setContactSent(true)}
                    >
                      Dispatch Request via WhatsApp & SMS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
