import React from 'react';
import { X, Search, Tag, Calculator, CheckCircle2, ArrowUpDown } from 'lucide-react';

interface HelpPageProps {
  onClose: () => void;
}

export default function HelpPage({ onClose }: HelpPageProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ヘルプ</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-8">
              {/* 基本的な検索方法 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Search size={20} />
                  基本的な検索方法
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>1. 検索ボックスに商品名を入力します</p>
                  <p>2. 検索ボタンをクリックするか、Enterキーを押して検索を実行します</p>
                  <p>3. 過去の検索履歴は検索ボックスをクリックすると表示されます</p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">詳細検索オプション:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>除外キーワード: 特定のワードを含む商品を除外</li>
                      <li>商品の状態: 新品/中古の選択</li>
                      <li>出品者ID: 特定の出品者の商品のみを表示</li>
                      <li>価格範囲: 最低価格と最高価格の設定</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 絞り込み機能 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag size={20} />
                  絞り込み機能
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>検索結果は以下の方法で絞り込むことができます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>複数入札のみ表示: 入札が2件以上ある商品のみを表示</li>
                    <li>ジャンクを除外: ジャンク品を検索結果から除外</li>
                    <li>キーワード絞り込み: 検索結果をさらにキーワードで絞り込み</li>
                    <li>商品タグ: 商品の状態や特徴（新品、未使用、送料無料など）でフィルタリング</li>
                  </ul>
                </div>
              </section>

              {/* 統計情報の見方 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calculator size={20} />
                  統計情報の見方
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>検索結果の統計情報は以下の項目で確認できます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>中央値: 価格帯の中央に位置する金額</li>
                    <li>平均値: すべての商品の平均価格</li>
                    <li>最高値: 最も高い落札価格</li>
                    <li>最安値: 最も安い落札価格</li>
                  </ul>
                  <p className="mt-2">グラフ表示では価格帯ごとの商品数分布を確認できます。</p>
                </div>
              </section>

              {/* 商品の選択と比較 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  商品の選択と比較
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>商品カードの右上のチェックマークをクリックして商品を選択できます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>選択した商品の統計情報が画面左上に表示されます</li>
                    <li>「選択した商品のみ表示」ボタンで選択商品だけを表示できます</li>
                    <li>クリアボタンで選択をリセットできます</li>
                  </ul>
                </div>
              </section>

              {/* 並び替え */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowUpDown size={20} />
                  並び替え機能
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>検索結果は価格順に並び替えることができます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>価格の安い順</li>
                    <li>価格の高い順</li>
                  </ul>
                  <p>並び替えボタンをクリックするたびに順序が切り替わります。</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 