'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../../lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('risk_score');
  const pageSize = 15;

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    loadStudents();
  }, [page, search, riskFilter, deptFilter, sortBy]);

  async function loadStudents() {
    setLoading(true);
    try {
      const params = { page, page_size: pageSize, sort_by: sortBy, sort_order: 'desc' };
      if (search) params.search = search;
      if (riskFilter) params.risk_level = riskFilter;
      if (deptFilter) params.department = deptFilter;

      const data = await api.getStudents(params);
      setStudents(data.students || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }

  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Science (PCM)',
    section: 'A',
    class_12_percentage: 78,
    jee_percentile: 82,
    coaching_type: 'Online Batch (PW/Unacademy)',
    coaching_financial_strain: 'low',
    post_jee_burnout_index: 4.0,
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudent.first_name || !newStudent.last_name) return;
    setSubmitting(true);
    try {
      await api.createStudent(newStudent);
      setShowAddModal(false);
      setNewStudent({
        first_name: '', last_name: '', email: '', phone: '',
        department: 'Science (PCM)', section: 'A',
        class_12_percentage: 78, jee_percentile: 82,
        coaching_type: 'Online Batch (PW/Unacademy)', coaching_financial_strain: 'low', post_jee_burnout_index: 4.0
      });
      fetchStudents();
    } catch (err) {
      console.error('Failed to create student:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const getRiskColor = (level) => {
    const colors = { low: 'var(--risk-low)', medium: 'var(--risk-medium)', high: 'var(--risk-high)', critical: 'var(--risk-critical)' };
    return colors[level] || 'var(--text-tertiary)';
  };

  return (
    <div className="students-page animate-fade-in">
      <div className="flex-between" style={{ alignItems: 'center' }}>
        <div>
          <h1>Students</h1>
          <p style={{ marginTop: 4 }}>{total} Class 12 students enrolled</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{ fontWeight: 700, boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}
        >
          ➕ Add New Student
        </button>
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)',
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍  Search by name or enrollment no..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: 'var(--space-4)' }}
          />
        </div>

        <select
          className="input-field"
          value={riskFilter}
          onChange={e => { setRiskFilter(e.target.value); setPage(1); }}
          style={{ width: 160, cursor: 'pointer' }}
        >
          <option value="">All Risk Levels</option>
          <option value="critical">🔴 Critical</option>
          <option value="high">🟠 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <select
          className="input-field"
          value={deptFilter}
          onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
          style={{ width: 220, cursor: 'pointer' }}
        >
          <option value="">All 12th Streams</option>
          {departments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          className="input-field"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{ width: 160, cursor: 'pointer' }}
        >
          <option value="risk_score">Sort: Risk ↓</option>
          <option value="attendance">Sort: Attendance ↓</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="glass-card" style={{ marginTop: 'var(--space-5)', overflow: 'auto' }}>
        {loading ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '100%', height: 400 }} />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Enrollment</th>
                <th>Drop Years / 12th %</th>
                <th>JEE %ile / Tier</th>
                <th>12th Stream</th>
                <th>Attendance</th>
                <th>Avg Grade</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id} style={{ animationDelay: `${idx * 0.03}s` }}>
                  <td>
                    <Link href={`/dashboard/students/${student.id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                      color: 'var(--text-primary)', fontWeight: 500,
                    }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 'var(--radius-full)',
                        background: `linear-gradient(135deg, ${getRiskColor(student.risk_level)}, var(--primary-500))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0,
                      }}>
                        {student.first_name?.[0]}{student.last_name?.[0]}
                      </div>
                      <div>
                        <div>{student.full_name || `${student.first_name} ${student.last_name}`}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{student.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{student.enrollment_no}</td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: student.drop_years_count > 0 ? 'var(--risk-high)' : 'var(--text-secondary)' }}>
                      {student.drop_years_count || 0} Drop Yr(s)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>12th: {student.class_12_percentage?.toFixed(1) || 75}%</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      {student.jee_percentile ? `${student.jee_percentile}%ile` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{student.current_college_tier || 'Tier-3'}</div>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--primary-300)' }}>{student.department}</td>
                  <td style={{ textAlign: 'center' }}>{student.semester}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 60, height: 6, borderRadius: 3, background: 'var(--surface-3)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${student.attendance_pct || 0}%`,
                          height: '100%',
                          borderRadius: 3,
                          background: student.attendance_pct > 75 ? 'var(--risk-low)' :
                                      student.attendance_pct > 50 ? 'var(--risk-medium)' : 'var(--risk-critical)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', minWidth: 38 }}>{student.attendance_pct?.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {student.avg_grade?.toFixed(1) || '—'}
                  </td>
                  <td>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      color: getRiskColor(student.risk_level), fontWeight: 600,
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%',
                        border: `3px solid ${getRiskColor(student.risk_level)}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700,
                        background: `${getRiskColor(student.risk_level)}15`,
                      }}>
                        {student.risk_score !== null ? `${(student.risk_score * 100).toFixed(0)}` : '—'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${student.risk_level || 'low'}`}>
                      {student.risk_level || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 500,
                      color: student.status === 'dropped_out' ? 'var(--risk-critical)' :
                             student.status === 'at_risk' ? 'var(--risk-high)' :
                             student.status === 'graduated' ? 'var(--risk-low)' : 'var(--text-secondary)',
                      textTransform: 'capitalize',
                    }}>
                      {student.status?.replace('_', ' ') || 'enrolled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: 'var(--space-3)', marginTop: 'var(--space-5)',
        }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Previous
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Add Student Glass Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }} onClick={() => setShowAddModal(false)}>
          <div className="glass-card-elevated animate-fade-in" style={{
            width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 'var(--space-6)',
            border: '1px solid rgba(0, 242, 254, 0.3)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>➕ Add New Class 12 Student</h3>
              <button onClick={() => setShowAddModal(false)} className="btn btn-ghost btn-sm" style={{ fontSize: '1.2rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>First Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={newStudent.first_name}
                    onChange={e => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    placeholder="e.g. Rohan"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Last Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    required
                    value={newStudent.last_name}
                    onChange={e => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    placeholder="e.g. Sharma"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Email</label>
                  <input
                    type="email"
                    className="input-field"
                    value={newStudent.email}
                    onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                    placeholder="rohan@cbse.edu.in"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Phone</label>
                  <input
                    type="text"
                    className="input-field"
                    value={newStudent.phone}
                    onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>12th Stream</label>
                  <select
                    className="input-field"
                    value={newStudent.department}
                    onChange={e => setNewStudent({ ...newStudent, department: e.target.value })}
                  >
                    <option value="Science (PCM)">Science (PCM)</option>
                    <option value="Science (PCB)">Science (PCB)</option>
                    <option value="Commerce">Commerce</option>
                    <option value="Humanities / Arts">Humanities / Arts</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Section</label>
                  <select
                    className="input-field"
                    value={newStudent.section}
                    onChange={e => setNewStudent({ ...newStudent, section: e.target.value })}
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                    <option value="D">Section D</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>12th Board %</label>
                  <input
                    type="number"
                    className="input-field"
                    min="35"
                    max="100"
                    value={newStudent.class_12_percentage}
                    onChange={e => setNewStudent({ ...newStudent, class_12_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>JEE Main %ile</label>
                  <input
                    type="number"
                    className="input-field"
                    min="0"
                    max="100"
                    step="0.1"
                    value={newStudent.jee_percentile}
                    onChange={e => setNewStudent({ ...newStudent, jee_percentile: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Coaching Strain</label>
                  <select
                    className="input-field"
                    value={newStudent.coaching_financial_strain}
                    onChange={e => setNewStudent({ ...newStudent, coaching_financial_strain: e.target.value })}
                  >
                    <option value="low">Low (No Strain)</option>
                    <option value="medium">Medium Strain</option>
                    <option value="severe">Severe Strain</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>
                    Burnout Index: {newStudent.post_jee_burnout_index}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={newStudent.post_jee_burnout_index}
                    onChange={e => setNewStudent({ ...newStudent, post_jee_burnout_index: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--risk-critical)', marginTop: 8 }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ fontWeight: 700 }}>
                  {submitting ? 'Saving & Calculating Risk...' : '💾 Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
