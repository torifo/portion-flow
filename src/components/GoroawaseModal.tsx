import { PAGER_MAP, CATEGORY_LABELS, type GoroawaseCategory } from '../core/pagerIndicator';

interface Props {
  onSelect: (value: number) => void;
  onClose: () => void;
}

const CATEGORY_ORDER: GoroawaseCategory[] = [
  'greeting', 'feeling', 'lucky', 'achievement', 'fun',
];

export function GoroawaseModal({ onSelect, onClose }: Props) {
  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    entries: PAGER_MAP.filter((e) => e.category === cat),
  })).filter((g) => g.entries.length > 0);

  return (
    <div className="goroawase-overlay" onClick={onClose}>
      <div className="goroawase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="goroawase-modal-header">
          <div>
            <h3 className="goroawase-title">語呂合わせ数値</h3>
            <p className="goroawase-subtitle">クリックでウェイトに適用</p>
          </div>
          <button className="goroawase-close" onClick={onClose} aria-label="閉じる">✕</button>
        </div>

        <div className="goroawase-body">
          {byCategory.map(({ cat, entries }) => (
            <section key={cat} className="goroawase-category">
              <h4 className="goroawase-category-label">{CATEGORY_LABELS[cat]}</h4>
              <div className="goroawase-grid">
                {entries.map((entry) => (
                  <button
                    key={entry.value}
                    className="goroawase-item"
                    onClick={() => { onSelect(entry.value); onClose(); }}
                  >
                    <span className="goroawase-emoji">{entry.emoji}</span>
                    <span className="goroawase-value">{entry.value.toLocaleString()}</span>
                    <span className="goroawase-label">{entry.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="goroawase-contrib-hint">
          💡 <code>src/core/pagerIndicator.ts</code> にエントリを追加するだけで拡張できます
        </p>
      </div>
    </div>
  );
}
