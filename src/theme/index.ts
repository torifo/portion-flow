import type { ThemeName } from '../types';

export interface ThemeDefinition {
  name: ThemeName;
  label: string;
  icon: string;
  vars: Record<string, string>;
}

export const themes: Record<ThemeName, ThemeDefinition> = {
  standard: {
    name: 'standard',
    label: 'スタンダード',
    icon: '🎨',
    vars: {
      '--bg-app':      '#f1f5f9',
      '--bg-card':     '#ffffff',
      '--bg-header':   '#ffffff',
      '--bg-input':    '#f8fafc',
      '--bg-hover':    '#f1f5f9',
      '--text-1':      '#0f172a',
      '--text-2':      '#475569',
      '--text-3':      '#94a3b8',
      '--accent':      '#6366f1',
      '--accent-dim':  '#eef2ff',
      '--accent-text': '#4338ca',
      '--border':      '#e2e8f0',
      '--border-focus':'#6366f1',
      '--danger':      '#ef4444',
      '--danger-dim':  '#fef2f2',
      '--success':     '#22c55e',
      '--success-dim': '#f0fdf4',
      '--shadow-sm':   '0 1px 3px rgba(15,23,42,.06)',
      '--shadow':      '0 4px 16px rgba(15,23,42,.08)',
      '--radius-card': '14px',
      '--radius-btn':  '8px',
      '--font-size':   '14px',
      '--font-size-lg':'16px',
    },
  },
  senior: {
    name: 'senior',
    label: 'シニア',
    icon: '👓',
    vars: {
      '--bg-app':      '#0a0a0a',
      '--bg-card':     '#1c1c1c',
      '--bg-header':   '#111111',
      '--bg-input':    '#2a2a2a',
      '--bg-hover':    '#2a2a2a',
      '--text-1':      '#fef08a',
      '--text-2':      '#fde047',
      '--text-3':      '#ca8a04',
      '--accent':      '#facc15',
      '--accent-dim':  '#1c1a00',
      '--accent-text': '#fef08a',
      '--border':      '#3d3d00',
      '--border-focus':'#facc15',
      '--danger':      '#f87171',
      '--danger-dim':  '#2d0000',
      '--success':     '#4ade80',
      '--success-dim': '#002d0a',
      '--shadow-sm':   '0 1px 3px rgba(0,0,0,.4)',
      '--shadow':      '0 4px 16px rgba(0,0,0,.5)',
      '--radius-card': '12px',
      '--radius-btn':  '8px',
      '--font-size':   '20px',
      '--font-size-lg':'26px',
    },
  },
  children: {
    name: 'children',
    label: 'こども',
    icon: '🌈',
    vars: {
      '--bg-app':      '#fdf4ff',
      '--bg-card':     '#ffffff',
      '--bg-header':   '#fce7f3',
      '--bg-input':    '#fdf4ff',
      '--bg-hover':    '#fce7f3',
      '--text-1':      '#581c87',
      '--text-2':      '#7c3aed',
      '--text-3':      '#a78bfa',
      '--accent':      '#ec4899',
      '--accent-dim':  '#fdf4ff',
      '--accent-text': '#be185d',
      '--border':      '#f0abfc',
      '--border-focus':'#ec4899',
      '--danger':      '#f43f5e',
      '--danger-dim':  '#fff1f2',
      '--success':     '#10b981',
      '--success-dim': '#ecfdf5',
      '--shadow-sm':   '0 2px 8px rgba(236,72,153,.1)',
      '--shadow':      '0 6px 20px rgba(236,72,153,.15)',
      '--radius-card': '20px',
      '--radius-btn':  '999px',
      '--font-size':   '15px',
      '--font-size-lg':'18px',
    },
  },
};

export function applyTheme(theme: ThemeName): void {
  const def = themes[theme];
  const root = document.documentElement;
  Object.entries(def.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);
}
