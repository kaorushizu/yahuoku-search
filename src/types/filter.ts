/**
 * フィルタオプションのインターフェース
 */
export interface FilterOptions {
  selectedTags: string[];       // 選択されたタグ
  excludeMultipleBids: boolean; // 入札1を除外するか
  excludeJunk: boolean;         // ジャンクを除外するか
  excludeKeywords: string[];    // 除外するキーワード
  excludeSets: boolean;         // セットを除外するか
  excludeNew: boolean;          // 新品を除外するか
  filterKeywords: string[];     // 含むキーワード
} 