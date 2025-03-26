import React from 'react';
import { X, Search, Tag, Calculator, CheckCircle2, ArrowUpDown, Keyboard, Layout, MousePointer } from 'lucide-react';

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

              {/* キーボードショートカット */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Keyboard size={20} />
                  キーボードショートカット
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>以下のショートカットキーを使用して操作を効率化できます：</p>
                  <div className="bg-gray-50 rounded-lg p-4 mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-2">グローバルショートカット:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><span className="font-semibold">「Ctrl+S」</span>または<span className="font-semibold">「Command+S」</span>(Mac): 検索ボックスにフォーカスを移動</li>
                      <li>フォーカス移動時に自動的に検索ボックス内のテキストが全選択されます</li>
                      <li>日本語入力中はEnterキーの処理が最適化され、変換確定後に誤って検索が実行されることを防止します</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">商品詳細表示でのショートカット:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><span className="font-semibold">「a」</span>または<span className="font-semibold">「←」</span>キー: 前の画像に移動</li>
                      <li><span className="font-semibold">「s」</span>または<span className="font-semibold">「→」</span>キー: 次の画像に移動</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">画像拡大表示でのショートカット:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li><span className="font-semibold">「a」</span>または<span className="font-semibold">「←」</span>キー: 前の画像に移動</li>
                      <li><span className="font-semibold">「s」</span>または<span className="font-semibold">「→」</span>キー: 次の画像に移動</li>
                      <li><span className="font-semibold">「w」</span>または<span className="font-semibold">「↓」</span>キー: 拡大ビューを閉じる</li>
                      <li><span className="font-semibold">「スペース」</span>キー: 画像の拡大/縮小を切り替え</li>
                    </ul>
                  </div>
                  
                  <p className="mt-2 text-sm">※ショートカットキーは各モードや表示で左上のキーボードアイコンにカーソルを合わせると確認できます。</p>
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
                    <li><span className="font-semibold">含むキーワード</span>: 指定したキーワードを含む商品のみを表示</li>
                    <li><span className="font-semibold">除外キーワード</span>: 指定したキーワードを含む商品を除外</li>
                    <li><span className="font-semibold">タグ絞り込み</span>: 商品の状態や特徴（新品、未使用、送料無料など）でフィルタリング</li>
                    <li><span className="font-semibold">除外オプション</span>: 入札1件のみ、ジャンク品、セット商品、新品商品などを除外</li>
                    <li><span className="font-semibold">価格範囲フィルター</span>: 統計グラフの棒をクリックして特定の価格帯の商品だけを表示</li>
                  </ul>
                  <p>複数のフィルターを組み合わせて使用することもできます。適用中のフィルターは画面上部に表示され、個別に削除できます。</p>
                </div>
              </section>

              {/* 表示方法の切り替え */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Layout size={20} />
                  表示方法の切り替え
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>検索結果の表示方法を切り替えることができます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-semibold">グリッド表示</span>: 画像を中心としたカード形式の表示（デフォルト）</li>
                    <li><span className="font-semibold">テーブル表示</span>: 詳細情報を表形式で表示</li>
                    <li>商品名のテキストは選択してコピーできるようになっています</li>
                    <li>画像をクリックすると商品ページに移動します</li>
                    <li>テーブル表示では、行にカーソルを合わせると選択用チェックボックスが表示されます</li>
                    <li>テーブルのヘッダーにあるチェックボックスで全選択/全解除ができます</li>
                  </ul>
                </div>
              </section>

              {/* 画像と商品名の表示 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MousePointer size={20} />
                  画像と商品名の表示
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>商品の詳細情報を効率的に確認できる機能：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-semibold">画像の拡大表示</span>: テーブル表示時に商品画像にマウスを合わせると拡大表示されます</li>
                    <li><span className="font-semibold">商品名ツールチップ</span>: グリッドビューで商品名にマウスを合わせると全文がポップアップ表示されます</li>
                    <li>テーブルビューでは商品名がより広いスペースで表示されるため、ツールチップは表示されません</li>
                    <li>どちらの表示方法でも商品画像をクリックするとヤフオクの商品ページを開けます</li>
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
                  <p>グラフの棒をクリックすると、その価格帯の商品だけを表示するフィルターが適用されます。複数の価格帯を選択することも可能です。</p>
                  <p>フィルターが適用されると、選択されている価格帯の棒グラフは青色で表示されます。「選択した価格範囲をクリア」ボタンですべての価格フィルターを解除できます。</p>
                </div>
              </section>

              {/* 商品の選択と比較 */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  商品の選択と比較
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>商品を選択して比較することができます：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><span className="font-semibold">グリッド表示</span>: 商品カードの右上のチェックマークをクリックして選択</li>
                    <li><span className="font-semibold">テーブル表示</span>: 行のチェックボックスをクリックして選択、テーブルヘッダーのチェックボックスで全選択</li>
                    <li>選択した商品の統計情報が画面左上に表示されます</li>
                    
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
                    <li>価格の安い順（低 → 高）</li>
                    <li>価格の高い順（高 → 低）</li>
                  </ul>
                  <p>価格順ボタンをクリックするたびに「未ソート」→「安い順」→「高い順」→「未ソート」の順で切り替わります。</p>
                  <p>ソート状態はボタンの色とアイコンで確認できます。</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 