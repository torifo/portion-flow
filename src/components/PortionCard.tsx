import { useState } from 'react';
import type { PortionHolder, DistributionResult, Group, ValueConstraint } from '../types';
import { WeightSlider } from './WeightSlider';
import { findPagerEntry } from '../core/pagerIndicator';

interface Props {
  member: PortionHolder;
  result: DistributionResult | undefined;
  canDelete: boolean;
  groups: Group[];
  isDragging: boolean;
  valueConstraint: ValueConstraint;
  onUpdate: (patch: Partial<PortionHolder>) => void;
  onDelete: () => void;
  onAssignGroup: (groupId: string | null) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

/** 配分値を 1回あたりの上限で複数ラウンドに分割する */
function splitIntoRounds(portion: number, max: number, min: number): number[] {
  if (portion <= 0) return [0];
  const rounds: number[] = [];
  let remaining = portion;
  while (remaining > 0) {
    const chunk = Math.min(remaining, max);
    if (chunk < min && rounds.length > 0) {
      // 最後の端数が min を下回る場合は前のラウンドに積む
      rounds[rounds.length - 1] += chunk;
    } else {
      rounds.push(chunk);
    }
    remaining -= chunk;
  }
  return rounds;
}

export function PortionCard({
  member,
  result,
  canDelete,
  groups,
  isDragging,
  valueConstraint,
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
  const groupColor = group?.color;

  const [showGroupPicker, setShowGroupPicker] = useState(false);

  // 複数回割り当てが必要か
  const vc = valueConstraint;
  const needsMultiRound = vc.enabled && portion > vc.max;
  const rounds = needsMultiRound ? splitIntoRounds(portion, vc.max, vc.min) : null;

  const cardStyle: React.CSSProperties = {
    borderLeftColor: groupColor ?? 'var(--border)',
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      className={`portion-card${member.done ? ' done' : ''}${needsMultiRound ? ' multi-round' : ''}`}
      style={cardStyle}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; onDragStart(); }}
      onDragEnd={onDragEnd}
    >
      {/* Header */}
      <div className="card-header">
        <span className="drag-handle" title="ドラッグして移動">⠿</span>
        {group && (
          <span className="group-dot" style={{ background: group.color }} title={group.name} />
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
        >
          ✕
        </button>
      </div>

      {/* Portion display */}
      <div className="portion-display">
        <span className="portion-value">{portion.toLocaleString()}</span>
        {pager && !needsMultiRound && (
          <span
            className="pager-indicator"
            title={`${pager.label}（${portion}）`}
            role="img"
            aria-label={pager.label}
          >
            {pager.emoji}
          </span>
        )}
        {needsMultiRound && (
          <span className="multi-round-badge" title={`1回の上限(${vc.max})を超えるため${rounds!.length}回に分けて割り当て`}>
            ×{rounds!.length}回
          </span>
        )}
      </div>

      {/* 複数回の内訳 */}
      {needsMultiRound && rounds && (
        <div className="rounds-breakdown">
          {rounds.map((v, i) => (
            <span key={i} className="round-chip">
              <span className="round-num">{i + 1}回目</span>
              <span className="round-val">{v}</span>
            </span>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="card-controls">
        <div className="control-row">
          {inGroup ? (
            <label className="toggle-label" title="グループの均等配分から外して個別に設定">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isFixed}
                onChange={(e) => onUpdate({ fixedAmount: e.target.checked ? portion : null })}
              />
              <span className="toggle-text">個別指定</span>
            </label>
          ) : (
            <label className="toggle-label">
              <input
                type="checkbox"
                className="toggle-checkbox"
                checked={isFixed}
                onChange={(e) => onUpdate({ fixedAmount: e.target.checked ? portion : null })}
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

      {/* Footer */}
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
