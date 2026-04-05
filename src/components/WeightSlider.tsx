interface Props {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  color?: string;
}

export function WeightSlider({ value, onChange, disabled = false, color }: Props) {
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
      <span className="slider-value">{value}</span>
    </div>
  );
}
