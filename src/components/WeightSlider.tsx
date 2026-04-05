import { useState, useEffect, type ChangeEvent } from 'react';

interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  color?: string;
}

export function WeightSlider({ value, onChange, disabled = false, color }: Props) {
  const [inputVal, setInputVal] = useState(String(value));

  useEffect(() => {
    setInputVal(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0 && n <= 100) {
      onChange(n);
    } else {
      setInputVal(String(value));
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  return (
    <div className="weight-slider">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="slider-input"
        style={color ? { accentColor: color } : undefined}
      />
      <input
        type="number"
        min={0}
        max={100}
        value={inputVal}
        disabled={disabled}
        className="slider-number-input"
        onChange={handleInputChange}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && commit(inputVal)}
      />
    </div>
  );
}
