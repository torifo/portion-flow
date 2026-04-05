import { useState } from 'react';
import type { PortionHolder, DistributionResult, Group } from '../types';
import { WeightSlider } from './WeightSlider';
import { findPagerEntry } from '../core/pagerIndicator';

interface Props {
  member: PortionHolder;
  result: DistributionResult | undefined;
  canDelete: boolean;
  groups: Group[];
  isDragging: boolean;
  onUpdate: (patch: Partial<PortionHolder>) => void;
  onDelete: () => void;
  onAssignGroup: (groupId: string | null) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function PortionCard({
  member,
  result,
  canDelete,
  groups,
  isDragging,
  onUpdate,
  onDelete,
  onAssignGroup,
  onDragStart,
  onDragEnd,
}: Props) {
  const portion = result?.portion ?? 0;
  const pager = findPagerEntry(portion);
  const isFixed = member.fixedAmount !== null;
  const group = groups.find((g) => g.id === member.groupId);
  const inGroup = !!member.groupId;

  const [showGroupPicker, setShowGroupPicker] = useState(false);

  const groupColor = group?.color;
  const cardStyle: React.CSSProperties = {
    borderLeftColor: groupColor ?? 'var(--border)',
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      className={`portion-card${member.done ? ' done' : ''}`}
      style={cardStyle}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      {/* Drag handle + Header */}
      <div className="card-header">
        <span className="drag-handle" title="ドラッグして移動">⠿</span>
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

      {/* Controls: グループ内はデフォルト固定値OFF可能、グループ外は通常ウェイト */}
      <div className="card-controls">
        <div className="control-row">
          {inGroup && (
            <label className="toggle-label" title="グループの均等配分から外して個別に設定">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isFixed}
                onChange={(e) =>
                  onUpdate({ fixedAmount: e.target.checked ? portion : null })
                }
              />
              <span className="toggle-text">個別指定</span>
            </label>
          )}
          {!inGroup && (
            <label className="toggle-label">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isFixed}
                onChange={(e) =>
                  onUpdate({ fixedAmount: e.target.checked ? portion : null })
                }
              />
              <span className="toggle-text">固定値</span>
            </label>
          )}

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
              disabled={inGroup && !isFixed}
              color={groupColor}
            />
          )}
        </div>
        {inGroup && !isFixed && (
          <p className="group-hint">グループウェイトに連動</p>
        )}
      </div>

      {/* Footer: memo + done + group picker */}
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
              style={
                group
                  ? { background: group.color + '22', color: group.color, borderColor: group.color + '66' }
                  : undefined
              }
              onClick={() => setShowGroupPicker((v) => !v)}
            >
              {group ? group.name : '＋ グループ'}
            </button>
            {showGroupPicker && (
              <div className="group-dropdown">
                <button
                  className="group-option"
                  onClick={() => { onAssignGroup(null); setShowGroupPicker(false); }}
                >
                  グループなし
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
