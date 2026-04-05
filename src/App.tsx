import { useState, useEffect, useRef } from 'react';
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
    importState,
  } = usePortionState();

  const { setTheme: applyThemeCss } = useTheme();

  const prevTheme = useRef(state.theme);
  useEffect(() => {
    if (prevTheme.current !== state.theme) {
      prevTheme.current = state.theme;
    }
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
        setFixedError('固定額の合計が総額を超えています');
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">💰 Portion-Flow</h1>
        <ThemeSwitcher current={state.theme} onChange={handleThemeChange} />
      </header>

      <main className="app-main">
        <div className="total-section">
          <label className="total-label" htmlFor="total-input">
            総額
          </label>
          <input
            id="total-input"
            className={`total-input ${totalError ? 'error' : ''}`}
            type="number"
            min={1}
            value={totalInput}
            onChange={handleTotalChange}
          />
          {totalError && <p className="error-msg">{totalError}</p>}
          {fixedError && <p className="error-msg">{fixedError}</p>}
        </div>

        <ActionBar state={state} results={results} onImport={importState} />

        <PortionList
          members={state.members}
          results={results}
          onAdd={addMember}
          onRemove={removeMember}
          onUpdate={updateMember}
        />
      </main>
    </div>
  );
}
