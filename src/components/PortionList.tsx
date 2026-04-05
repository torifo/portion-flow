import type { PortionHolder, DistributionResult, Group } from '../types';
import { PortionCard } from './PortionCard';
import { WeightSlider } from './WeightSlider';

interface Props {
  members: PortionHolder[];
  results: DistributionResult[];
  groups: Group[];
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
  onAdd,
  onRemove,
  onUpdate,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onAssignGroup,
}: Props) {
  const canDelete = members.length > 1;

  // グループなしのメンバー
  const ungrouped = members.filter((m) => !m.groupId);
  // グループ別メンバー
  const byGroup = (gId: string) => members.filter((m) => m.groupId === gId);

  return (
    <div className="portion-list">
      {/* グループセクション */}
      {groups.map((group) => {
        const gMembers = byGroup(group.id);
        return (
          <section key={group.id} className="group-section">
            <div className="group-header">
              <span className="group-color-dot" style={{ background: group.color }} />
              <input
                className="group-name-input"
                value={group.name}
                onChange={(e) => onUpdateGroup(group.id, { name: e.target.value })}
              />
              <span className="group-weight-label">グループWT</span>
              <div className="group-weight-slider">
                <WeightSlider
                  value={group.weight}
                  onChange={(v) => onUpdateGroup(group.id, { weight: v })}
                  color={group.color}
                />
              </div>
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
                  onUpdate={(patch) => onUpdate(member.id, patch)}
                  onDelete={() => onRemove(member.id)}
                  onAssignGroup={(gId) => onAssignGroup(member.id, gId)}
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
          </section>
        );
      })}

      {/* グループなしメンバー */}
      {ungrouped.length > 0 && (
        <div className="cards-grid">
          {ungrouped.map((member) => (
            <PortionCard
              key={member.id}
              member={member}
              result={results.find((r) => r.id === member.id)}
              canDelete={canDelete}
              groups={groups}
              onUpdate={(patch) => onUpdate(member.id, patch)}
              onDelete={() => onRemove(member.id)}
              onAssignGroup={(gId) => onAssignGroup(member.id, gId)}
            />
          ))}
        </div>
      )}

      {/* 追加ボタン群 */}
      <div className="list-actions">
        <button
          className="add-btn"
          onClick={() => onAdd(null)}
          disabled={members.length >= 50}
        >
          ＋ メンバー追加
        </button>
        <button
          className="add-group-btn"
          onClick={onAddGroup}
        >
          ＋ グループ作成
        </button>
      </div>
    </div>
  );
}
