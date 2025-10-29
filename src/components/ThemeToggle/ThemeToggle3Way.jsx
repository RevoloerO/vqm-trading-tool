import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle3Way.css';

function ThemeToggle3Way() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', label: 'Bull', icon: '🐂', color: 'emerald' },
    { id: 'consolidation', label: 'Range', icon: '⚖️', color: 'gold' },
    { id: 'dark', label: 'Bear', icon: '🐻', color: 'maroon' }
  ];

  return (
    <div className="theme-toggle-3way">
      <div className="theme-toggle-label">Market Mode</div>
      <div className="theme-options">
        {themes.map((t) => (
          <button
            key={t.id}
            className={`theme-option ${theme === t.id ? 'active' : ''} theme-${t.color}`}
            onClick={() => setTheme(t.id)}
            aria-label={`Switch to ${t.label} theme`}
            title={`${t.label} Market Theme`}
          >
            <span className="theme-option-icon">{t.icon}</span>
            <span className="theme-option-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeToggle3Way;
