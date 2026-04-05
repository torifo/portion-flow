
interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

export function WeightSlider({ value, onChange, disabled = false }: Props) {
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
      />
      <span className="slider-value">{value}</span>
    </div>
  );
}
