import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, PortionHolder, ThemeName, Group } from '../types';
import {
  serializeToUrl,
  deserializeFromUrl,
  saveToLocalStorage,
  loadFromLocalStorage,
} from '../core/serializer';

export const GROUP_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];

function createDefaultMember(name = '', groupId: string | null = null): PortionHolder {
  return {
    id: uuidv4(),
    name,
    weight: 1,
    groupId,
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
    groups: [],
    theme: 'standard',
  };
}

function loadInitialState(): AppState {
  const fromUrl = deserializeFromUrl(window.location.search);
  if (fromUrl) return { ...fromUrl, groups: fromUrl.groups ?? [] };
  const fromLs = loadFromLocalStorage();
  if (fromLs) return { ...fromLs, groups: fromLs.groups ?? [] };
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

  const addMember = useCallback((groupId: string | null = null) => {
    setState((prev) => {
      if (prev.members.length >= 50) return prev;
      const group = groupId ? prev.groups.find((g) => g.id === groupId) : null;
      const newMember = createDefaultMember(
        `メンバー${prev.members.length + 1}`,
        groupId
      );
      if (group) newMember.weight = group.weight;
      return { ...prev, members: [...prev.members, newMember] };
    });
  }, []);

  const removeMember = useCallback((id: string) => {
    setState((prev) => {
      if (prev.members.length <= 1) return prev;
      return { ...prev, members: prev.members.filter((m) => m.id !== id) };
    });
  }, []);

  const updateMember = useCallback((id: string, patch: Partial<PortionHolder>) => {
    setState((prev) => {
      // Groupメンバーのweightを変更した場合、同グループ全員に反映
      if (patch.weight !== undefined) {
        const member = prev.members.find((m) => m.id === id);
        if (member?.groupId) {
          const gId = member.groupId;
          return {
            ...prev,
            groups: prev.groups.map((g) =>
              g.id === gId ? { ...g, weight: patch.weight! } : g
            ),
            members: prev.members.map((m) =>
              m.id === id || m.groupId === gId
                ? { ...m, weight: patch.weight! }
                : m
            ),
          };
        }
      }
      return {
        ...prev,
        members: prev.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
    });
  }, []);

  const addGroup = useCallback(() => {
    setState((prev) => {
      const colorIdx = prev.groups.length % GROUP_COLORS.length;
      const newGroup: Group = {
        id: uuidv4(),
        name: `グループ${prev.groups.length + 1}`,
        color: GROUP_COLORS[colorIdx],
        weight: 1,
      };
      return { ...prev, groups: [...prev.groups, newGroup] };
    });
  }, []);

  const updateGroup = useCallback((id: string, patch: Partial<Group>) => {
    setState((prev) => {
      // グループのweight変更時、所属メンバーに反映
      const updated = prev.groups.map((g) => (g.id === id ? { ...g, ...patch } : g));
      let members = prev.members;
      if (patch.weight !== undefined) {
        members = prev.members.map((m) =>
          m.groupId === id ? { ...m, weight: patch.weight! } : m
        );
      }
      return { ...prev, groups: updated, members };
    });
  }, []);

  const removeGroup = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== id),
      members: prev.members.map((m) =>
        m.groupId === id ? { ...m, groupId: null } : m
      ),
    }));
  }, []);

  const assignGroup = useCallback((memberId: string, groupId: string | null) => {
    setState((prev) => {
      const group = groupId ? prev.groups.find((g) => g.id === groupId) : null;
      return {
        ...prev,
        members: prev.members.map((m) =>
          m.id === memberId
            ? { ...m, groupId, weight: group ? group.weight : m.weight }
            : m
        ),
      };
    });
  }, []);

  const importState = useCallback((imported: AppState) => {
    setState({ ...imported, groups: imported.groups ?? [] });
  }, []);

  return {
    state,
    setTotalAmount,
    setTheme,
    addMember,
    removeMember,
    updateMember,
    addGroup,
    updateGroup,
    removeGroup,
    assignGroup,
    importState,
  };
}
