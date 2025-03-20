export interface SearchParams {
  keyword: string;
  page?: number;
  negative_keyword?: string;
  status?: string;
  seller?: string;
  min?: string;
  max?: string;
}

export interface AuctionItem {
  オークションID: string;
  商品名: string;
  落札金額: number;
  画像URL: string;
  入札数: number;
  終了日: string;
}

export interface SearchResponse {
  items: AuctionItem[];
  total_count: number;
  page: number;
  page_total: number;
}

export async function searchAuctions(params: SearchParams): Promise<SearchResponse> {
  const apiUrl = 'https://revathis-api.vercel.app/api/aucfree';

  const queryParams = new URLSearchParams();
  
  // パラメータを追加
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value.toString());
    }
  });
  
  const response = await fetch(`${apiUrl}?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Search failed with status: ${response.status}`);
  }
  
  return response.json();
} 