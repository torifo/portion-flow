import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { distribute } from '../core/distributor';
import type { PortionHolder } from '../types';

function arbitraryMember(): fc.Arbitrary<PortionHolder> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string(),
    weight: fc.integer({ min: 0, max: 100 }),
    fixedAmount: fc.option(fc.integer({ min: 0, max: 500 }), { nil: null }),
    memo: fc.string(),
    done: fc.boolean(),
  });
}

describe('Distributor', () => {
  it('Property 1: sum(distribute(T, members)) === T for any valid input', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(arbitraryMember(), { minLength: 1, maxLength: 20 }),
        (total, members) => {
          const fixedSum = members
            .filter((m) => m.fixedAmount !== null)
            .reduce((s, m) => s + (m.fixedAmount ?? 0), 0);
          if (fixedSum > total) return true;

          // weight=0のみの可変メンバーでは剰余配布不可 (スキップ)
          const variableWeightSum = members
            .filter((m) => m.fixedAmount === null)
            .reduce((s, m) => s + m.weight, 0);
          if (variableWeightSum === 0 && fixedSum < total) return true;

          const results = distribute(total, members);
          const sum = results.reduce((s, r) => s + r.portion, 0);
          return sum === total;
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Property 2: Fixed-Amount members always get exactly their fixedAmount', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(arbitraryMember(), { minLength: 1, maxLength: 20 }),
        (total, members) => {
          const fixedSum = members
            .filter((m) => m.fixedAmount !== null)
            .reduce((s, m) => s + (m.fixedAmount ?? 0), 0);
          if (fixedSum > total) return true;

          const variableWeightSum = members
            .filter((m) => m.fixedAmount === null)
            .reduce((s, m) => s + m.weight, 0);
          if (variableWeightSum === 0 && fixedSum < total) return true;

          const results = distribute(total, members);
          return members
            .filter((m) => m.fixedAmount !== null)
            .every((m) => {
              const r = results.find((r) => r.id === m.id);
              return r?.portion === m.fixedAmount;
            });
        }
      ),
      { numRuns: 500 }
    );
  });

  it('Property 3: Weight-0 members without fixedAmount always get portion 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        fc.array(arbitraryMember(), { minLength: 1, maxLength: 20 }),
        (total, members) => {
          const fixedSum = members
            .filter((m) => m.fixedAmount !== null)
            .reduce((s, m) => s + (m.fixedAmount ?? 0), 0);
          if (fixedSum > total) return true;

          const variableWeightSum = members
            .filter((m) => m.fixedAmount === null)
            .reduce((s, m) => s + m.weight, 0);
          if (variableWeightSum === 0 && fixedSum < total) return true;

          const results = distribute(total, members);
          return members
            .filter((m) => m.weight === 0 && m.fixedAmount === null)
            .every((m) => results.find((r) => r.id === m.id)?.portion === 0);
        }
      ),
      { numRuns: 500 }
    );
  });

  it('throws FIXED_EXCEEDS_TOTAL when fixed amounts exceed total', () => {
    const members: PortionHolder[] = [
      { id: '1', name: 'A', weight: 1, fixedAmount: 300, memo: '', done: false },
      { id: '2', name: 'B', weight: 1, fixedAmount: 200, memo: '', done: false },
    ];
    expect(() => distribute(400, members)).toThrow('FIXED_EXCEEDS_TOTAL');
  });

  it('single member gets the entire total amount', () => {
    const members: PortionHolder[] = [
      { id: '1', name: 'A', weight: 5, fixedAmount: null, memo: '', done: false },
    ];
    const results = distribute(400, members);
    expect(results[0].portion).toBe(400);
  });

  it('distributes 400 evenly among 3 members with weight 1:2:1', () => {
    const members: PortionHolder[] = [
      { id: '1', name: 'A', weight: 1, fixedAmount: null, memo: '', done: false },
      { id: '2', name: 'B', weight: 2, fixedAmount: null, memo: '', done: false },
      { id: '3', name: 'C', weight: 1, fixedAmount: null, memo: '', done: false },
    ];
    const results = distribute(400, members);
    const sum = results.reduce((s, r) => s + r.portion, 0);
    expect(sum).toBe(400);
    expect(results.find((r) => r.id === '2')!.portion).toBe(200);
  });
});
