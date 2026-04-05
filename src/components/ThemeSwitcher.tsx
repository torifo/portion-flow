import type { ThemeName } from '../types';
import { themes } from '../theme';

interface Props {
  current: ThemeName;
  onChange: (theme: ThemeName) => void;
}

const themeOrder: ThemeName[] = ['standard', 'senior', 'children'];

export function ThemeSwitcher({ current, onChange }: Props) {
  return (
    <div className="theme-switcher" role="group" aria-label="テーマ切り替え">
      {themeOrder.map((t) => {
        const def = themes[t];
        return (
          <button
            key={t}
            className={`theme-btn${current === t ? ' active' : ''}`}
            onClick={() => onChange(t)}
            aria-pressed={current === t}
            title={def.label}
          >
            <span className="theme-icon">{def.icon}</span>
            <span className="theme-label">{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}
