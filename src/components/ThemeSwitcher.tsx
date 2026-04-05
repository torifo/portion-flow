import type { ThemeName } from '../types';
import { themes } from '../theme';

interface Props {
  current: ThemeName;
  onChange: (theme: ThemeName) => void;
}

const themeOrder: ThemeName[] = ['standard', 'senior', 'children'];

export function ThemeSwitcher({ current, onChange }: Props) {
  return (
    <div className="theme-switcher">
      {themeOrder.map((t) => (
        <button
          key={t}
          className={`theme-btn ${current === t ? 'active' : ''}`}
          onClick={() => onChange(t)}
          aria-pressed={current === t}
        >
          {t === 'standard' && '🎨 '}
          {t === 'senior' && '👓 '}
          {t === 'children' && '🌈 '}
          {themes[t].label}
        </button>
      ))}
    </div>
  );
}
