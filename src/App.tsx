import { useState, useEffect } from 'react';
import { usePortionState } from './hooks/usePortionState';
import { useTheme } from './hooks/useTheme';
import { distribute } from './core/distributor';
import { PortionList } from './components/PortionList';
import { ActionBar } from './components/ActionBar';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import type { DistributionResult } from './types';
import './App.css';

export default function App() {
  const {
    state,
    setTotalAmount,
    setValueConstraint,
    setTheme,
    addMember,
    removeMember,
    updateMember,
    addGroup,
    updateGroup,
    removeGroup,
    assignGroup,
    importState,
  } = usePortionState();

  const { setTheme: applyThemeCss } = useTheme();

  useEffect(() => {
    applyThemeCss(state.theme);
  }, [state.theme]);

  const handleThemeChange = (t: typeof state.theme) => {
    setTheme(t);
    applyThemeCss(t);
  };

  const vc = state.valueConstraint;

  const [totalInput, setTotalInput] = useState(String(state.totalAmount));
  const [totalError, setTotalError] = useState('');
  const [fixedError, setFixedError] = useState('');
  const [results, setResults] = useState<DistributionResult[]>([]);
  const [showConstraintEditor, setShowConstraintEditor] = useState(false);

  // constraint range inputs (local only, committed on blur)
  const [minInput, setMinInput] = useState(String(vc.min));
  const [maxInput, setMaxInput] = useState(String(vc.max));

  useEffect(() => {
    setTotalInput(String(state.totalAmount));
  }, [state.totalAmount]);

  useEffect(() => {
    setMinInput(String(vc.min));
    setMaxInput(String(vc.max));
  }, [vc.min, vc.max]);

  useEffect(() => {
    try {
      const r = distribute(state.totalAmount, state.members);
      setResults(r);
      setFixedError('');
    } catch (e) {
      if (e instanceof Error && e.message === 'FIXED_EXCEEDS_TOTAL') {
        setFixedError('固定値の合計が合計値を超えています');
        setResults(state.members.map((m) => ({ id: m.id, portion: 0, remainder: 0 })));
      }
    }
  }, [state.totalAmount, state.members]);

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setTotalInput(raw);
    const n = parseInt(raw, 10);
    if (isNaN(n) || n < 1) {
      setTotalError('1以上の整数を入力してください');
      return;
    }
    if (vc.enabled && n > vc.max) {
      setTotalError(`制限により最大 ${vc.max} です`);
      return;
    }
    if (vc.enabled && n < vc.min) {
      setTotalError(`制限により最小 ${vc.min} です`);
      return;
    }
    setTotalAmount(n);
    setTotalError('');
  };

  const commitMin = () => {
    const n = parseInt(minInput, 10);
    if (!isNaN(n) && n >= 0 && n < vc.max) {
      setValueConstraint({ min: n });
    } else {
      setMinInput(String(vc.min));
    }
  };

  const commitMax = () => {
    const n = parseInt(maxInput, 10);
    if (!isNaN(n) && n > vc.min) {
      setValueConstraint({ max: n });
      // 現在の totalAmount が新しい max を超えていれば丸める
      if (state.totalAmount > n) setTotalAmount(n);
    } else {
      setMaxInput(String(vc.max));
    }
  };

  const totalPortioned = results.reduce((s, r) => s + r.portion, 0);
  const doneCount = state.members.filter((m) => m.done).length;

  // 制限違反の警告
  const constraintWarning =
    vc.enabled && state.totalAmount > vc.max
      ? `値が制限の最大値（${vc.max}）を超えています`
      : vc.enabled && state.totalAmount < vc.min
      ? `値が制限の最小値（${vc.min}）を下回っています`
      : null;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">⚖️</span>
          <h1 className="app-title">Portion-Flow</h1>
        </div>
        <ThemeSwitcher current={state.theme} onChange={handleThemeChange} />
      </header>

      <main className="app-main">
        <div className="summary-bar">
          {/* 値 + 制限設定 */}
          <div className="summary-field">
            <span className="summary-label">値</span>
            <div className="total-input-wrap">
              <input
                id="total-input"
                className={`total-input${totalError || constraintWarning ? ' error' : ''}`}
                type="number"
                min={vc.enabled ? vc.min : 1}
                max={vc.enabled ? vc.max : undefined}
                value={totalInput}
                onChange={handleTotalChange}
              />
              {vc.enabled && (
                <span className="constraint-badge">
                  {vc.min}〜{vc.max}
                </span>
              )}
              <button
                className={`constraint-toggle-btn${showConstraintEditor ? ' active' : ''}`}
                onClick={() => setShowConstraintEditor((v) => !v)}
                title="値の制限を設定"
                aria-label="制限設定"
              >
                ⚙
              </button>
            </div>
            {(totalError || constraintWarning) && (
              <span className="field-error">{totalError || constraintWarning}</span>
            )}
          </div>

          {/* 制限エディタ（展開時） */}
          {showConstraintEditor && (
            <div className="constraint-editor">
              <label className="constraint-enabled-label">
                <input
                  type="checkbox"
                  checked={vc.enabled}
                  onChange={(e) => setValueConstraint({ enabled: e.target.checked })}
                />
                <span>値の範囲を制限する</span>
              </label>
              {vc.enabled && (
                <div className="constraint-range">
                  <span className="constraint-range-label">最小</span>
                  <input
                    className="constraint-num-input"
                    type="number"
                    min={0}
                    value={minInput}
                    onChange={(e) => setMinInput(e.target.value)}
                    onBlur={commitMin}
                    onKeyDown={(e) => e.key === 'Enter' && commitMin()}
                  />
                  <span className="constraint-range-sep">〜</span>
                  <span className="constraint-range-label">最大</span>
                  <input
                    className="constraint-num-input"
                    type="number"
                    min={1}
                    value={maxInput}
                    onChange={(e) => setMaxInput(e.target.value)}
                    onBlur={commitMax}
                    onKeyDown={(e) => e.key === 'Enter' && commitMax()}
                  />
                  <button
                    className="constraint-reset-btn"
                    onClick={() => {
                      setValueConstraint({ min: 0, max: 120 });
                    }}
                    title="デフォルト（0〜120）に戻す"
                  >
                    リセット
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 統計 */}
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-value">{state.members.length}</span>
              <span className="stat-label">人</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-value">{totalPortioned.toLocaleString()}</span>
              <span className="stat-label">配分済</span>
            </div>
            {doneCount > 0 && (
              <>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">{doneCount}</span>
                  <span className="stat-label">完了</span>
                </div>
              </>
            )}
          </div>

          {fixedError && <p className="error-banner">{fixedError}</p>}
        </div>

        <ActionBar state={state} results={results} onImport={importState} />

        <PortionList
          members={state.members}
          results={results}
          groups={state.groups}
          onAdd={addMember}
          onRemove={removeMember}
          onUpdate={updateMember}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onRemoveGroup={removeGroup}
          onAssignGroup={assignGroup}
        />
      </main>
    </div>
  );
}
