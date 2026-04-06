import { useState, useCallback, type DragEvent, type ChangeEvent } from 'react';
import type { CSSProperties } from 'react';
import type { PortionHolder, DistributionResult, Group, ValueConstraint } from '../types';
import { PortionCard } from './PortionCard';
import { WeightSlider } from './WeightSlider';

interface Props {
  members: PortionHolder[];
  results: DistributionResult[];
  groups: Group[];
  valueConstraint: ValueConstraint;
  totalAmount: number;
  onAdd: (groupId?: string | null) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PortionHolder>) => void;
  onAddGroup: () => void;
  onUpdateGroup: (id: string, patch: Partial<Group>) => void;
  onRemoveGroup: (id: string) => void;
  onAssignGroup: (memberId: string, groupId: string | null) => void;
}

/** グループヘッダー内の配分額入力 */
function GroupAllocationInput({
  group,
  totalAmount,
  onUpdateGroup,
}: {
  group: Group;
  totalAmount: number;
  onUpdateGroup: (id: string, patch: Partial<Group>) => void;
}) {
  const isFixed = group.allocatedAmount !== null;
  const [inputVal, setInputVal] = useState(String(group.allocatedAmount ?? ''));

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) {
      onUpdateGroup(group.id, { allocatedAmount: n });
    } else {
      setInputVal(String(group.allocatedAmount ?? ''));
    }
  };

  const handleToggle = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const defaultVal = Math.round(totalAmount / 2);
      setInputVal(String(defaultVal));
      onUpdateGroup(group.id, { allocatedAmount: defaultVal });
    } else {
      setInputVal('');
      onUpdateGroup(group.id, { allocatedAmount: null });
    }
  };

  return (
    <div className="group-alloc-row">
      <label className="group-alloc-toggle">
        <input type="checkbox" checked={isFixed} onChange={handleToggle} />
        <span>配分固定</span>
      </label>
      {isFixed && (
        <div className="group-alloc-input-wrap">
          <input
            className="group-alloc-input"
            type="number"
            min={0}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit(inputVal)}
          />
          <span className="group-alloc-sep">/</span>
          <span className="group-alloc-total">{totalAmount.toLocaleString()}</span>
          <span className="group-alloc-pct">
            ({((group.allocatedAmount ?? 0) / totalAmount * 100).toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );
}

export function PortionList({
  members,
  results,
  groups,
  valueConstraint,
  totalAmount,
  onAdd,
  onRemove,
  onUpdate,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onAssignGroup,
}: Props) {
  const canDelete = members.length > 1;

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<string | null>(null);

  const handleDrop = useCallback(
    (targetGroupId: string | null) => {
      if (draggedId) onAssignGroup(draggedId, targetGroupId);
      setDraggedId(null);
      setOverZone(null);
    },
    [draggedId, onAssignGroup]
  );

  const dropZoneProps = (zoneKey: string, targetGroupId: string | null) => ({
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOverZone(zoneKey);
    },
    onDragLeave: () => setOverZone(null),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      handleDrop(targetGroupId);
    },
  });

  const ungrouped = members.filter((m) => !m.groupId);
  const byGroup = (gId: string) => members.filter((m) => m.groupId === gId);

  return (
    <div className="portion-list">
      {/* ── グループセクション ── */}
      {groups.map((group) => {
        const gMembers = byGroup(group.id);
        const isOver = overZone === group.id;
        const gResults = gMembers.map((m) => results.find((r) => r.id === m.id));
        const gTotal = gResults.reduce((s, r) => s + (r?.portion ?? 0), 0);

        return (
          <section
            key={group.id}
            className={`group-section${isOver ? ' drop-active' : ''}`}
            style={{ '--group-color': group.color } as CSSProperties}
            {...dropZoneProps(group.id, group.id)}
          >
            <div className="group-header">
              <span className="group-color-dot" style={{ background: group.color }} />
              <input
                className="group-name-input"
                value={group.name}
                onChange={(e) => onUpdateGroup(group.id, { name: e.target.value })}
              />
              <span className="group-weight-label">WT</span>
              <div className="group-weight-slider">
                <WeightSlider
                  value={group.weight}
                  onChange={(v) => onUpdateGroup(group.id, { weight: v })}
                  color={group.color}
                  disabled={group.allocatedAmount !== null}
                />
              </div>
              <span className="group-member-count">{gMembers.length}人</span>
              <button
                className="icon-btn danger-btn small"
                onClick={() => onRemoveGroup(group.id)}
                title="グループを削除"
              >
                ✕
              </button>
            </div>

            {/* 配分固定行 */}
            <div className="group-alloc-bar">
              <GroupAllocationInput
                group={group}
                totalAmount={totalAmount}
                onUpdateGroup={onUpdateGroup}
              />
              {group.allocatedAmount !== null && (
                <span className="group-alloc-result">
                  配分済 {gTotal.toLocaleString()} / {group.allocatedAmount.toLocaleString()}
                </span>
              )}
            </div>

            <div className="cards-grid">
              {gMembers.map((member) => (
                <PortionCard
                  key={member.id}
                  member={member}
                  result={results.find((r) => r.id === member.id)}
                  canDelete={canDelete}
                  groups={groups}
                  isDragging={draggedId === member.id}
                  valueConstraint={valueConstraint}
                  totalAmount={totalAmount}
                  onUpdate={(patch) => onUpdate(member.id, patch)}
                  onDelete={() => onRemove(member.id)}
                  onAssignGroup={(gId) => onAssignGroup(member.id, gId)}
                  onDragStart={() => setDraggedId(member.id)}
                  onDragEnd={() => { setDraggedId(null); setOverZone(null); }}
                />
              ))}
              <button
                className="add-member-in-group-btn"
                style={{ borderColor: group.color + '88', color: group.color }}
                onClick={() => onAdd(group.id)}
                disabled={members.length >= 50}
              >
                ＋ メンバー追加
              </button>
            </div>

            {isOver && draggedId && (
              <div className="drop-hint">ここにドロップ → {group.name} へ移動</div>
            )}
          </section>
        );
      })}

      {/* ── グループなしエリア ── */}
      <div
        className={`ungrouped-area${overZone === 'ungrouped' ? ' drop-active' : ''}`}
        {...dropZoneProps('ungrouped', null)}
      >
        {ungrouped.length > 0 && (
          <div className="cards-grid">
            {ungrouped.map((member) => (
              <PortionCard
                key={member.id}
                member={member}
                result={results.find((r) => r.id === member.id)}
                canDelete={canDelete}
                groups={groups}
                isDragging={draggedId === member.id}
                valueConstraint={valueConstraint}
                totalAmount={totalAmount}
                onUpdate={(patch) => onUpdate(member.id, patch)}
                onDelete={() => onRemove(member.id)}
                onAssignGroup={(gId) => onAssignGroup(member.id, gId)}
                onDragStart={() => setDraggedId(member.id)}
                onDragEnd={() => { setDraggedId(null); setOverZone(null); }}
              />
            ))}
          </div>
        )}

        {overZone === 'ungrouped' && draggedId && (
          <div className="drop-hint ungrouped-hint">ここにドロップ → グループから外す</div>
        )}
      </div>

      {/* ── 追加ボタン群 ── */}
      <div className="list-actions">
        <button
          className="add-btn"
          onClick={() => onAdd(null)}
          disabled={members.length >= 50}
        >
          ＋ メンバー追加
        </button>
        <button className="add-group-btn" onClick={onAddGroup}>
          ＋ グループ作成
        </button>
      </div>
    </div>
  );
}
