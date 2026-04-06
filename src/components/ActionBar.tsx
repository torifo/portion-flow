import { useRef, useState, type ChangeEvent } from 'react';
import type { AppState, PortionHolder, DistributionResult, ExportSchema, ValueConstraint } from '../types';

interface Props {
  state: AppState;
  results: DistributionResult[];
  onImport: (state: AppState) => void;
  onReset: () => void;
}

function splitIntoRounds(portion: number, max: number): number[] {
  const rounds: number[] = [];
  let remaining = portion;
  while (remaining > 0) {
    rounds.push(Math.min(remaining, max));
    remaining -= max;
  }
  return rounds;
}

function buildCopyText(
  members: PortionHolder[],
  results: DistributionResult[],
  totalAmount: number,
  vc: ValueConstraint
): string {
  const lines = [`【Portion-Flow 配分結果】`, `合計値: ${totalAmount.toLocaleString()}`, ''];
  members.forEach((m) => {
    const portion = results.find((r) => r.id === m.id)?.portion ?? 0;
    const needsRounds = vc.enabled && portion > vc.max;
    let line = `• ${m.name || '(名前未設定)'}: ${portion.toLocaleString()}`;
    if (needsRounds) {
      const rounds = splitIntoRounds(portion, vc.max);
      line += ` (${rounds.map((v, i) => `${i + 1}回目:${v}`).join(' / ')})`;
    }
    if (m.memo) line += `  ―  ${m.memo}`;
    if (m.done) line += ' ✅';
    lines.push(line);
  });
  return lines.join('\n');
}

export function ActionBar({ state, results, onImport, onReset }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    onReset();
    setConfirmReset(false);
    showToast('リセットしました');
  };

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = async () => {
    const text = buildCopyText(state.members, results, state.totalAmount, state.valueConstraint);
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('クリップボードにコピーしました');
        return;
      } catch { /* fall through */ }
    }
    setFallbackText(text);
  };

  const handleExport = () => {
    const schema: ExportSchema = {
      $schema: 'portion-flow-v1',
      totalAmount: state.totalAmount,
      valueConstraint: state.valueConstraint,
      theme: state.theme,
      members: state.members,
      groups: state.groups,
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portion-flow-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.$schema !== 'portion-flow-v1') {
          showToast('対応していないファイル形式です', false);
          return;
        }
        const imported: AppState = {
          totalAmount: parsed.totalAmount,
          theme: parsed.theme,
          members: parsed.members,
          groups: parsed.groups ?? [],
          valueConstraint: parsed.valueConstraint ?? { enabled: true, min: 0, max: 120 },
        };
        onImport(imported);
        showToast('インポートしました');
      } catch {
        showToast('JSONの読み込みに失敗しました', false);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="action-bar">
        <button className="action-btn" onClick={handleCopy} title="配分結果をコピー">
          <span className="btn-icon">📋</span>
          <span className="btn-label">コピー</span>
        </button>
        <button className="action-btn" onClick={handleExport} title="JSONでエクスポート">
          <span className="btn-icon">📤</span>
          <span className="btn-label">エクスポート</span>
        </button>
        <button className="action-btn" onClick={() => fileInputRef.current?.click()} title="JSONをインポート">
          <span className="btn-icon">📥</span>
          <span className="btn-label">インポート</span>
        </button>
        <button
          className={`action-btn reset-btn${confirmReset ? ' reset-confirm' : ''}`}
          onClick={handleReset}
          title={confirmReset ? 'もう一度押すと初期化します' : 'データをすべてリセット'}
        >
          <span className="btn-icon">{confirmReset ? '⚠️' : '🗑️'}</span>
          <span className="btn-label">{confirmReset ? '本当に？' : 'リセット'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {toast && (
        <div className={`toast${toast.ok ? '' : ' toast-error'}`} role="alert">
          {toast.ok ? '✓ ' : '⚠ '}{toast.msg}
        </div>
      )}

      {fallbackText && (
        <div className="fallback-overlay" onClick={() => setFallbackText(null)}>
          <div className="fallback-copy" onClick={(e) => e.stopPropagation()}>
            <p className="fallback-title">手動でコピーしてください</p>
            <textarea
              readOnly
              value={fallbackText}
              rows={8}
              onFocus={(e) => e.target.select()}
            />
            <button className="action-btn" onClick={() => setFallbackText(null)}>
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  );
}
