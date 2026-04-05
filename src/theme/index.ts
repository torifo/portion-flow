import type { ThemeName } from '../types';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  vars: Record<string, string>;
  fontSize: string;
  borderRadius: string;
}

export const themes: Record<ThemeName, ThemeDefinition> = {
  standard: {
    name: 'standard',
    label: 'スタンダード',
    vars: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f5f5f5',
      '--bg-card': '#ffffff',
      '--text-primary': '#1a1a1a',
      '--text-secondary': '#555555',
      '--accent': '#4f6ef7',
      '--accent-hover': '#3a57d8',
      '--border': '#e0e0e0',
      '--danger': '#e53935',
      '--success': '#43a047',
      '--shadow': '0 2px 8px rgba(0,0,0,0.1)',
    },
    fontSize: '16px',
    borderRadius: '8px',
  },
  senior: {
    name: 'senior',
    label: 'シニア',
    vars: {
      '--bg-primary': '#000000',
      '--bg-secondary': '#111111',
      '--bg-card': '#1a1a1a',
      '--text-primary': '#ffff00',
      '--text-secondary': '#ffdd00',
      '--accent': '#ffff00',
      '--accent-hover': '#ffee00',
      '--border': '#ffff00',
      '--danger': '#ff4444',
      '--success': '#00ff88',
      '--shadow': '0 2px 8px rgba(255,255,0,0.3)',
    },
    fontSize: '24px',
    borderRadius: '12px',
  },
  children: {
    name: 'children',
    label: 'こども',
    vars: {
      '--bg-primary': '#fff9e6',
      '--bg-secondary': '#ffeeba',
      '--bg-card': '#ffffff',
      '--text-primary': '#333333',
      '--text-secondary': '#666666',
      '--accent': '#ff6b9d',
      '--accent-hover': '#e0578a',
      '--border': '#ffc0cb',
      '--danger': '#ff4757',
      '--success': '#2ed573',
      '--shadow': '0 4px 12px rgba(255,107,157,0.2)',
    },
    fontSize: '18px',
    borderRadius: '20px',
  },
};

export function applyTheme(theme: ThemeName): void {
  const def = themes[theme];
  const root = document.documentElement;
  Object.entries(def.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  root.style.setProperty('--font-size-base', def.fontSize);
  root.style.setProperty('--border-radius', def.borderRadius);
  root.setAttribute('data-theme', theme);
}
