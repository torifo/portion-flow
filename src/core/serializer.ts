import LZString from 'lz-string';
import type { AppState } from '../types';

const LS_KEY = 'portion-flow-state';

export function serializeToUrl(state: AppState): string {
  const json = JSON.stringify(state);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return `?s=${compressed}`;
}

export function deserializeFromUrl(search: string): AppState | null {
  const params = new URLSearchParams(search);
  const s = params.get('s');
  if (!s) return null;
  try {
    const json = LZString.decompressFromEncodedURIComponent(s);
    if (!json) return null;
    return JSON.parse(json) as AppState;
  } catch {
    console.error('[Serializer] Invalid URL parameter');
    return null;
  }
}

export function saveToLocalStorage(state: AppState): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    console.error('[Serializer] Failed to save to localStorage');
  }
}

export function loadFromLocalStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as AppState) : null;
  } catch {
    return null;
  }
}
