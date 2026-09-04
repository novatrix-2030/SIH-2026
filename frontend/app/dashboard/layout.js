'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // Dispatch window resize events continuously during transition so Plotly & Chart.js graphs stretch horizontally in real-time
    const interval = setInterval(() => {
      window.dispatchEvent(new Event('resize'));
    }, 25);

    const timer = setTimeout(() => {
      clearInterval(interval);
      window.dispatchEvent(new Event('resize'));
    }, 350);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [collapsed]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main style={{
        flex: 1,
        marginLeft: collapsed ? '72px' : '270px',
        padding: 'var(--space-7)',
        position: 'relative',
        zIndex: 1,
        transition: 'margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1), width 300ms cubic-bezier(0.4, 0, 0.2, 1), padding 300ms ease',
        minWidth: 0,
        width: collapsed ? 'calc(100% - 72px)' : 'calc(100% - 270px)',
      }}>
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: var(--space-4) !important;
            padding-top: 70px !important;
          }
        }
      `}</style>
    </div>
  );
}
