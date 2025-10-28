import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="theme-toggle-container">
      <button
        className={`theme-toggle ${isDark ? 'dark' : 'light'}`}
        onClick={toggleTheme}
        aria-label="Toggle theme"
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        <div className="toggle-track">
          <div className="toggle-icons">
            <span className="icon-bull" title="Bull Market (Light)">🐂</span>
            <span className="icon-bear" title="Bear Market (Dark)">🐻</span>
          </div>
          <div className="toggle-slider">
            <span className="slider-icon">
              {isDark ? '🐻' : '🐂'}
            </span>
          </div>
        </div>
        <div className="toggle-label">
          <span className="label-text">
            {isDark ? 'Bear' : 'Bull'} Mode
          </span>
        </div>
      </button>
    </div>
  );
}

export default ThemeToggle;
