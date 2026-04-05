import { useState } from 'react';
import type { PortionHolder, DistributionResult, Group } from '../types';
import { WeightSlider } from './WeightSlider';
import { findPagerEntry } from '../core/pagerIndicator';

interface Props {
  member: PortionHolder;
  result: DistributionResult | undefined;
  canDelete: boolean;
  groups: Group[];
  onUpdate: (patch: Partial<PortionHolder>) => void;
  onDelete: () => void;
  onAssignGroup: (groupId: string | null) => void;
}

export function PortionCard({
  member,
  result,
  canDelete,
  groups,
  onUpdate,
  onDelete,
  onAssignGroup,
}: Props) {
  const portion = result?.portion ?? 0;
  const pager = findPagerEntry(portion);
  const isFixed = member.fixedAmount !== null;
  const group = groups.find((g) => g.id === member.groupId);

  const [showGroupPicker, setShowGroupPicker] = useState(false);

  const groupColor = group?.color;
  const borderStyle = groupColor
    ? { borderLeftColor: groupColor, borderLeftWidth: '4px' }
    : {};

  return (
    <div
      className={`portion-card${member.done ? ' done' : ''}`}
      style={borderStyle}
    >
      {/* Header */}
      <div className="card-header">
        {group && (
          <span
            className="group-dot"
            style={{ background: group.color }}
            title={group.name}
          />
        )}
        <input
          className="name-input"
          type="text"
          value={member.name}
          placeholder="名前"
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <button
          className="icon-btn danger-btn"
          onClick={onDelete}
          disabled={!canDelete}
          title="削除"
          aria-label="メンバーを削除"
        >
          ✕
        </button>
      </div>

      {/* Portion display */}
      <div className="portion-display">
        <span className="portion-value">{portion.toLocaleString()}</span>
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

      {/* Weight or Fixed */}
      <div className="card-controls">
        <div className="control-row">
          <label className="toggle-label">
            <input
              type="checkbox"
              className="toggle-checkbox"
              checked={isFixed}
              onChange={(e) =>
                onUpdate({ fixedAmount: e.target.checked ? 0 : null })
              }
            />
            <span className="toggle-text">固定値</span>
          </label>
          {isFixed ? (
            <input
              className="fixed-input"
              type="number"
              min={0}
              value={member.fixedAmount ?? 0}
              onChange={(e) => onUpdate({ fixedAmount: Number(e.target.value) })}
            />
          ) : (
            <WeightSlider
              value={member.weight}
              onChange={(v) => onUpdate({ weight: v })}
              disabled={!!member.groupId}
              color={groupColor}
            />
          )}
        </div>
      </div>

      {/* Footer: memo + done + group */}
      <div className="card-footer">
        <input
          className="memo-input"
          type="text"
          value={member.memo}
          placeholder="メモ…"
          onChange={(e) => onUpdate({ memo: e.target.value })}
        />
        <div className="footer-actions">
          <label className="done-label">
            <input
              type="checkbox"
              checked={member.done}
              onChange={(e) => onUpdate({ done: e.target.checked })}
            />
            <span>完了</span>
          </label>
          <div className="group-picker-wrap">
            <button
              className="group-tag-btn"
              style={group ? { background: group.color + '22', color: group.color, borderColor: group.color + '55' } : undefined}
              onClick={() => setShowGroupPicker((v) => !v)}
              title="グループを変更"
            >
              {group ? group.name : '＋ グループ'}
            </button>
            {showGroupPicker && (
              <div className="group-dropdown">
                <button
                  className="group-option"
                  onClick={() => { onAssignGroup(null); setShowGroupPicker(false); }}
                >
                  なし
                </button>
                {groups.map((g) => (
                  <button
                    key={g.id}
                    className="group-option"
                    style={{ borderLeftColor: g.color }}
                    onClick={() => { onAssignGroup(g.id); setShowGroupPicker(false); }}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
