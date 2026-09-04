'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import api from '../../lib/api';
import PlotlyTrendChart from '../../components/PlotlyTrendChart';
import ScrollReveal from '../../components/ScrollReveal';
import AnimatedCounter from '../../components/AnimatedCounter';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

// Chart default config
ChartJS.defaults.color = '#94a3b8';
ChartJS.defaults.borderColor = 'rgba(255,255,255,0.06)';
ChartJS.defaults.font.family = "'Inter', sans-serif";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [riskDist, setRiskDist] = useState(null);
  const [trends, setTrends] = useState(null);
  const [deptRisk, setDeptRisk] = useState(null);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6M');
  const [selectedModal, setSelectedModal] = useState(null);
  const [runningAssessment, setRunningAssessment] = useState(false);
  const [selectedTrendPoint, setSelectedTrendPoint] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, distData, trendsData, deptData, alertsData] = await Promise.all([
          api.getDashboardStats(),
          api.getRiskDistribution(),
          api.getTrends(6),
          api.getDepartmentRisk(),
          api.getAlerts({ page_size: 5, unread_only: true }),
        ]);
        setStats(statsData);
        setRiskDist(distData);
        setTrends(trendsData);
        setDeptRisk(deptData);
        setRecentAlerts(alertsData?.alerts || []);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTimeRangeChange = async (range) => {
    setTimeRange(range);
    setSelectedTrendPoint(null);
    const monthsCount = range === '1M' ? 1 : range === '3M' ? 3 : range === '1Y' ? 12 : 6;
    try {
      const newTrends = await api.getTrends(monthsCount);
      setTrends(newTrends);
    } catch (err) {
      console.error('Failed to update trend range:', err);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  // Chart data
  const riskChartData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [riskDist?.low || 0, riskDist?.medium || 0, riskDist?.high || 0, riskDist?.critical || 0],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const trendChartData = {
    labels: trends?.labels || ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Class 12 Mock Test Avg (%)',
        data: trends?.mock_test_scores || [58.4, 63.8, 69.2, 74.5, 78.1, 82.6],
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.14)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 11,
        pointBorderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#00f2fe',
      },
      {
        label: 'Burnout Velocity (%)',
        data: trends?.burnout_scores || [32.0, 48.5, 62.0, 42.0, 38.5, 34.0],
        borderColor: '#7928ca',
        backgroundColor: 'rgba(121, 40, 202, 0.14)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 11,
        pointBorderWidth: 3,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#7928ca',
      },
      {
        label: 'Attendance Rate (%)',
        data: trends?.attendance || [76.5, 75.8, 74.2, 75.1, 75.6, 76.0],
        borderColor: '#00f5a0',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#00f5a0',
      },
    ],
  };

  const deptChartData = {
    labels: (deptRisk || []).map(d => d.department?.split(' ')[0] || ''),
    datasets: [{
      label: 'Avg Risk',
      data: (deptRisk || []).map(d => (d.avg_risk * 100).toFixed(1)),
      backgroundColor: (deptRisk || []).map(d =>
        d.avg_risk > 0.5 ? 'rgba(239, 68, 68, 0.7)' :
        d.avg_risk > 0.35 ? 'rgba(249, 115, 22, 0.7)' :
        d.avg_risk > 0.25 ? 'rgba(245, 158, 11, 0.7)' :
        'rgba(16, 185, 129, 0.7)'
      ),
      borderRadius: 6,
      barThickness: 28,
    }],
  };

  const handleRunAssessment = () => {
    setRunningAssessment(true);
    setTimeout(() => {
      setRunningAssessment(false);
      setSelectedModal('at_risk');
    }, 1000);
  };

  return (
    <div className="dashboard">
      {/* Header & Quick Action Bar */}
      <ScrollReveal variant="fade-up" duration={600}>
        <div className="dashboard__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 16, paddingRight: '80px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Dashboard</h1>
            <p style={{ marginTop: 4, color: 'var(--text-secondary)' }}>Real-time overview of Class 12 student risk analytics & AI early warnings</p>
          </div>

          {/* Interactive Quick Action Buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRunAssessment}
              className="btn btn-primary"
              style={{ fontWeight: 700, boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
            >
              {runningAssessment ? '⚡ Assessing ML Models...' : '⚡ Run ML Assessment'}
            </button>

            <Link href="/dashboard/dropyear-evaluator" className="btn btn-secondary" style={{ border: '1px solid rgba(0, 242, 254, 0.3)', color: 'var(--accent-cyan)' }}>
              🎯 Drop-Year Evaluator
            </Link>
          </div>
        </div>
      </ScrollReveal>

      {/* Interactive KPI Stat Cards Grid */}
      <div className="grid-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-4)' }}>
        {[
          { label: 'Total Students', value: stats?.total_students || 0, icon: '👨‍🎓', color: 'var(--primary-400)', modal: 'total_students', variant: 'assemble-left' },
          { label: 'At Risk', value: stats?.at_risk_count || 0, icon: '⚠️', color: 'var(--risk-high)', subtitle: `${stats?.critical_count || 0} critical`, modal: 'at_risk', variant: 'fade-up' },
          { label: 'Avg Attendance', value: `${stats?.avg_attendance || 0}%`, icon: '📋', color: 'var(--accent-teal)', modal: 'avg_attendance', variant: 'scale-up' },
          { label: 'Dropout Rate', value: `${stats?.dropout_rate || 0}%`, icon: '📉', color: 'var(--risk-critical)', change: stats?.risk_trend === 'improving' ? -2.3 : stats?.risk_trend === 'worsening' ? 3.1 : 0, modal: 'dropout_rate', variant: 'scale-up' },
          { label: 'Active Interventions', value: stats?.active_interventions || 0, icon: '💡', color: 'var(--accent-violet)', modal: 'active_interventions', variant: 'fade-up' },
          { label: 'Unread Alerts', value: stats?.unread_alerts || 0, icon: '🔔', color: 'var(--accent-amber)', modal: 'unread_alerts', variant: 'assemble-right' },
        ].map((item, idx) => (
          <ScrollReveal key={item.label} variant={item.variant} delay={idx * 80} duration={550}>
            <div onClick={() => setSelectedModal(item.modal)} style={{ cursor: 'pointer' }}>
              <StatCard
                label={item.label}
                value={item.value}
                icon={item.icon}
                color={item.color}
                subtitle={item.subtitle}
                change={item.change}
                delay={idx + 1}
              />
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-6)' }} className="charts-row">
        {/* Academic Performance & Burnout Trajectory Chart */}
        <ScrollReveal variant="assemble-left" duration={650}>
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem' }}>Class 12 Mock Test Performance & Burnout Trajectory</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: 2 }}>
                  💡 Click any data point on the graph to inspect monthly student risk & burnout logs
                </p>
              </div>

              {/* Interactive Time Range Pills */}
              <div style={{ display: 'flex', gap: 6, background: 'var(--surface-glass)', padding: 4, borderRadius: 'var(--radius-md)' }}>
                {['1M', '3M', '6M', '1Y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: timeRange === range ? 'var(--primary-600)' : 'transparent',
                      color: timeRange === range ? '#fff' : 'var(--text-tertiary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 200ms ease',
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <PlotlyTrendChart
              trends={trends}
              onPointClick={(idx) => setSelectedTrendPoint(idx)}
            />

            {/* Interactive Month Inspection Pills */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Inspect Monthly Logs:</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(trends?.monthly_details || [
                  { month: 'Mar', mock_avg: '58.4%', burnout: '3.2/10', at_risk: 42 },
                  { month: 'Apr', mock_avg: '63.8%', burnout: '4.9/10', at_risk: 38 },
                  { month: 'May', mock_avg: '69.2%', burnout: '6.2/10', at_risk: 32 },
                  { month: 'Jun', mock_avg: '74.5%', burnout: '4.2/10', at_risk: 28 },
                  { month: 'Jul', mock_avg: '78.1%', burnout: '3.9/10', at_risk: 24 },
                  { month: 'Aug', mock_avg: '82.6%', burnout: '3.4/10', at_risk: 21 },
                ]).map((m, idx) => (
                  <button
                    key={m.month}
                    onClick={() => setSelectedTrendPoint(idx)}
                    className="btn btn-ghost btn-xs"
                    style={{
                      fontSize: '0.75rem', padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                      border: selectedTrendPoint === idx ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                      color: selectedTrendPoint === idx ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      background: selectedTrendPoint === idx ? 'rgba(0, 242, 254, 0.1)' : 'transparent',
                      fontWeight: 600
                    }}
                  >
                    📅 {m.month}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Risk Distribution */}
        <ScrollReveal variant="assemble-right" duration={650} delay={150}>
          <div className="glass-card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ marginBottom: 'var(--space-3)' }}>Risk Distribution</h3>
              <div style={{ height: 165, display: 'flex', justifyContent: 'center' }}>
                <Doughnut
                  data={riskChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', background: 'var(--surface-glass)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              {['low', 'medium', 'high', 'critical'].map(level => (
                <div
                  key={level}
                  onClick={() => setSelectedModal('at_risk')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
                >
                  <span className={`risk-dot risk-dot-${level}`} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'capitalize', fontWeight: 500 }}>
                    {level}: <strong style={{ color: 'var(--text-primary)' }}>{riskDist?.[level] || 0}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Interactive Drilldown Modal Drawer */}
      {selectedModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setSelectedModal(null)}>
          <div className="glass-card-elevated animate-fade-in" style={{
            width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', padding: 'var(--space-6)',
            border: '1px solid rgba(0, 242, 254, 0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.25rem', textTransform: 'capitalize' }}>
                🔍 {selectedModal.replace('_', ' ')} Details & Actions
              </h3>
              <button onClick={() => setSelectedModal(null)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem', padding: '2px 8px' }}>
                ✕
              </button>
            </div>

            {selectedModal === 'at_risk' && (
              <div>
                <p style={{ fontSize: '0.85rem', marginBottom: 16, color: 'var(--text-secondary)' }}>
                  High-priority Class 12 students requiring immediate counseling & drop-year burnout interventions:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Student 1 */}
                  <div className="glass-card" style={{ padding: 14, background: 'rgba(255, 0, 85, 0.08)', border: '1px solid rgba(255, 0, 85, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Link href="/dashboard/students/1" onClick={() => setSelectedModal(null)} style={{ textDecoration: 'none', color: '#fff' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🚨</span> Gautam Sachar <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>(CBSE12-2026-0003)</span>
                        </strong>
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Class 12-A • Science (PCM) • Post-JEE Burnout Index: <strong style={{ color: 'var(--risk-critical)' }}>8.4/10</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-critical" style={{ fontSize: '0.75rem' }}>Critical Risk (92.4%)</span>
                      <Link href="/dashboard/students/1" onClick={() => setSelectedModal(null)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                        👁️ View Profile
                      </Link>
                      <Link href="/dashboard/interventions" onClick={() => setSelectedModal(null)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        💡 Intervention
                      </Link>
                    </div>
                  </div>

                  {/* Student 2 */}
                  <div className="glass-card" style={{ padding: 14, background: 'rgba(255, 183, 3, 0.08)', border: '1px solid rgba(255, 183, 3, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Link href="/dashboard/students/2" onClick={() => setSelectedModal(null)} style={{ textDecoration: 'none', color: '#fff' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>⚠️</span> Shivansh Kadakia <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>(CBSE12-2026-0013)</span>
                        </strong>
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Class 12-B • Science (PCB) • Coaching Strain: <strong style={{ color: 'var(--risk-high)' }}>Severe (Kota Offline)</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-high" style={{ fontSize: '0.75rem' }}>High Risk (76.8%)</span>
                      <Link href="/dashboard/students/2" onClick={() => setSelectedModal(null)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                        👁️ View Profile
                      </Link>
                      <Link href="/dashboard/interventions" onClick={() => setSelectedModal(null)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        💡 Intervention
                      </Link>
                    </div>
                  </div>

                  {/* Student 3 */}
                  <div className="glass-card" style={{ padding: 14, background: 'rgba(249, 115, 22, 0.08)', border: '1px solid rgba(249, 115, 22, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <Link href="/dashboard/students/3" onClick={() => setSelectedModal(null)} style={{ textDecoration: 'none', color: '#fff' }}>
                        <strong style={{ fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>⚠️</span> Nathan Wagle <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>(CBSE12-2026-0009)</span>
                        </strong>
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Class 12-C • Commerce • Attendance: <strong style={{ color: 'var(--risk-high)' }}>36.0%</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="badge badge-high" style={{ fontSize: '0.75rem' }}>High Risk (74.2%)</span>
                      <Link href="/dashboard/students/3" onClick={() => setSelectedModal(null)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                        👁️ View Profile
                      </Link>
                      <Link href="/dashboard/interventions" onClick={() => setSelectedModal(null)} className="btn btn-primary btn-sm" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        💡 Intervention
                      </Link>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Total 130 Students At-Risk</span>
                  <Link href="/dashboard/students?risk_level=high" onClick={() => setSelectedModal(null)} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                    View Complete Filtered Directory (250 Students) →
                  </Link>
                </div>
              </div>
            )}

            {selectedModal !== 'at_risk' && (
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>
                  Live drill-down monitoring report for <strong>{selectedModal.replace('_', ' ')}</strong>.
                </p>
                <div style={{ padding: 16, background: 'var(--surface-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: 20 }}>
                  📊 Analytics summary, student risk profiles, and automated early warnings are active in real-time.
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href="/dashboard/students" onClick={() => setSelectedModal(null)} className="btn btn-primary btn-sm">
                    Open Students Directory →
                  </Link>
                  <button onClick={() => setSelectedModal(null)} className="btn btn-secondary btn-sm">
                    Close Drawer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedTrendPoint !== null && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(14px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setSelectedTrendPoint(null)}>
          <div className="glass-card-elevated animate-fade-in" style={{
            width: '100%', maxWidth: 580, padding: 'var(--space-6)',
            border: '1px solid rgba(0, 242, 254, 0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                📅 {(trends?.monthly_details?.[selectedTrendPoint] || { month: 'Jun' }).month} 2026 Monthly Academic Report
              </h3>
              <button onClick={() => setSelectedTrendPoint(null)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 12, background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Mock Test Avg</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-cyan)', marginTop: 4 }}>
                  {(trends?.monthly_details?.[selectedTrendPoint] || { mock_avg: '74.5%' }).mock_avg}
                </div>
              </div>

              <div style={{ padding: 12, background: 'rgba(121, 40, 202, 0.1)', border: '1px solid rgba(121, 40, 202, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>Burnout Index</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-violet)', marginTop: 4 }}>
                  {(trends?.monthly_details?.[selectedTrendPoint] || { burnout: '4.2/10' }).burnout}
                </div>
              </div>

              <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>At-Risk Flagged</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--risk-critical)', marginTop: 4 }}>
                  {(trends?.monthly_details?.[selectedTrendPoint] || { at_risk: 28 }).at_risk}
                </div>
              </div>
            </div>

            <div style={{ padding: 14, background: 'var(--surface-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', marginBottom: 20 }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>💡 Key Educational & Risk Insight:</strong>
              {(trends?.monthly_details?.[selectedTrendPoint] || { insight: 'Post-break recovery phase. Active counselor interventions reduced high-burnout cases.' }).insight}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link href="/dashboard/students?risk_level=high" onClick={() => setSelectedTrendPoint(null)} className="btn btn-primary btn-sm" style={{ fontWeight: 700 }}>
                🔍 Inspect {(trends?.monthly_details?.[selectedTrendPoint] || { month: 'Jun' }).month} Student Log →
              </Link>
              <button onClick={() => setSelectedTrendPoint(null)} className="btn btn-secondary btn-sm">
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }} className="charts-row">
        {/* Stream Risk */}
        <ScrollReveal variant="assemble-left" duration={1100}>
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Risk by 12th Stream</h3>
            <div style={{ height: 280 }}>
              <Bar
                data={deptChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, title: { display: true, text: 'Risk Score (%)' } },
                    y: { grid: { display: false } },
                  },
                }}
              />
            </div>
          </div>
        </ScrollReveal>

        {/* Recent Alerts */}
        <ScrollReveal variant="assemble-right" duration={1100} delay={150}>
          <div className="glass-card" style={{ padding: 'var(--space-6)' }}>
            <div className="flex-between" style={{ marginBottom: 'var(--space-4)' }}>
              <h3>Recent Alerts</h3>
              <Link href="/dashboard/alerts" className="btn btn-ghost btn-sm">View all →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentAlerts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)' }}>
                  No unread alerts 🎉
                </p>
              ) : (
                recentAlerts.map((alert) => (
                  <div key={alert.id} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--surface-glass)',
                    border: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', marginTop: 6, flexShrink: 0,
                      background: alert.severity === 'critical' ? 'var(--risk-critical)' : 'var(--risk-medium)',
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {alert.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {alert.student_name} • {new Date(alert.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span className={`badge badge-${alert.severity === 'critical' ? 'critical' : 'medium'}`} style={{ fontSize: '0.6875rem' }}>
                      {alert.severity}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <style jsx>{`
        .dashboard__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        @media (max-width: 1024px) {
          .charts-row {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .dashboard__header {
            flex-direction: column;
            gap: var(--space-3);
          }
        }
      `}</style>
    </div>
  );
}


function StatCard({ label, value, icon, color, subtitle, change, delay = 0 }) {
  return (
    <div className={`glass-card stat-card animate-fade-in stagger-${delay}`}
      style={{ '--accent': color }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{
            background: `linear-gradient(135deg, ${color}, var(--text-primary))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {typeof value === 'number' || (typeof value === 'string' && value.match(/^[0-9.]+(%?)$/)) ? (
              <AnimatedCounter value={value} suffix={String(value).includes('%') ? '%' : ''} />
            ) : (
              value
            )}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
              {subtitle}
            </div>
          )}
          {change !== undefined && change !== 0 && (
            <span className={`stat-change ${change < 0 ? 'positive' : 'negative'}`}>
              {change < 0 ? '↓' : '↑'} {Math.abs(change)}%
            </span>
          )}
        </div>
        <span style={{ fontSize: '1.75rem' }}>{icon}</span>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: 200, height: 32, marginBottom: 8 }} />
      <div className="skeleton" style={{ width: 320, height: 18 }} />
      <div className="grid-stats" style={{ marginTop: 24 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120 }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginTop: 24 }}>
        <div className="skeleton" style={{ height: 350 }} />
        <div className="skeleton" style={{ height: 350 }} />
      </div>
    </div>
  );
}
