'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [deptRisk, setDeptRisk] = useState([]);
  const [riskDist, setRiskDist] = useState(null);
  const [dropYearData, setDropYearData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, t, d, r, dy] = await Promise.all([
          api.getDashboardStats(),
          api.getTrends(6),
          api.getDepartmentRisk(),
          api.getRiskDistribution(),
          api.getDropYearAnalytics(),
        ]);
        setStats(s);
        setTrends(t);
        setDeptRisk(d);
        setRiskDist(r);
        setDropYearData(dy);
      } catch (err) {
        console.error('Analytics error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 24 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 350 }} />)}
        </div>
      </div>
    );
  }

  const multiTrendData = {
    labels: trends?.labels || [],
    datasets: [
      {
        label: 'Risk Score (%)',
        data: trends?.risk_scores || [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.08)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: 'Attendance (%)',
        data: trends?.attendance || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
      {
        label: 'Avg Grade (%)',
        data: trends?.grades || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.08)',
        fill: true, tension: 0.4, pointRadius: 4,
      },
    ],
  };

  const deptBarData = {
    labels: deptRisk.map(d => d.department || ''),
    datasets: [
      {
        label: 'At Risk Students',
        data: deptRisk.map(d => d.at_risk_count),
        backgroundColor: 'rgba(239,68,68,0.7)',
        borderRadius: 6,
      },
      {
        label: 'Total Students',
        data: deptRisk.map(d => d.student_count),
        backgroundColor: 'rgba(99,102,241,0.4)',
        borderRadius: 6,
      },
    ],
  };

  const riskPieData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [riskDist?.low || 0, riskDist?.medium || 0, riskDist?.high || 0, riskDist?.critical || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 10,
    }],
  };

  const totalStudents = stats?.total_students || 1;
  const atRiskPct = ((stats?.at_risk_count || 0) / totalStudents * 100).toFixed(1);

  return (
    <div className="analytics animate-fade-in">
      <h1>Analytics</h1>
      <p style={{ marginTop: 4 }}>Deep-dive into institution-wide risk patterns and trends</p>

      {/* Summary Cards */}
      <div className="grid-stats" style={{ marginTop: 'var(--space-6)' }}>
        <div className="glass-card stat-card animate-fade-in stagger-1">
          <div className="stat-label">At-Risk Rate</div>
          <div className="stat-value" style={{ color: 'var(--risk-high)' }}>{atRiskPct}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {stats?.at_risk_count} of {totalStudents} students
          </div>
        </div>
        <div className="glass-card stat-card animate-fade-in stagger-2">
          <div className="stat-label">Critical Students</div>
          <div className="stat-value" style={{ color: 'var(--risk-critical)' }}>{stats?.critical_count || 0}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Require immediate intervention
          </div>
        </div>
        <div className="glass-card stat-card animate-fade-in stagger-3">
          <div className="stat-label">Most At-Risk Stream</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>{deptRisk[0]?.department || '—'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            {deptRisk[0]?.at_risk_count || 0} at-risk students
          </div>
        </div>
        <div className="glass-card stat-card animate-fade-in stagger-4">
          <div className="stat-label">Avg Grade</div>
          <div className="stat-value" style={{ color: 'var(--primary-400)' }}>{stats?.avg_grade || 0}%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Institution-wide average
          </div>
        </div>
      </div>

      {/* Class 12 Drop-Year & JEE Risk Matrix */}
      {dropYearData && (
        <div className="glass-card animate-fade-in stagger-2" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 'var(--space-4)' }}>
            <div>
              <h3>🎓 Class 12 Drop-Year & Competitive Exam Risk Analysis</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                Specialized early-warning metrics for gap-year post-12th JEE non-IIT students
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ padding: '6px 14px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg Post-JEE Burnout: </span>
                <span style={{ fontWeight: 700, color: 'var(--risk-critical)' }}>{dropYearData.avg_post_jee_burnout} / 10</span>
              </div>
              <div style={{ padding: '6px 14px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Branch Alignment: </span>
                <span style={{ fontWeight: 700, color: 'var(--risk-low)' }}>{dropYearData.avg_branch_satisfaction} / 10</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {/* Drop Year Gap Breakdown */}
            <div style={{ background: 'var(--surface-glass)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>Risk by Post-12th Gap Years</h4>
              {(dropYearData.drop_years_breakdown || []).map((b) => (
                <div key={b.gap_years} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{b.label} ({b.student_count} students)</span>
                    <span style={{ fontWeight: 700, color: b.avg_risk > 0.5 ? 'var(--risk-critical)' : 'var(--text-secondary)' }}>
                      {(b.avg_risk * 100).toFixed(1)}% avg risk
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${b.avg_risk * 100}%`, height: '100%', borderRadius: 3,
                      background: b.avg_risk > 0.5 ? 'var(--risk-critical)' : b.avg_risk > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Coaching Financial Strain Breakdown */}
            <div style={{ background: 'var(--surface-glass)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>Risk by Coaching Financial Debt</h4>
              {(dropYearData.coaching_strain_breakdown || []).map((c) => (
                <div key={c.strain} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{c.strain} Strain ({c.student_count})</span>
                    <span style={{ fontWeight: 700, color: c.avg_risk > 0.5 ? 'var(--risk-critical)' : 'var(--text-secondary)' }}>
                      {(c.avg_risk * 100).toFixed(1)}% avg risk
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${c.avg_risk * 100}%`, height: '100%', borderRadius: 3,
                      background: c.avg_risk > 0.5 ? 'var(--risk-critical)' : c.avg_risk > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)'
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* College Tier Breakdown */}
            <div style={{ background: 'var(--surface-glass)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: 'var(--space-3)' }}>Risk by Enrolled College Tier</h4>
              {(dropYearData.college_tier_breakdown || []).slice(0, 3).map((t) => (
                <div key={t.tier} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{t.tier} ({t.student_count})</span>
                    <span style={{ fontWeight: 700, color: t.avg_risk > 0.5 ? 'var(--risk-critical)' : 'var(--text-secondary)' }}>
                      {(t.avg_risk * 100).toFixed(1)}% avg risk
                    </span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'var(--surface-3)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      width: `${t.avg_risk * 100}%`, height: '100%', borderRadius: 3,
                      background: t.avg_risk > 0.5 ? 'var(--risk-critical)' : t.avg_risk > 0.3 ? 'var(--risk-medium)' : 'var(--risk-low)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-6)' }} className="analytics-grid">
        <div className="glass-card animate-fade-in stagger-3" style={{ padding: 'var(--space-6)' }}>
          <h3>Multi-Metric Trend Analysis</h3>
          <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>Risk, attendance, and academic performance over time</p>
          <div style={{ height: 320 }}>
            <Line
              data={multiTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16 } } },
                scales: {
                  y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' } },
                  x: { grid: { display: false } },
                },
                interaction: { intersect: false, mode: 'index' },
              }}
            />
          </div>
        </div>

        <div className="glass-card animate-fade-in stagger-4" style={{ padding: 'var(--space-6)' }}>
          <h3>Risk Level Breakdown</h3>
          <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>Distribution of students by risk category</p>
          <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={riskPieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 10 } } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Stream Comparison */}
      <div className="glass-card animate-fade-in stagger-5" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-5)' }}>
        <h3>12th Stream Comparison</h3>
        <p style={{ fontSize: '0.8rem', marginBottom: 'var(--space-4)' }}>At-risk vs total students per 12th Stream (PCM, PCB, Commerce, Arts)</p>
        <div style={{ height: 350 }}>
          <Bar
            data={deptBarData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'top', labels: { usePointStyle: true } } },
              scales: {
                y: { grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Number of Students' } },
                x: { grid: { display: false }, ticks: { maxRotation: 45 } },
              },
            }}
          />
        </div>
      </div>

      {/* Stream Table */}
      <div className="glass-card animate-fade-in stagger-6" style={{ padding: 'var(--space-6)', marginTop: 'var(--space-5)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)' }}>12th Stream Risk Rankings</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>12th Stream</th>
              <th>Students</th>
              <th>At Risk</th>
              <th>Risk %</th>
              <th>Avg Risk Score</th>
            </tr>
          </thead>
          <tbody>
            {deptRisk.map((d, i) => (
              <tr key={d.department}>
                <td style={{ fontWeight: 600 }}>#{i + 1}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{d.department}</td>
                <td>{d.student_count}</td>
                <td style={{ color: d.at_risk_count > 5 ? 'var(--risk-critical)' : 'var(--text-secondary)', fontWeight: 600 }}>
                  {d.at_risk_count}
                </td>
                <td>
                  <span className={`badge badge-${
                    d.at_risk_count / d.student_count > 0.4 ? 'critical' :
                    d.at_risk_count / d.student_count > 0.25 ? 'high' :
                    d.at_risk_count / d.student_count > 0.15 ? 'medium' : 'low'
                  }`}>
                    {(d.at_risk_count / d.student_count * 100).toFixed(0)}%
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${d.avg_risk * 100}%`, height: '100%', borderRadius: 3,
                        background: d.avg_risk > 0.5 ? 'var(--risk-critical)' :
                                    d.avg_risk > 0.35 ? 'var(--risk-high)' :
                                    d.avg_risk > 0.25 ? 'var(--risk-medium)' : 'var(--risk-low)',
                      }} />
                    </div>
                    <span style={{ fontSize: '0.8rem' }}>{(d.avg_risk * 100).toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .analytics-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
