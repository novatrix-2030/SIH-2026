'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeToggle({ floating = true, className = '' }) {
  const { theme, toggleTheme, mounted } = useTheme();

  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${floating ? 'theme-toggle-btn--floating' : ''} ${className}`}
      aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Theme`}
    >
      <div className="theme-toggle-track">
        <span className={`theme-toggle-icon theme-toggle-sun ${isLight ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        </span>
        <span className={`theme-toggle-icon theme-toggle-moon ${!isLight ? 'active' : ''}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        </span>
        <div className={`theme-toggle-thumb ${isLight ? 'theme-toggle-thumb--light' : ''}`} />
      </div>

      <style jsx>{`
        .theme-toggle-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          outline: none;
          z-index: 1000;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .theme-toggle-btn:hover {
          transform: scale(1.08);
        }

        .theme-toggle-btn:active {
          transform: scale(0.95);
        }

        .theme-toggle-btn--floating {
          position: fixed;
          top: 14px;
          right: 16px;
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .theme-toggle-btn--floating {
            top: 12px;
            right: 12px;
          }
        }

        .theme-toggle-track {
          position: relative;
          width: 58px;
          height: 30px;
          border-radius: 999px;
          background: var(--surface-2);
          border: 1px solid var(--border-default);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 6px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .theme-toggle-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          color: var(--text-tertiary);
          transition: color 0.3s ease, transform 0.3s ease;
          width: 20px;
          height: 20px;
        }

        .theme-toggle-icon.active {
          color: var(--accent-cyan);
        }

        .theme-toggle-sun.active {
          color: #f59e0b;
        }

        .theme-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 4px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-500), var(--accent-violet));
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.5);
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.35s ease;
          z-index: 1;
        }

        .theme-toggle-thumb--light {
          transform: translateX(26px);
          background: linear-gradient(135deg, #f59e0b, #f97316);
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);
        }
      `}</style>
    </button>
  );
}
