import type { PortionHolder, DistributionResult, Group } from '../types';

/**
 * ハミルトン方式（最大剰余法）で整数配分する。
 *
 * 配分の優先順位:
 * 1. 個人固定値 (fixedAmount != null)
 * 2. グループ配分額 (group.allocatedAmount != null) → グループ内で比重配分
 * 3. 残余プール → 全体比重配分（グループ未所属 + allocatedAmount未設定グループのメンバー）
 */
export function distribute(
  totalAmount: number,
  members: PortionHolder[],
  groups: Group[] = []
): DistributionResult[] {
  // ── 前処理 ──────────────────────────────────────────────────────
  const allocatedGroups = groups.filter((g) => g.allocatedAmount !== null);
  const allocatedGroupIds = new Set(allocatedGroups.map((g) => g.id));

  const inAllocatedGroup = (m: PortionHolder) =>
    m.groupId !== null && allocatedGroupIds.has(m.groupId);

  // "フリープール" = グループ配分外のメンバー
  const freeMembers = members.filter((m) => !inAllocatedGroup(m));
  const freeFixed = freeMembers.filter((m) => m.fixedAmount !== null);
  const freeVariable = freeMembers.filter((m) => m.fixedAmount === null);

  const totalGroupAllocation = allocatedGroups.reduce(
    (s, g) => s + (g.allocatedAmount ?? 0),
    0
  );
  const freeFixedSum = freeFixed.reduce((s, m) => s + (m.fixedAmount ?? 0), 0);

  if (totalGroupAllocation + freeFixedSum > totalAmount) {
    throw new Error('FIXED_EXCEEDS_TOTAL');
  }

  const freePool = totalAmount - totalGroupAllocation - freeFixedSum;

  // ── ヘルパー: Hamilton 配分 ──────────────────────────────────────
  function hamiltonDistribute(
    pool: number,
    variableMembers: PortionHolder[]
  ): DistributionResult[] {
    const weightSum = variableMembers.reduce((s, m) => s + m.weight, 0);

    const res: DistributionResult[] = variableMembers.map((m) => {
      if (weightSum === 0) return { id: m.id, portion: 0, remainder: 0 };
      const exact = (pool * m.weight) / weightSum;
      return { id: m.id, portion: Math.floor(exact), remainder: exact - Math.floor(exact) };
    });

    if (weightSum > 0) {
      const deficit = pool - res.reduce((s, r) => s + r.portion, 0);
      const sorted = [...res]
        .filter((r) => (variableMembers.find((m) => m.id === r.id)?.weight ?? 0) > 0)
        .sort((a, b) => b.remainder - a.remainder);
      for (let i = 0; i < deficit && i < sorted.length; i++) {
        const idx = res.findIndex((r) => r.id === sorted[i].id);
        res[idx].portion += 1;
      }
    }
    return res;
  }

  // ── グループ配分 ─────────────────────────────────────────────────
  const results: DistributionResult[] = [];

  for (const group of allocatedGroups) {
    const gMembers = members.filter((m) => m.groupId === group.id);
    const gFixed = gMembers.filter((m) => m.fixedAmount !== null);
    const gVariable = gMembers.filter((m) => m.fixedAmount === null);
    const gFixedSum = gFixed.reduce((s, m) => s + (m.fixedAmount ?? 0), 0);
    const gPool = (group.allocatedAmount ?? 0) - gFixedSum;

    if (gPool < 0) throw new Error('FIXED_EXCEEDS_TOTAL');

    for (const m of gFixed) {
      results.push({ id: m.id, portion: m.fixedAmount ?? 0, remainder: 0 });
    }
    results.push(...hamiltonDistribute(gPool, gVariable));
  }

  // ── フリープール配分 ─────────────────────────────────────────────
  for (const m of freeFixed) {
    results.push({ id: m.id, portion: m.fixedAmount ?? 0, remainder: 0 });
  }
  results.push(...hamiltonDistribute(freePool, freeVariable));

  return results;
}
