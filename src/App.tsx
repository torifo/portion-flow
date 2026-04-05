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

  const [totalInput, setTotalInput] = useState(String(state.totalAmount));
  const [totalError, setTotalError] = useState('');
  const [fixedError, setFixedError] = useState('');
  const [results, setResults] = useState<DistributionResult[]>([]);

  useEffect(() => {
    setTotalInput(String(state.totalAmount));
  }, [state.totalAmount]);

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
    if (!isNaN(n) && n >= 1) {
      setTotalAmount(n);
      setTotalError('');
    } else {
      setTotalError('1以上の整数を入力してください');
    }
  };

  const totalPortioned = results.reduce((s, r) => s + r.portion, 0);
  const doneCount = state.members.filter((m) => m.done).length;

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
          <div className="summary-field">
            <span className="summary-label">値</span>
            <div className="total-input-wrap">
              <input
                id="total-input"
                className={`total-input${totalError ? ' error' : ''}`}
                type="number"
                min={1}
                value={totalInput}
                onChange={handleTotalChange}
              />
              {totalError && <span className="field-error">{totalError}</span>}
            </div>
          </div>

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
