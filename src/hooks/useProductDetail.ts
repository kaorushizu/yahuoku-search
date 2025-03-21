import { useState, useCallback } from 'react';
import { ProductDetailResponse } from '../types';

/**
 * 商品詳細情報を取得するカスタムフック
 */
export const useProductDetail = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productDetail, setProductDetail] = useState<ProductDetailResponse | null>(null);

  /**
   * 日付が現在から180日以内かどうかを判定する関数
   * @param endDate 終了日（フォーマット: 'YYYY年MM月DD日 HH時MM分' または 'YYYY/MM/DD'）
   */
  const isWithin180Days = (endDate: string): boolean => {
    try {
      // 日付フォーマットの変換
      let dateStr = endDate;
      if (endDate.includes('年')) {
        // 'YYYY年MM月DD日 HH時MM分' 形式の場合
        dateStr = endDate
          .replace(/年|月/g, '/')
          .replace(/日/g, '')
          .replace(/時|分/g, ':');
      }
      
      const endDateTime = new Date(dateStr).getTime();
      const currentTime = new Date().getTime();
      const daysDiff = (currentTime - endDateTime) / (1000 * 60 * 60 * 24);
      
      return daysDiff <= 180;
    } catch (e) {
      console.error('日付の判定中にエラーが発生しました:', e);
      // 日付の解析に失敗した場合、デフォルトでヤフオク公式APIを使用
      return true;
    }
  };

  /**
   * 商品詳細APIを呼び出す関数
   * @param auctionId オークションID
   * @param endDate 終了日
   */
  const fetchProductDetail = useCallback(async (auctionId: string, endDate: string = '') => {
    if (!auctionId) return;
    
    setIsLoading(true);
    setError(null);
    
    // 日付に基づいてAPIのエンドポイントを選択
    const useYahooApi = isWithin180Days(endDate);
    const apiUrl = useYahooApi
      ? `https://revathis-api.vercel.app/api/yahoo-auction-item?auctionId=${auctionId}`
      : `https://revathis-api.vercel.app/api/aucfree-item?auctionId=${auctionId}`;
    
    console.log(`【API情報】取得先: ${useYahooApi ? 'ヤフオク公式API' : 'オークフリーAPI'}, 商品ID: ${auctionId}, 落札日: ${endDate}`);
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data: ProductDetailResponse = await response.json();
      
      // デバッグ用：レスポンスを整形して出力
      console.log('%c【商品詳細API - レスポンス】', 'background: #4B0082; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
      console.log('商品ID:', data.auctionId);
      console.log('商品名:', data.title);
      console.log('価格:', data.price);
      console.log('終了日:', data.endDate);
      console.log('カテゴリ:', data.categories?.map(c => c.name).join(' > '));
      console.log('画像数:', data.images?.length || 0);
      console.log('%cレスポンス全体(JSON):', 'font-weight: bold;');
      console.log(JSON.stringify(data, null, 2));
      
      setProductDetail(data);
    } catch (err) {
      console.error('商品詳細の取得に失敗しました:', err);
      setError(err instanceof Error ? err.message : '商品詳細の取得に失敗しました');
      setProductDetail(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    productDetail,
    fetchProductDetail,
    clearProductDetail: () => setProductDetail(null)
  };
}; 