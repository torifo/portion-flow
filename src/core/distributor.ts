import type { PortionHolder, DistributionResult } from '../types';

export function distribute(
  totalAmount: number,
  members: PortionHolder[]
): DistributionResult[] {
  const fixed = members.filter((m) => m.fixedAmount !== null);
  const variable = members.filter((m) => m.fixedAmount === null);

  const fixedSum = fixed.reduce((s, m) => s + (m.fixedAmount ?? 0), 0);
  if (fixedSum > totalAmount) {
    throw new Error('FIXED_EXCEEDS_TOTAL');
  }
  const remaining = totalAmount - fixedSum;

  const weightSum = variable.reduce((s, m) => s + m.weight, 0);

  const results: DistributionResult[] = members.map((m) => {
    if (m.fixedAmount !== null) {
      return { id: m.id, portion: m.fixedAmount, remainder: 0 };
    }
    if (weightSum === 0) {
      return { id: m.id, portion: 0, remainder: 0 };
    }
    const exact = (remaining * m.weight) / weightSum;
    return {
      id: m.id,
      portion: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });

  const currentSum = results.reduce((s, r) => s + r.portion, 0);
  const deficit = totalAmount - currentSum;

  const sorted = [...results]
    .filter((r) => {
      const m = members.find((m) => m.id === r.id);
      return m?.fixedAmount === null;
    })
    .sort((a, b) => b.remainder - a.remainder);

  for (let i = 0; i < deficit; i++) {
    const target = sorted[i];
    const idx = results.findIndex((r) => r.id === target.id);
    results[idx].portion += 1;
  }

  return results;
}
