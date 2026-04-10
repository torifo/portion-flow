import { useState } from 'react';

interface Props {
  onClose: () => void;
}

type Tab = 'pc' | 'mobile';

const PC_STEPS = [
  {
    icon: '➕',
    title: 'メンバーを追加',
    desc: '「＋メンバー追加」ボタンでメンバーを追加。名前・比重・メモを編集できます。',
  },
  {
    icon: '⚖️',
    title: '合計値と比重を設定',
    desc: '上部の「合計値」に分配したい総数を入力。各カードのスライダーで比重（割合）を調整します。「語」ボタンから語呂合わせの数値を選ぶことも可能です。',
  },
  {
    icon: '📌',
    title: '固定値を設定（任意）',
    desc: 'カードの「固定値」チェックで特定メンバーに固定の配分値を設定できます。残りは他のメンバーで比重配分されます。',
  },
  {
    icon: '🗂️',
    title: 'グループを作成（任意）',
    desc: '「＋グループ作成」でグループを追加。カードをグループにドラッグ＆ドロップしてメンバーを割り当てます。グループに「配分固定」を設定するとグループ内で独立して配分されます。',
  },
  {
    icon: '📤',
    title: 'エクスポート / インポート',
    desc: '「エクスポート」でJSONファイルに保存（ファイル名を指定可能）。「インポート」で読み込んで再開できます。URLをコピーして共有することも可能です（URLにデータが含まれます）。',
  },
];

const MOBILE_STEPS = [
  {
    icon: '📱',
    title: 'カードは縦2列',
    desc: '画面が狭い場合はカードが2列表示になります。横スクロールはなく、縦にスクロールしてすべてのメンバーを確認できます。',
  },
  {
    icon: '➕',
    title: 'メンバー追加とグループ',
    desc: '画面下部の「＋メンバー追加」「＋グループ作成」ボタンを使います。グループ内メンバーはグループ内の追加ボタンで追加します。',
  },
  {
    icon: '🔢',
    title: 'スライダーの操作',
    desc: 'カード内のスライダーで比重を調整。数値入力欄は小画面では非表示になりますが、「語」ボタンから語呂合わせ数値を選べます。',
  },
  {
    icon: '↕️',
    title: 'ドラッグでグループ移動',
    desc: 'カードを長押しして別のグループエリアへドラッグ。画面端に近づくと自動スクロールします。グループ間の移動は複数回に分けて行えます。',
  },
  {
    icon: '💾',
    title: 'データの保存',
    desc: 'データはブラウザに自動保存されます（LocalStorage）。共有するにはURLをコピーして送ると相手も同じデータで開けます。',
  },
];

export function GuideModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('pc');
  const steps = tab === 'pc' ? PC_STEPS : MOBILE_STEPS;

  return (
    <div className="fallback-overlay" onClick={onClose}>
      <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
        <div className="guide-header">
          <div>
            <p className="fallback-title">使用ガイド</p>
            <p className="constraint-hint">Portion-Flow の基本的な使い方</p>
          </div>
          <button className="goroawase-close" onClick={onClose}>✕</button>
        </div>

        <div className="guide-tabs">
          <button
            className={`guide-tab${tab === 'pc' ? ' active' : ''}`}
            onClick={() => setTab('pc')}
          >
            🖥️ PC / タブレット
          </button>
          <button
            className={`guide-tab${tab === 'mobile' ? ' active' : ''}`}
            onClick={() => setTab('mobile')}
          >
            📱 スマートフォン
          </button>
        </div>

        <div className="guide-body">
          {steps.map((s, i) => (
            <div key={i} className="guide-step">
              <div className="guide-step-icon">{s.icon}</div>
              <div>
                <p className="guide-step-title">{s.title}</p>
                <p className="guide-step-desc">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="guide-footer">
          <p className="constraint-hint">
            データはURL・ブラウザに自動保存。JSONエクスポートで確実にバックアップできます。
          </p>
        </div>
      </div>
    </div>
  );
}
