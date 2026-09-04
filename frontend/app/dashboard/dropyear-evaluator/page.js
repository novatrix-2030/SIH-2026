'use client';

import { useState } from 'react';
import api from '../../../lib/api';

export default function DropYearEvaluatorPage() {
  const [formData, setFormData] = useState({
    physics_pct: 78,
    chemistry_pct: 82,
    maths_pct: 74,
    overall_12th_pct: 80,
    jee_percentile: 85,
    coaching_type: 'Online Batch (PW/Unacademy)',
    coaching_financial_strain: 'low',
    burnout_index: 4.0,
  });

  const [showBurnoutInfo, setShowBurnoutInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.evaluateDropYear(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('Failed to evaluate drop-year. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProbColor = (prob) => {
    if (prob >= 75) return '#00f5a0';
    if (prob >= 55) return '#00f2fe';
    if (prob >= 40) return '#ffb703';
    return '#ff0055';
  };

  return (
    <div className="evaluator-page animate-fade-in" style={{ paddingBottom: 'var(--space-10)' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Class 12 Drop-Year Evaluator</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
          Assess your 12th PCM foundation & initial JEE rank to predict your IIT/NIT drop-year success probability.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }} className="evaluator-grid">
        {/* Input Form Card */}
        <div className="glass-card-elevated" style={{ padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📝</span> Student Academic Profile
          </h3>

          <form onSubmit={handleEvaluate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Subject Marks Sliders */}
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                <span>Physics Marks (12th Board %)</span>
                <strong style={{ color: 'var(--accent-cyan)' }}>{formData.physics_pct}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.physics_pct}
                onChange={e => handleChange('physics_pct', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', margin: '8px 0' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                <span>Chemistry Marks (12th Board %)</span>
                <strong style={{ color: 'var(--accent-teal)' }}>{formData.chemistry_pct}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.chemistry_pct}
                onChange={e => handleChange('chemistry_pct', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-teal)', margin: '8px 0' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                <span>Mathematics Marks (12th Board %)</span>
                <strong style={{ color: 'var(--primary-400)' }}>{formData.maths_pct}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.maths_pct}
                onChange={e => handleChange('maths_pct', parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary-400)', margin: '8px 0' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                  Overall 12th Board %
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.overall_12th_pct}
                  onChange={e => handleChange('overall_12th_pct', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                  Current JEE Percentile (%ile)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.jee_percentile}
                  onChange={e => handleChange('jee_percentile', parseFloat(e.target.value) || 0)}
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                Coaching Mode
              </label>
              <select
                className="input-field"
                value={formData.coaching_type}
                onChange={e => handleChange('coaching_type', e.target.value)}
              >
                <option value="Kota Offline Coaching">Kota Offline Coaching</option>
                <option value="Delhi Offline Coaching">Delhi Offline Coaching</option>
                <option value="Online Batch (PW/Unacademy)">Online Batch (PW/Unacademy)</option>
                <option value="Self-Study">Self-Study</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 6 }}>
                  Coaching Debt / Strain
                </label>
                <select
                  className="input-field"
                  value={formData.coaching_financial_strain}
                  onChange={e => handleChange('coaching_financial_strain', e.target.value)}
                >
                  <option value="low">Low (No Debt)</option>
                  <option value="medium">Medium Strain</option>
                  <option value="severe">Severe (Heavy Loan)</option>
                </select>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    Burnout Score: <strong style={{ color: formData.burnout_index >= 7 ? 'var(--risk-critical)' : formData.burnout_index >= 4 ? 'var(--risk-medium)' : 'var(--risk-low)' }}>{formData.burnout_index}/10</strong>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBurnoutInfo(!showBurnoutInfo)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {showBurnoutInfo ? 'Hide Guide' : '💡 What is Burnout Score?'}
                  </button>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={formData.burnout_index}
                  onChange={e => handleChange('burnout_index', parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--risk-critical)', margin: '4px 0' }}
                />

                {showBurnoutInfo && (
                  <div style={{ marginTop: 8, padding: 10, background: 'var(--surface-2)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: 4 }}>💡 What is the Burnout Score?</strong>
                    Measures mental fatigue & study exhaustion after Class 12 board and entrance exams (0.0 to 10.0 scale):
                    <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>🟢 <strong>0.0–3.0 (Low)</strong>: High study stamina, fresh energy, high drop-year success chance.</div>
                      <div>🟡 <strong>3.5–6.5 (Moderate)</strong>: Study fatigue present; requires structured breaks & pacing.</div>
                      <div>🔴 <strong>7.0–10.0 (Severe)</strong>: Heavy post-exam exhaustion. Forcing a drop year under severe burnout carries high dropout risk.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ marginTop: 'var(--space-3)', width: '100%', fontWeight: 700 }}
            >
              {loading ? '⚡ Running AI Drop Evaluation...' : '⚡ Predict Drop-Year IIT Success'}
            </button>

            {error && (
              <div style={{ padding: 12, background: 'rgba(255, 0, 85, 0.1)', border: '1px solid rgba(255, 0, 85, 0.25)', color: 'var(--risk-critical)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {result ? (
            <>
              {/* Score & Verdict Card */}
              <div className="glass-card-elevated animate-fade-in" style={{ padding: 'var(--space-6)', borderTop: `4px solid ${getProbColor(result.success_probability)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                      IIT / NIT Drop Success Score
                    </span>
                    <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', color: getProbColor(result.success_probability) }}>
                      {result.success_probability}%
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      background: `${getProbColor(result.success_probability)}18`,
                      border: `1px solid ${getProbColor(result.success_probability)}40`,
                      color: getProbColor(result.success_probability),
                      fontSize: '0.85rem', fontWeight: 700, display: 'inline-block'
                    }}>
                      {result.recommendation}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Projected Institution Outcome
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
                    🎓 {result.projected_institution}
                  </div>
                </div>
              </div>

              {/* AI Guidance Report */}
              <div className="glass-card animate-fade-in" style={{ padding: 'var(--space-6)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🧠</span> AI Counselor Guidance Report
                  </h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-cyan)', background: 'rgba(0, 242, 254, 0.1)', padding: '3px 8px', borderRadius: 'var(--radius-sm)' }}>
                    AI Counselor Engine
                  </span>
                </div>

                <div style={{ fontSize: '0.9rem', lineHeight: '1.7', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {result.ai_guidance?.content}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ padding: 'var(--space-10)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: 'var(--space-4)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                🎯
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Ready for Evaluation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', maxWidth: 360 }}>
                Adjust your Class 12 board marks and JEE score on the left, then click <strong>Predict Drop-Year IIT Success</strong> to get AI Counselor guidance.
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .evaluator-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
