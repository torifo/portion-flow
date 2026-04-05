/**
 * 語呂合わせ数値リスト
 *
 * ここにエントリを追加するだけで「語呂合わせパネル」と絵文字インジケーターに自動反映されます。
 *
 * ── 追加方法 ────────────────────────────────────────────
 *   { value: 16,  label: 'いろ（色）',    emoji: '🎨', category: 'fun' },
 *
 * ── フィールド説明 ───────────────────────────────────────
 *   value    : 数値（配分値やウェイトとして使いたい数）
 *   label    : 語呂読み・意味（日本語で短く）
 *   emoji    : 表示する絵文字
 *   category : 'greeting' | 'feeling' | 'lucky' | 'achievement' | 'fun'
 * ────────────────────────────────────────────────────────
 */

export type GoroawaseCategory =
  | 'greeting'     // あいさつ系
  | 'feeling'      // 感情・雰囲気系
  | 'lucky'        // 縁起・ラッキー系
  | 'achievement'  // 達成・評価系
  | 'fun';         // ダジャレ・遊び系

export interface PagerEntry {
  value: number;
  label: string;
  emoji: string;
  category: GoroawaseCategory;
}

export const PAGER_MAP: PagerEntry[] = [
  // ── greeting ────────────────────────────────────────
  { value: 39,   label: 'サンキュー',     emoji: '🙏', category: 'greeting' },
  { value: 4649, label: 'ヨロシク',       emoji: '🤝', category: 'greeting' },
  { value: 810,  label: 'ハロー',         emoji: '👋', category: 'greeting' },

  // ── feeling ─────────────────────────────────────────
  { value: 25,   label: 'ニコニコ',       emoji: '😊', category: 'feeling' },
  { value: 55,   label: 'ゴーゴー',       emoji: '🚀', category: 'feeling' },
  { value: 88,   label: 'パチパチ',       emoji: '👏', category: 'feeling' },
  { value: 99,   label: 'ギリギリ',       emoji: '😅', category: 'feeling' },
  { value: 117,  label: 'イイナ',         emoji: '👍', category: 'feeling' },
  { value: 49,   label: 'ヨク（良く）',   emoji: '😤', category: 'feeling' },

  // ── lucky ────────────────────────────────────────────
  { value: 7,    label: 'ラッキー7',      emoji: '7️⃣', category: 'lucky' },
  { value: 77,   label: 'ダブルラッキー', emoji: '🍀', category: 'lucky' },
  { value: 777,  label: 'トリプルセブン', emoji: '🎰', category: 'lucky' },
  { value: 8,    label: 'はち（八方）',   emoji: '🎋', category: 'lucky' },

  // ── achievement ──────────────────────────────────────
  { value: 1,    label: 'いち（一番）',   emoji: '🥇', category: 'achievement' },
  { value: 100,  label: '完璧・満点',     emoji: '💯', category: 'achievement' },
  { value: 1000, label: 'セン（千里）',   emoji: '🏆', category: 'achievement' },

  // ── fun ──────────────────────────────────────────────
  { value: 4,    label: 'シ（四季）',     emoji: '🌸', category: 'fun' },
  { value: 56,   label: 'ゴロ（語呂）',   emoji: '🔤', category: 'fun' },
  { value: 893,  label: 'ヤクザ？',       emoji: '😂', category: 'fun' },
];

export const CATEGORY_LABELS: Record<GoroawaseCategory, string> = {
  greeting:    'あいさつ',
  feeling:     '感情・雰囲気',
  lucky:       '縁起・ラッキー',
  achievement: '達成・評価',
  fun:         'ダジャレ・遊び',
};

export function findPagerEntry(value: number): PagerEntry | undefined {
  return PAGER_MAP.find((e) => e.value === value);
}
