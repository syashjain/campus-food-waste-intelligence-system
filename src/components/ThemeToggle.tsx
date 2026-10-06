import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false, className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--color-iron-edge)] hover:border-[var(--color-fog)] bg-[var(--color-obsidian)] text-[var(--color-pure-white)] text-xs font-medium transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-signal-blue)] cursor-pointer select-none active:scale-95 min-h-[36px] ${className}`}
      aria-label={`Current theme is ${theme}. Click to switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode (current: ${theme})`}
    >
      {/* Sliding indicator track */}
      <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-carbon-plate)] border border-[var(--color-iron-edge)] shadow-inner transition-colors">
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-[#70dcd3] transition-all duration-300 transform group-hover:-rotate-12 group-hover:scale-110" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-[#eab308] transition-all duration-300 transform group-hover:rotate-90 group-hover:scale-110" />
        )}
      </div>

      {!compact && (
        <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide">
          <span className="font-semibold text-[var(--color-pure-white)]">
            {isDark ? 'Dark' : 'Light'}
          </span>
          <span className="text-[10px] text-[var(--color-graphite)] hidden xl:inline">
            Mode
          </span>
        </div>
      )}

      {/* Subtle indicator dot */}
      <span 
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          isDark ? 'bg-[#70dcd3] shadow-[0_0_6px_#70dcd3]' : 'bg-[#eab308] shadow-[0_0_6px_#eab308]'
        }`} 
      />
    </button>
  );
};
