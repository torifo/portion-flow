import type { PortionHolder, DistributionResult } from '../types';
import { WeightSlider } from './WeightSlider';
import { findPagerEntry } from '../core/pagerIndicator';

interface Props {
  member: PortionHolder;
  result: DistributionResult | undefined;
  canDelete: boolean;
  onUpdate: (patch: Partial<PortionHolder>) => void;
  onDelete: () => void;
}

export function PortionCard({ member, result, canDelete, onUpdate, onDelete }: Props) {
  const portion = result?.portion ?? 0;
  const pager = findPagerEntry(portion);
  const isFixed = member.fixedAmount !== null;

  return (
    <div className={`portion-card ${member.done ? 'done' : ''}`}>
      <div className="card-header">
        <input
          className="name-input"
          type="text"
          value={member.name}
          placeholder="名前"
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <button
          className="delete-btn"
          onClick={onDelete}
          disabled={!canDelete}
          title="削除"
          aria-label="メンバーを削除"
        >
          ✕
        </button>
      </div>

      <div className="portion-display">
        <span className="portion-value">{portion}</span>
        {pager && (
          <span
            className="pager-indicator"
            title={`${pager.label}（${portion}）`}
            role="img"
            aria-label={pager.label}
          >
            {pager.emoji}
          </span>
        )}
      </div>

      <div className="weight-row">
        <label className="field-label">ウェイト</label>
        <WeightSlider
          value={member.weight}
          onChange={(v) => onUpdate({ weight: v })}
          disabled={isFixed}
        />
      </div>

      <div className="fixed-row">
        <label className="field-label">
          <input
            type="checkbox"
            checked={isFixed}
            onChange={(e) =>
              onUpdate({ fixedAmount: e.target.checked ? 0 : null })
            }
          />
          <span>固定額</span>
        </label>
        {isFixed && (
          <input
            className="fixed-input"
            type="number"
            min={0}
            value={member.fixedAmount ?? 0}
            onChange={(e) => onUpdate({ fixedAmount: Number(e.target.value) })}
          />
        )}
      </div>

      <div className="memo-row">
        <input
          className="memo-input"
          type="text"
          value={member.memo}
          placeholder="メモ"
          onChange={(e) => onUpdate({ memo: e.target.value })}
        />
      </div>

      <div className="done-row">
        <label className="done-label">
          <input
            type="checkbox"
            checked={member.done}
            onChange={(e) => onUpdate({ done: e.target.checked })}
          />
          <span>完了</span>
        </label>
      </div>
    </div>
  );
}
