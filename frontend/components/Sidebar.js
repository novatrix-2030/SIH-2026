'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

// SVG icon components (inline to avoid import issues)
const icons = {
  dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  students: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  analytics: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>,
  interventions: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  alerts: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  shield: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  chevronLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>,
  chevronRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  evaluator: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  github: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
  parent: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { href: '/dashboard/students', label: 'Students', icon: 'students' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: 'analytics' },
  { href: '/dashboard/dropyear-evaluator', label: 'Drop-Year Evaluator', icon: 'evaluator' },
  { href: '/dashboard/interventions', label: 'Interventions', icon: 'interventions' },
  { href: '/dashboard/alerts', label: 'Alerts', icon: 'alerts' },
  { href: '/dashboard/parent-portal', label: 'Parent Portal', icon: 'parent' },
];

export default function Sidebar({ collapsed: externalCollapsed, onToggle }) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const toggleCollapsed = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {icons.menu}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'sidebar--mobile-open' : ''}`}>
        {/* Logo / Brand */}
        <Link href="/dashboard" className="sidebar__brand-link">
          <div className="sidebar__brand">
            <div className="sidebar__logo">
              {icons.shield}
            </div>
            {!isCollapsed && (
              <div className="sidebar__brand-text">
                <span className="sidebar__brand-name">DropGuard</span>
                <span className="sidebar__brand-tagline">SIH 2026</span>
              </div>
            )}
          </div>
        </Link>

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? item.label : undefined}
              >
                <span className="sidebar__link-icon">{icons[item.icon]}</span>
                {!isCollapsed && <span className="sidebar__link-label">{item.label}</span>}
              </Link>
            );
          })}

          {/* GitHub Repo link */}
          <a
            href="https://github.com/novatrix-2030/SIH-2026"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar__link"
            title={isCollapsed ? 'GitHub Repository' : undefined}
            style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}
          >
            <span className="sidebar__link-icon">{icons.github}</span>
            {!isCollapsed && (
              <span className="sidebar__link-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>GitHub Repo</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>↗</span>
              </span>
            )}
          </a>
        </nav>

        {/* Footer controls: Theme Toggle & Collapse */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
          {!isCollapsed && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Theme</span>}
          <ThemeToggle floating={false} />
        </div>

        {/* Collapse toggle */}
        <button
          className="sidebar__toggle"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? icons.chevronRight : icons.chevronLeft}
        </button>

        <style jsx>{`
          .mobile-menu-btn {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            z-index: 1001;
            background: #0f1128;
            border: 1px solid var(--border-default);
            color: var(--text-primary);
            padding: 8px;
            border-radius: var(--radius-md);
            cursor: pointer;
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 270px;
            background: rgba(11, 13, 31, 0.92);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            z-index: 999;
            transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
            box-shadow: 6px 0 30px rgba(0, 0, 0, 0.5);
            user-select: none;
          }

          .sidebar--collapsed {
            width: var(--sidebar-collapsed);
          }

          .sidebar__brand-link {
            display: block;
            text-decoration: none;
            cursor: pointer;
            user-select: none;
          }

          .sidebar__brand {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 24px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            min-height: 84px;
            transition: background var(--transition-fast);
          }

          .sidebar__brand-link:hover .sidebar__brand {
            background: rgba(255, 255, 255, 0.04);
          }

          .sidebar__logo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            min-width: 44px;
            background: linear-gradient(135deg, var(--accent-violet), var(--accent-cyan));
            border-radius: var(--radius-md);
            color: white;
            box-shadow: 0 4px 16px rgba(0, 242, 254, 0.3);
            transition: all var(--transition-fast);
          }

          .sidebar__brand-link:hover .sidebar__logo {
            transform: scale(1.08);
            box-shadow: 0 6px 22px rgba(0, 242, 254, 0.45);
          }

          .sidebar__brand-text {
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .sidebar__brand-name {
            font-family: var(--font-display);
            font-size: 1.35rem;
            font-weight: 800;
            background: linear-gradient(135deg, #ffffff, var(--accent-cyan));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            white-space: nowrap;
          }

          .sidebar__brand-tagline {
            font-size: 0.6875rem;
            color: var(--text-tertiary);
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            white-space: nowrap;
          }

          .sidebar__nav {
            flex: 1;
            padding: 20px 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-y: auto;
          }

          .sidebar__link {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            gap: 14px;
            padding: 12px 16px;
            border-radius: var(--radius-lg);
            color: var(--text-secondary);
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 220ms cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            text-decoration: none;
            white-space: nowrap;
            user-select: none;
            border: 1px solid transparent;
          }

          .sidebar__link:hover {
            color: #ffffff;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(0, 242, 254, 0.08));
            border-color: rgba(0, 242, 254, 0.3);
            transform: translateX(4px) scale(1.02);
            box-shadow: 0 4px 20px rgba(0, 242, 254, 0.15);
          }

          .sidebar__link--active {
            color: #ffffff;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(0, 242, 254, 0.18));
            border: 1px solid rgba(0, 242, 254, 0.45);
            box-shadow: 0 4px 24px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          }

          .sidebar__link--active:hover {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(0, 242, 254, 0.25));
            box-shadow: 0 6px 28px rgba(0, 242, 254, 0.3);
          }

          /* Light Theme Overrides for Sidebar */
          :global([data-theme="light"]) .sidebar {
            background: rgba(255, 255, 255, 0.95);
            border-right: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.04);
          }

          :global([data-theme="light"]) .sidebar__brand {
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          }

          :global([data-theme="light"]) .sidebar__brand-name {
            background: linear-gradient(135deg, #1e1b4b, #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          :global([data-theme="light"]) .sidebar__link {
            color: #475569;
          }

          :global([data-theme="light"]) .sidebar__link:hover {
            color: #0f172a;
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.25);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.1);
          }

          :global([data-theme="light"]) .sidebar__link--active {
            color: #4338ca;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(6, 182, 212, 0.12));
            border: 1px solid rgba(99, 102, 241, 0.35);
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
            font-weight: 600;
          }

          :global([data-theme="light"]) .sidebar__toggle {
            background: #f1f5f9;
            border-color: rgba(0, 0, 0, 0.1);
            color: #475569;
          }

          .sidebar__link-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            min-width: 22px;
            flex-shrink: 0;
          }

          .sidebar__link-label {
            flex: 1;
            text-align: left;
          }

          .sidebar__toggle {
            margin: var(--space-3);
            padding: var(--space-2);
            background: var(--surface-2);
            border: 1px solid var(--border-subtle);
            border-radius: var(--radius-md);
            color: var(--text-tertiary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--transition-fast);
          }

          .sidebar__toggle:hover {
            color: var(--text-primary);
            border-color: var(--border-default);
          }

          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: flex;
            }

            .sidebar-overlay {
              display: block;
            }

            .sidebar {
              transform: translateX(-100%);
              width: var(--sidebar-width) !important;
            }

            .sidebar--mobile-open {
              transform: translateX(0);
            }

            .sidebar__toggle {
              display: none;
            }
          }
        `}</style>
      </aside>
    </>
  );
}
