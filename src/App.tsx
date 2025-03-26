import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 新しく作成したコンポーネントをインポート
import SearchPage from './components/search/SearchPage';
import ResultsPage from './components/search/ResultsPage';

function App() {
  // グローバルなキーボードショートカットを設定
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+SまたはCommand+S（Macの場合）
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // ブラウザのデフォルト動作をキャンセル
        
        // 検索ボックスを探して、存在すれば選択（フォーカス）
        const searchInput = document.querySelector('input[type="text"][inputMode="search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select(); // テキスト全選択
          console.log('検索ボックスにフォーカスしました');
        }
      }
    };
    
    // イベントリスナーを登録
    document.addEventListener('keydown', handleKeyDown);
    
    // クリーンアップ関数
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="app-container min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/search" element={<ResultsPage />} />
        <Route path="/home" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  );
}

export default App;