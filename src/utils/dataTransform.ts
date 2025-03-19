import { AuctionItem } from '../types/product';

/**
 * APIから受け取った日本語プロパティの商品データを統一された型に変換
 * @param item 元の商品データ
 * @returns 統一された型の商品データ
 */
export function transformAuctionItem(item: any): AuctionItem {
  return {
    id: item.オークションID,
    title: item.商品名,
    currentPrice: item.現在価格 || item.落札金額,
    buyItNowPrice: item.即決価格,
    bidCount: item.入札数,
    endTime: item.残り時間 || item.終了日,
    imageUrl: item.商品画像URL || item.画像URL,
    itemUrl: item.商品URL || `https://page.auctions.yahoo.co.jp/jp/auction/${item.オークションID}`,
    tags: item.タグ || [],
  };
}

/**
 * 統一された型の商品データを元の日本語プロパティの形式に変換
 * @param item 統一された型の商品データ
 * @returns 元の形式の商品データ
 */
export function reverseTransformAuctionItem(item: AuctionItem): any {
  return {
    オークションID: item.id,
    商品名: item.title,
    現在価格: item.currentPrice,
    即決価格: item.buyItNowPrice,
    入札数: item.bidCount,
    残り時間: item.endTime,
    商品画像URL: item.imageUrl,
    商品URL: item.itemUrl,
    タグ: item.tags,
  };
} 