/**
 * ツールチップコンポーネントの型定義
 * ホバー時に追加情報を表示するための設定
 */
export interface TooltipProps {
  text: string;                // 表示するツールチップのテキスト
  children: React.ReactNode;   // ツールチップを表示する対象の要素
} 