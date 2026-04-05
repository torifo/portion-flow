import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, PortionHolder, ThemeName } from '../types';
import {
  serializeToUrl,
  deserializeFromUrl,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../core/serializer';

function createDefaultMember(name = ''): PortionHolder {
  return {
    id: uuidv4(),
    name,
    weight: 1,
    fixedAmount: null,
    memo: '',
    done: false,
  };
}

function getDefaultState(): AppState {
  return {
    totalAmount: 400,
    members: [
      createDefaultMember('メンバー1'),
      createDefaultMember('メンバー2'),
    ],
    theme: 'standard',
  };
}

function loadInitialState(): AppState {
  const fromUrl = deserializeFromUrl(window.location.search);
  if (fromUrl) return fromUrl;
  const fromLs = loadFromLocalStorage();
  if (fromLs) return fromLs;
  return getDefaultState();
}

export function usePortionState() {
  const [state, setState] = useState<AppState>(loadInitialState);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToLocalStorage(state);
    const url = serializeToUrl(state);
    window.history.replaceState(null, '', url);
  }, [state]);

  const setTotalAmount = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, totalAmount: amount }));
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  const addMember = useCallback(() => {
    setState((prev) => {
      if (prev.members.length >= 50) return prev;
      return {
        ...prev,
        members: [...prev.members, createDefaultMember(`メンバー${prev.members.length + 1}`)],
      };
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((prev) => {
      if (prev.members.length <= 1) return prev;
      return { ...prev, members: prev.members.filter((m) => m.id !== id) };
    });
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<PortionHolder>) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const importState = useCallback((imported: AppState) => {
    setState(imported);
  }, []);

  return {
    state,
    setTotalAmount,
    setTheme,
    addMember,
    removeMember,
    updateMember,
    importState,
  };
}
