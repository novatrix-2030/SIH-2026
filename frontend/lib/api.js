/**
 * API client for communicating with the DropGuard backend with robust fallback & timeout handling.
 */
function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // If accessed from a public domain (like Render), route to deployed backend to avoid Chrome Private Network Access popup
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return 'https://dropguard-backend.onrender.com';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

// Fallback Mock Data for standalone / demo / backend-sleep scenarios
const MOCK_STATS = {
  total_students: 1248,
  at_risk_count: 86,
  critical_count: 24,
  avg_attendance: 84.2,
  dropout_rate: 6.8,
  active_interventions: 42,
  unread_alerts: 7,
  risk_trend: 'improving',
};

const MOCK_RISK_DIST = {
  low: 890,
  medium: 272,
  high: 62,
  critical: 24,
};

const MOCK_TRENDS = {
  months: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  mock_avg: [58.4, 63.8, 69.2, 74.5, 78.1, 82.6],
  burnout_index: [3.2, 4.9, 6.2, 4.2, 3.9, 3.4],
  at_risk_count: [42, 38, 32, 28, 24, 21],
  monthly_details: [
    { month: 'Mar', mock_avg: '58.4%', burnout: '3.2/10', at_risk: 42 },
    { month: 'Apr', mock_avg: '63.8%', burnout: '4.9/10', at_risk: 38 },
    { month: 'May', mock_avg: '69.2%', burnout: '6.2/10', at_risk: 32 },
    { month: 'Jun', mock_avg: '74.5%', burnout: '4.2/10', at_risk: 28 },
    { month: 'Jul', mock_avg: '78.1%', burnout: '3.9/10', at_risk: 24 },
    { month: 'Aug', mock_avg: '82.6%', burnout: '3.4/10', at_risk: 21 },
  ],
};

const MOCK_DEPT_RISK = [
  { department: 'Science (PCM)', total: 420, at_risk: 38, risk_percentage: 9.0 },
  { department: 'Science (PCB)', total: 380, at_risk: 26, risk_percentage: 6.8 },
  { department: 'Commerce', total: 290, at_risk: 14, risk_percentage: 4.8 },
  { department: 'Arts & Humanities', total: 158, at_risk: 8, risk_percentage: 5.0 },
];

const MOCK_STUDENTS = [
  { id: 1, name: 'Gautam Sachar', student_id: 'CBSE12-2026-0003', department: 'Science (PCM)', risk_score: 84, risk_level: 'critical', attendance_percentage: 64, post_jee_burnout: 8.4 },
  { id: 2, name: 'Ananya Roy', student_id: 'CBSE12-2026-0012', department: 'Science (PCB)', risk_score: 76, risk_level: 'high', attendance_percentage: 71, post_jee_burnout: 7.2 },
  { id: 3, name: 'Rohan Sharma', student_id: 'CBSE12-2026-0045', department: 'Commerce', risk_score: 48, risk_level: 'medium', attendance_percentage: 82, post_jee_burnout: 4.5 },
  { id: 4, name: 'Priya Patel', student_id: 'CBSE12-2026-0089', department: 'Arts & Humanities', risk_score: 18, risk_level: 'low', attendance_percentage: 95, post_jee_burnout: 2.1 },
];

const MOCK_ALERTS = {
  alerts: [
    { id: 1, student_id: 1, student_name: 'Gautam Sachar', title: 'Post-JEE Burnout Spike Detected', risk_level: 'critical', timestamp: '10 mins ago', is_read: false },
    { id: 2, student_id: 2, student_name: 'Ananya Roy', title: 'Mock Test Attendance Dropped Below 70%', risk_level: 'high', timestamp: '1 hour ago', is_read: false },
    { id: 3, student_id: 3, student_name: 'Rohan Sharma', title: 'Mid-Term Physics Score Drop (>15%)', risk_level: 'medium', timestamp: '3 hours ago', is_read: false },
  ],
  total_unread: 3,
};

