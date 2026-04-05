import { useState, useEffect, type ChangeEvent } from 'react';
import { GoroawaseModal } from './GoroawaseModal';

interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  color?: string;
}

export function WeightSlider({ value, onChange, disabled = false, color }: Props) {
  const [inputVal, setInputVal] = useState(String(value));
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) {
      onChange(n);
    } else {
      setInputVal(String(value));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  return (
    <>
      <div className="weight-slider">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.min(value, 100)}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="slider-input"
          style={color ? { accentColor: color } : undefined}
        />
        <button
          className="goroawase-trigger-btn"
          disabled={disabled}
          onClick={() => setShowModal(true)}
          title="語呂合わせ数値から選択"
          type="button"
        >
          語
        </button>
        <input
          type="number"
          min={0}
          value={inputVal}
          disabled={disabled}
          className="slider-number-input"
          onChange={handleInputChange}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && commit(inputVal)}
        />
      </div>

      {showModal && (
        <GoroawaseModal
          onSelect={(v) => { onChange(v); setInputVal(String(v)); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
