import { useRef, useState } from 'react';
import type { AppState, PortionHolder, DistributionResult, ExportSchema } from '../types';

interface Props {
  state: AppState;
  results: DistributionResult[];
  onImport: (state: AppState) => void;
}

function buildCopyText(
  members: PortionHolder[],
  results: DistributionResult[],
  totalAmount: number
): string {
  const lines = [`【Portion-Flow 配分結果】`, `合計値: ${totalAmount.toLocaleString()}`, ''];
  members.forEach((m) => {
    const portion = results.find((r) => r.id === m.id)?.portion ?? 0;
    let line = `• ${m.name || '(名前未設定)'}: ${portion.toLocaleString()}`;
    if (m.memo) line += `  ―  ${m.memo}`;
    if (m.done) line += ' ✅';
    lines.push(line);
  });
  return lines.join('\n');
}

export function ActionBar({ state, results, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = async () => {
    const text = buildCopyText(state.members, results, state.totalAmount);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
