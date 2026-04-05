import { useState, useCallback } from 'react';
import type { PortionHolder, DistributionResult, Group, ValueConstraint } from '../types';
import { PortionCard } from './PortionCard';
import { WeightSlider } from './WeightSlider';

interface Props {
  members: PortionHolder[];
  results: DistributionResult[];
  groups: Group[];
  valueConstraint: ValueConstraint;
  onAdd: (groupId?: string | null) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<PortionHolder>) => void;
  onAddGroup: () => void;
  onUpdateGroup: (id: string, patch: Partial<Group>) => void;
  onRemoveGroup: (id: string) => void;
  onAssignGroup: (memberId: string, groupId: string | null) => void;
}

export function PortionList({
  members,
  results,
  groups,
  valueConstraint,
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
  const [overZone, setOverZone] = useState<string | null>(null); // groupId | 'ungrouped' | null

  const handleDrop = useCallback(
    (targetGroupId: string | null) => {
      if (draggedId) {
        onAssignGroup(draggedId, targetGroupId);
      }
      setDraggedId(null);
      setOverZone(null);
    },
    [draggedId, onAssignGroup]
  );

  const dropZoneProps = (zoneKey: string, targetGroupId: string | null) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOverZone(zoneKey);
    },
    onDragLeave: () => setOverZone(null),
    onDrop: (e: React.DragEvent) => {
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

        return (
          <section
            key={group.id}
            className={`group-section${isOver ? ' drop-active' : ''}`}
            style={{ '--group-color': group.color } as React.CSSProperties}
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
                  onUpdate={(patch) => onUpdate(member.id, patch)}
                  onDelete={() => onRemove(member.id)}
                  onAssignGroup={(gId) => onAssignGroup(member.id, gId)}
                  onDragStart={() => setDraggedId(member.id)}
                  onDragEnd={() => { setDraggedId(null); setOverZone(null); }}
                />
              ))}
              {/* グループ内追加ボタン */}
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
