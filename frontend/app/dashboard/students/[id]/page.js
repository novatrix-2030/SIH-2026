'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '../../../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function StudentProfilePage() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getStudent(id);
        setStudent(data);
      } catch (err) {
        console.error('Failed to load student:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: 200, height: 28, marginBottom: 20 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div className="skeleton" style={{ height: 400 }} />
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </div>
    );
  }

  if (!student) {
    return <div style={{ textAlign: 'center', padding: 80 }}>Student not found</div>;
  }

  const riskColor = {
    low: 'var(--risk-low)', medium: 'var(--risk-medium)',
    high: 'var(--risk-high)', critical: 'var(--risk-critical)'
  }[student.risk_level] || 'var(--text-tertiary)';

  // SHAP factors from latest risk prediction
  const latestRisk = student.risk_history?.[student.risk_history.length - 1];
  const shapFactors = latestRisk?.top_factors || [];

  // Risk timeline chart
  const riskTimelineData = {
    labels: (student.risk_history || []).map(r => {
      const d = new Date(r.date);
      return d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    }),
    datasets: [{
      label: 'Risk Score',
      data: (student.risk_history || []).map(r => (r.risk_score * 100).toFixed(1)),
      borderColor: 'rgba(239, 68, 68, 0.8)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: (student.risk_history || []).map(r =>
        r.risk_level === 'critical' ? '#ef4444' :
        r.risk_level === 'high' ? '#f97316' :
        r.risk_level === 'medium' ? '#f59e0b' : '#10b981'
      ),
    }],
  };

  // SHAP waterfall chart
  const shapChartData = {
    labels: shapFactors.slice(0, 8).map(f => f.feature_label || f.feature),
    datasets: [{
      label: 'Impact on Risk',
      data: shapFactors.slice(0, 8).map(f => (f.impact * 100).toFixed(1)),
      backgroundColor: shapFactors.slice(0, 8).map(f =>
        f.impact > 0 ? 'rgba(239, 68, 68, 0.7)' : 'rgba(16, 185, 129, 0.7)'
      ),
      borderColor: shapFactors.slice(0, 8).map(f =>
        f.impact > 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(16, 185, 129, 1)'
      ),
      borderWidth: 1,
      borderRadius: 4,
      barThickness: 22,
    }],
  };

  // Attendance chart
  const attendanceSummary = student.attendance_summary || [];
  const attendanceChartData = {
    labels: attendanceSummary.map(a => a.month),
    datasets: [{
      label: 'Attendance %',
      data: attendanceSummary.map(a => a.attendance_pct),
      borderColor: 'rgba(6, 182, 212, 0.8)',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  return (
    <div className="student-profile animate-fade-in">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-5)' }}>
        <Link href="/dashboard/students" style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
          ← Students
        </Link>
        <span style={{ color: 'var(--text-tertiary)' }}>/</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {student.full_name || `${student.first_name} ${student.last_name}`}
        </span>
      </div>

      {/* Header Card */}
      <div className="glass-card-elevated" style={{ padding: 'var(--space-7)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: 'var(--radius-xl)',
            background: `linear-gradient(135deg, ${riskColor}, var(--primary-500))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', fontWeight: 800, color: 'white',
            boxShadow: `0 4px 20px ${riskColor}40`,
            flexShrink: 0,
          }}>
            {student.first_name?.[0]}{student.last_name?.[0]}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.75rem' }}>{student.full_name || `${student.first_name} ${student.last_name}`}</h1>
              <span className={`badge badge-${student.risk_level || 'low'}`} style={{ fontSize: '0.8rem' }}>
                {student.risk_level || 'N/A'} Risk
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-6)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              <InfoPill label="Roll / Registration No" value={student.enrollment_no} />
              <InfoPill label="12th Stream" value={student.department} />
              <InfoPill label="Class & Section" value={student.current_class} />
            </div>
          </div>

          {/* Risk Gauge */}
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              border: `4px solid ${riskColor}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: `${riskColor}12`,
              boxShadow: `0 0 30px ${riskColor}25`,
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: riskColor }}>
                {student.risk_score !== null ? `${(student.risk_score * 100).toFixed(0)}` : '—'}
              </span>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Risk Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }} className="profile-grid">

        {/* SHAP Explanation — WHY this student is at risk */}
        <div className="glass-card animate-fade-in stagger-1" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 4 }}>🔍 Why this student is at risk</h3>
          <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>
            SHAP analysis — factors contributing to dropout risk
          </p>
          {shapFactors.length > 0 ? (
            <div style={{ height: 260 }}>
              <Bar
                data={shapChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: ctx => {
                          const val = ctx.raw;
                          return `${val > 0 ? '↑ Increases' : '↓ Decreases'} risk by ${Math.abs(val).toFixed(1)}%`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(255,255,255,0.04)' },
                      title: { display: true, text: '← Reduces Risk | Increases Risk →', font: { size: 10 } },
                    },
                    y: { grid: { display: false } },
                  },
                }}
              />
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)' }}>No SHAP data available</p>
          )}
          {/* Factor details */}
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {shapFactors.slice(0, 4).map((f, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                background: f.impact > 0 ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${f.impact > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.feature_label}</span>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600,
                  color: f.impact > 0 ? 'var(--risk-critical)' : 'var(--risk-low)',
                }}>
                  {f.impact > 0 ? '↑' : '↓'} {(Math.abs(f.impact) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Timeline */}
        <div className="glass-card animate-fade-in stagger-2" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📈 Risk Score Timeline</h3>
          <div style={{ height: 280 }}>
            <Line
              data={riskTimelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Risk %' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Attendance Chart */}
        <div className="glass-card animate-fade-in stagger-3" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📋 Monthly Attendance</h3>
          <div style={{ height: 250 }}>
            <Line
              data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } },
                  x: { grid: { display: false } },
                },
              }}
            />
          </div>
        </div>

        {/* Class 12 & Competitive Exam (JEE) Drop-Year Profile */}
        <div className="glass-card animate-fade-in stagger-4" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎓</span> Class 12 Drop-Year & Exam Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <DetailItem label="12th Board Score" value={`${student.class_12_percentage?.toFixed(1) || 75}%`} highlight={student.class_12_percentage < 65} />
            <DetailItem label="Post-12th Drop Years" value={`${student.drop_years_count || 0} Gap Year(s)`} highlight={(student.drop_years_count || 0) > 0} />
            <DetailItem label="JEE Main Score" value={student.jee_percentile ? `${student.jee_percentile}%ile` : 'N/A'} highlight={(student.jee_percentile || 100) < 80} />
            <DetailItem label="Coaching Institute" value={student.coaching_type || 'Offline Coaching'} />
            <DetailItem label="Coaching Debt Strain" value={(student.coaching_financial_strain || 'low').toUpperCase()} highlight={student.coaching_financial_strain === 'severe'} />
            <DetailItem label="Current Institution Tier" value={student.current_college_tier || 'Tier-3 Private'} highlight={student.current_college_tier?.includes('Tier-3')} />
            <DetailItem label="Branch Satisfaction" value={`${student.branch_satisfaction_score || 5} / 10`} highlight={(student.branch_satisfaction_score || 10) < 4} />
            <DetailItem label="Post-JEE Burnout" value={`${student.post_jee_burnout_index || 4} / 10`} highlight={(student.post_jee_burnout_index || 0) > 6} />
          </div>
        </div>

        {/* Personal & Socioeconomic Info */}
        <div className="glass-card animate-fade-in stagger-4" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>👤 Socioeconomic Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <DetailItem label="Gender" value={student.gender} />
            <DetailItem label="Date of Birth" value={student.date_of_birth} />
            <DetailItem label="City" value={student.city} />
            <DetailItem label="State" value={student.state} />
            <DetailItem label="Income Level" value={student.family_income_bracket} highlight={student.family_income_bracket === 'low'} />
            <DetailItem label="Parent Education" value={student.parent_education} />
            <DetailItem label="Parent Occupation" value={student.parent_occupation} />
            <DetailItem label="Distance (km)" value={student.distance_from_school_km?.toFixed(1)} highlight={student.distance_from_school_km > 20} />
            <DetailItem label="Scholarship" value={student.has_scholarship ? `✅ ${student.scholarship_type || 'Yes'}` : '❌ No'} />
            <DetailItem label="First Generation" value={student.is_first_generation ? '✅ Yes' : 'No'} />
            <DetailItem label="Internet Access" value={student.has_internet_access ? '✅ Yes' : '❌ No'} highlight={!student.has_internet_access} />
            <DetailItem label="Living" value={student.living_situation?.replace('_', ' ')} />
          </div>
        </div>

        {/* Grades */}
        <div className="glass-card animate-fade-in stagger-5" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>📊 Class 12 Board & Pre-Board Marks</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>12th Subject</th>
                  <th>Exam / Term</th>
                  <th>Marks</th>
                  <th>CBSE Grade</th>
                  <th>Exam Category</th>
                </tr>
              </thead>
              <tbody>
                {(student.grades || []).slice(0, 20).map((g, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{g.subject}</td>
                    <td>{g.semester}</td>
                    <td>
                      <span style={{
                        color: g.marks / g.max_marks >= 0.6 ? 'var(--risk-low)' :
                               g.marks / g.max_marks >= 0.4 ? 'var(--risk-medium)' : 'var(--risk-critical)',
                        fontWeight: 600,
                      }}>
                        {g.marks?.toFixed(1)} / {g.max_marks}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 'var(--radius-full)',
                        background: g.grade === 'F' ? 'var(--risk-critical-bg)' : 'var(--surface-3)',
                        color: g.grade === 'F' ? 'var(--risk-critical)' : 'var(--text-secondary)',
                        fontSize: '0.8rem', fontWeight: 600,
                      }}>
                        {g.grade}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{g.exam_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Interventions */}
        {(student.interventions || []).length > 0 && (
          <div className="glass-card animate-fade-in stagger-6" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>💡 Interventions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {student.interventions.map((intv) => (
                <div key={intv.id} style={{
                  padding: 'var(--space-4)', borderRadius: 'var(--radius-md)',
                  background: 'var(--surface-glass)', border: '1px solid var(--border-subtle)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 'var(--space-3)',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{intv.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {intv.type?.replace('_', ' ')} • Assigned to {intv.assigned_to || 'TBD'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <span className={`badge ${
                      intv.status === 'completed' ? 'badge-low' :
                      intv.status === 'in_progress' ? 'badge-medium' : 'badge-high'
                    }`}>
                      {intv.status?.replace('_', ' ')}
                    </span>
                    <span className={`badge badge-${intv.priority === 'urgent' ? 'critical' : 'medium'}`}>
                      {intv.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );
}

function DetailItem({ label, value, highlight = false }) {
  return (
    <div style={{
      padding: '8px 12px', borderRadius: 'var(--radius-sm)',
      background: highlight ? 'rgba(239,68,68,0.06)' : 'var(--surface-glass)',
      border: `1px solid ${highlight ? 'rgba(239,68,68,0.15)' : 'var(--border-subtle)'}`,
    }}>
      <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{
        fontSize: '0.875rem', fontWeight: 500, marginTop: 2,
        color: highlight ? 'var(--risk-critical)' : 'var(--text-primary)',
        textTransform: 'capitalize',
      }}>
        {value || '—'}
      </div>
    </div>
  );
}
