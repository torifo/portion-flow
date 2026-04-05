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
  const lines = [`【Portion-Flow 分配結果】`, `総額: ${totalAmount}`, ''];
  members.forEach((m) => {
    const r = results.find((r) => r.id === m.id);
    const portion = r?.portion ?? 0;
    let line = `- ${m.name || '(名前未設定)'}: ${portion}`;
    if (m.memo) line += `（メモ: ${m.memo}）`;
    if (m.done) line += ' ✅';
    lines.push(line);
  });
  return lines.join('\n');
}

export function ActionBar({ state, results, onImport }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [fallbackText, setFallbackText] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopy = async () => {
    const text = buildCopyText(state.members, results, state.totalAmount);
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text);
        showToast('クリップボードにコピーしました ✓');
        return;
      } catch {
        // fall through to fallback
      }
    }
    setFallbackText(text);
  };

  const handleExport = () => {
    const schema: ExportSchema = {
      $schema: 'portion-flow-v1',
      totalAmount: state.totalAmount,
      theme: state.theme,
      members: state.members,
    };
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portion-flow-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.$schema !== 'portion-flow-v1') {
          showToast('エラー: 対応していないファイル形式です');
          return;
        }
        const imported: AppState = {
          totalAmount: parsed.totalAmount,
          theme: parsed.theme,
          members: parsed.members,
        };
        onImport(imported);
        showToast('インポートしました ✓');
      } catch {
        showToast('エラー: JSONの読み込みに失敗しました');
      }
      // Reset file input so same file can be re-imported
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="action-bar">
      <button className="action-btn copy-btn" onClick={handleCopy}>
        📋 コピー
      </button>
      <button className="action-btn export-btn" onClick={handleExport}>
        📤 エクスポート
      </button>
      <button className="action-btn import-btn" onClick={handleImportClick}>
        📥 インポート
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {toast && <div className="toast" role="alert">{toast}</div>}
      {fallbackText && (
        <div className="fallback-copy">
          <p>クリップボードへのアクセスができません。以下を手動でコピーしてください:</p>
          <textarea
            readOnly
            value={fallbackText}
            rows={8}
            onFocus={(e) => e.target.select()}
          />
          <button onClick={() => setFallbackText(null)}>閉じる</button>
        </div>
      )}
    </div>
  );
}
