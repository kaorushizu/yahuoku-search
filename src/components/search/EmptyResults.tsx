import React from 'react';

interface EmptyResultsProps {
  keyword: string;
}

/**
 * 検索結果が0件の場合に表示するコンポーネント
 */
const EmptyResults: React.FC<EmptyResultsProps> = ({ keyword }) => {
  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-20rem)]">
      <div className="text-lg font-medium text-gray-700 mb-2">検索結果がありません</div>
      <div className="text-gray-500">
        「{keyword}」に一致する商品は見つかりませんでした
      </div>
      <div className="text-gray-500 mt-2">
        別のキーワードで検索してみてください
      </div>
    </div>
  );
};

export default EmptyResults; 