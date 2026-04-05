import type { PortionHolder, DistributionResult } from '../types';
import { PortionCard } from './PortionCard';

interface Props {
  members: PortionHolder[];
  results: DistributionResult[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PortionHolder>) => void;
}

export function PortionList({ members, results, onAdd, onRemove, onUpdate }: Props) {
  const canDelete = members.length > 1;

  return (
    <div className="portion-list">
      <div className="cards-grid">
        {members.map((member) => (
          <PortionCard
            key={member.id}
            member={member}
            result={results.find((r) => r.id === member.id)}
            canDelete={canDelete}
            onUpdate={(patch) => onUpdate(member.id, patch)}
            onDelete={() => onRemove(member.id)}
          />
        ))}
      </div>
      <button
        className="add-btn"
        onClick={onAdd}
        disabled={members.length >= 50}
      >
        ＋ メンバーを追加
      </button>
    </div>
  );
}