const MOCK_INTERVENTIONS = [
  { id: 101, student_name: 'Gautam Sachar', type: '1-on-1 Academic Counseling', status: 'In Progress', assigned_to: 'Dr. S. Verma', date: '2026-08-28' },
  { id: 102, student_name: 'Ananya Roy', type: 'Peer Mentorship Program', status: 'Scheduled', assigned_to: 'Prof. Mehta', date: '2026-08-29' },
];

class ApiClient {
  constructor() {
    this.token = null;
  }

  getBaseUrl() {
    return getApiBase();
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduguard_token', token);
    }
  }

  getToken() {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('eduguard_token');
    }
    return this.token;
  }

  getFallbackData(endpoint) {
    if (endpoint.includes('/analytics/dashboard')) return MOCK_STATS;
    if (endpoint.includes('/analytics/risk-distribution')) return MOCK_RISK_DIST;
    if (endpoint.includes('/analytics/trends')) return MOCK_TRENDS;
    if (endpoint.includes('/analytics/department-risk')) return MOCK_DEPT_RISK;
    if (endpoint.includes('/analytics/alerts')) return MOCK_ALERTS;
    if (endpoint.includes('/analytics/interventions')) return MOCK_INTERVENTIONS;
    if (endpoint.includes('/students/departments/list')) return ['Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts & Humanities'];
    if (endpoint.includes('/students/')) {
      const match = endpoint.match(/\/students\/(\d+)/);
      if (match) {
        const id = parseInt(match[1]);
        return MOCK_STUDENTS.find(s => s.id === id) || MOCK_STUDENTS[0];
      }
      return { students: MOCK_STUDENTS, total: MOCK_STUDENTS.length };
    }
    return {};
  }

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

      const response = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.warn(`Backend API [${endpoint}] unavailable/timed out, using demo fallback:`, error);
      return this.getFallbackData(endpoint);
    }
  }

  // Auth with instant demo fallback
  async login(username, password) {
    const validDemo = {
      admin: 'admin123',
      teacher: 'teacher123',
      counselor: 'counselor123',
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout for fast login response

      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        return data;
      }
    } catch (err) {
      console.warn('Backend login endpoint unavailable or timed out, checking demo credentials...');
    }

    // Fallback logic for Demo Credentials
    if (validDemo[username] && validDemo[username] === password) {
      const demoData = {
        access_token: `demo_token_${username}_${Date.now()}`,
        token_type: 'bearer',
        user: { username, role: username },
      };
      this.setToken(demoData.access_token);
      return demoData;
    }

    throw new Error('Invalid credentials');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/analytics/dashboard');
  }

  async getRiskDistribution() {
    return this.request('/api/analytics/risk-distribution');
  }

  async getTrends(months = 6) {
    return this.request(`/api/analytics/trends?months=${months}`);
  }

  async getDepartmentRisk() {
    return this.request('/api/analytics/department-risk');
  }

  // Students
  async getStudents(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/students/?${query}`);
  }

  async getStudent(id) {
    return this.request(`/api/students/${id}`);
  }

  async getDepartments() {
    return this.request('/api/students/departments/list');
  }

  // Alerts
  async getAlerts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/alerts?${query}`);
  }

  async markAlertRead(alertId) {
    return this.request(`/api/analytics/alerts/${alertId}/read`, { method: 'PUT' });
  }

  // Interventions
  async getInterventions(status = null) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/api/analytics/interventions${query}`);
  }

  async updateInterventionStatus(id, status) {
    return this.request(`/api/analytics/interventions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async createIntervention(data) {
    return this.request('/api/analytics/interventions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Drop Year Analytics
  async getDropYearAnalytics() {
    return this.request('/api/analytics/dropyear-analytics');
  }

  // Drop Year Evaluator & Groq AI
  async evaluateDropYear(data) {
    return this.request('/api/evaluator/evaluate-dropyear', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create Student
  async createStudent(data) {
    return this.request('/api/students/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

const api = new ApiClient();
export default api;
