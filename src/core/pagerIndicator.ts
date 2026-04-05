export interface PagerEntry {
  value: number;
  label: string;
  emoji: string;
}

export const PAGER_MAP: PagerEntry[] = [
  { value: 39,   label: 'サンキュー', emoji: '🙏' },
  { value: 88,   label: 'パチパチ',   emoji: '👏' },
  { value: 25,   label: 'ニコニコ',   emoji: '😊' },
  { value: 117,  label: 'イイナ',     emoji: '👍' },
  { value: 4649, label: 'ヨロシク',   emoji: '🤝' },
  { value: 100,  label: '完璧',       emoji: '💯' },
  { value: 777,  label: 'ラッキー',   emoji: '🎰' },
];

export function findPagerEntry(value: number): PagerEntry | undefined {
  return PAGER_MAP.find((e) => e.value === value);
}
