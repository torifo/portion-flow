import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import type { AppState, PortionHolder } from '../types';

// Mock localStorage for Node environment
beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string) => { delete store[k]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  });
});

function arbitraryMember(): fc.Arbitrary<PortionHolder> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ maxLength: 50 }),
    weight: fc.integer({ min: 0, max: 100 }),
    fixedAmount: fc.option(fc.integer({ min: 0, max: 9999 }), { nil: null }),
    memo: fc.string({ maxLength: 100 }),
    done: fc.boolean(),
  });
}

function arbitraryAppState(): fc.Arbitrary<AppState> {
  return fc.record({
    totalAmount: fc.integer({ min: 1, max: 99999 }),
    members: fc.array(arbitraryMember(), { minLength: 1, maxLength: 10 }),
    theme: fc.constantFrom('standard' as const, 'senior' as const, 'children' as const),
  });
}

describe('Serializer', () => {
  it('Property: URL serialize/deserialize round-trip preserves state', async () => {
    const { serializeToUrl, deserializeFromUrl } = await import('../core/serializer');

    fc.assert(
      fc.property(arbitraryAppState(), (state) => {
        const url = serializeToUrl(state);
        const restored = deserializeFromUrl(url);
        return JSON.stringify(restored) === JSON.stringify(state);
      }),
      { numRuns: 200 }
    );
  });

  it('returns null for invalid URL parameter', async () => {
    const { deserializeFromUrl } = await import('../core/serializer');
    expect(deserializeFromUrl('?s=invalid!!!')).toBeNull();
  });

  it('returns null for empty URL', async () => {
    const { deserializeFromUrl } = await import('../core/serializer');
    expect(deserializeFromUrl('')).toBeNull();
  });

  it('saves and loads state from localStorage', async () => {
    const { saveToLocalStorage, loadFromLocalStorage } = await import('../core/serializer');
    const state: AppState = {
      totalAmount: 400,
      theme: 'standard',
      members: [
        { id: '1', name: 'Alice', weight: 1, fixedAmount: null, memo: '', done: false },
      ],
    };
    saveToLocalStorage(state);
    const loaded = loadFromLocalStorage();
    expect(loaded).toEqual(state);
  });
});
