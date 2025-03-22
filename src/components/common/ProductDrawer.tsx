import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Package2, Calendar, Tag, BarChart4, ShoppingBag, Clock, Info, ZoomIn, ZoomOut, Image } from 'lucide-react';
import { AuctionItem, ProductTag, ProductDetailResponse } from '../../types';

// Swiperのインポート
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom, FreeMode, Thumbs } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: AuctionItem | null;
  productDetail: ProductDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  getProductTags: (title: string) => ProductTag[];
  getAuctionUrl: (id: string, endDate: string) => string;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  onClose,
  product,
  productDetail,
  isLoading,
  error,
  getProductTags,
  getAuctionUrl
}) => {
  const [showZoom, setShowZoom] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomThumbsSwiper, setZoomThumbsSwiper] = useState<SwiperType | null>(null);
  const [zoomSwiper, setZoomSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);

  // ドロワーが閉じられたらリセット
  useEffect(() => {
    if (!isOpen) {
      setShowZoom(false);
      setActiveIndex(0);
    }
  }, [isOpen]);

  // ドラッグによるサイズ調整機能
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // 画面の右端からマウス位置を引いて幅を計算
      const newWidth = window.innerWidth - e.clientX;
      
      // 幅の最小値と最大値を制限
      const limitedWidth = Math.min(Math.max(newWidth, 400), window.innerWidth * 0.9);
      setDrawerWidth(limitedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // イベントリスナーの登録
    const resizer = resizerRef.current;
    if (resizer) {
      resizer.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    // クリーンアップ関数
    return () => {
      if (resizer) {
        resizer.removeEventListener('mousedown', handleMouseDown);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isOpen, isDragging]);

  // ショートカットキーの設定
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 拡大モードの場合
      if (showZoom && zoomSwiper) {
        switch (e.key.toLowerCase()) {
          case 'a':
          case 'arrowleft':
            zoomSwiper.slidePrev();
            break;
          case 's':
          case 'arrowright':
            zoomSwiper.slideNext();
            break;
          case 'w':
          case 'arrowdown':
            closeZoomView();
            break;
          case ' ':
            // スペースキーで拡大/縮小を切り替え
            const zoomContainer = document.querySelector('.swiper-zoom-container');
            if (zoomContainer) {
              const isZoomed = zoomContainer.classList.contains('zoomed');
              if (isZoomed) {
                zoomSwiper.zoom.out();
              } else {
                zoomSwiper.zoom.in();
              }
            }
            break;
        }
      } 
      // 通常モードの場合
      else if (mainSwiper) {
        switch (e.key.toLowerCase()) {
          case 'a':
          case 'arrowleft':
            mainSwiper.slidePrev();
            break;
          case 's':
          case 'arrowright':
            mainSwiper.slideNext();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showZoom, zoomSwiper, mainSwiper]);

  if (!isOpen || (!product && !productDetail)) return null;

  // 商品詳細がある場合はそれを使用し、なければ基本情報を使用
  const title = productDetail?.title || product?.商品名 || '';
  const tags = getProductTags(title);
  const price = productDetail?.price || product?.落札金額 || 0;
  const bidCount = productDetail?.bidCount || product?.入札数 || 0;
  const endDate = productDetail?.endDate || product?.終了日 || '';
  const auctionId = productDetail?.auctionId || product?.オークションID || '';
  
  // APIソースを判定（URLに基づいて）
  const isAucfree = productDetail?.url ? productDetail.url.includes('aucfree.com') : false;
  
  // 商品URLの取得
  const auctionUrl = productDetail?.url || (product ? getAuctionUrl(product.オークションID, product.終了日) : '');

  // 画像配列の取得
  const images = productDetail?.images || (product?.画像URL ? [product.画像URL] : []);

  // オークフリー商品の1枚目サムネイル画像URL生成
  const getAucfreeThumbnailUrl = (id: string) => {
    // IDの最初の文字を取得（uやfなどのプレフィックス）
    const prefix = id.charAt(0);
    return `https://auctions.afimg.jp/item_data/thumbnail/20240527/yahoo/c/${prefix}${id.substring(1)}.jpg`;
  };

  // オークフリーのサムネイル画像URL
  const aucfreeThumbnailUrl = isAucfree && auctionId ? getAucfreeThumbnailUrl(auctionId) : '';

  // 画像拡大ビューを開く
  const openZoomView = () => {
    // オークフリーの場合は拡大表示しない
    if (isAucfree) return;
    setShowZoom(true);
  };

  // 画像拡大ビューを閉じる
  const closeZoomView = () => {
    setShowZoom(false);
  };

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* リサイザー */}
      <div
        ref={resizerRef}
        className="fixed left-0 top-0 bottom-0 w-4 bg-gray-200 hover:bg-gray-300 cursor-ew-resize z-[51] transition-opacity flex items-center justify-center"
        style={{ 
          left: `calc(100% - ${drawerWidth}px - 4px)`,
          display: isOpen ? 'block' : 'none'
        }}
      >
        <div className="h-full flex items-center justify-center">
          <div className="w-0.5 h-16 bg-gray-400 rounded-full"></div>
        </div>
      </div>

      {/* ドロワー */}
      <div 
        className={`fixed right-0 top-0 h-full bg-white shadow-lg z-50 overflow-y-auto transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{ width: `${drawerWidth}px` }}
      >
        {isLoading ? (
          // ローディング表示
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          // エラー表示
          <div className="px-6 py-8 text-center text-red-600">
            <div className="mb-3">
              <Info size={48} className="mx-auto" />
            </div>
            <p className="text-lg">{error}</p>
            <p className="mt-3 text-sm text-gray-600">基本情報のみ表示します</p>
          </div>
        ) : (
          // 商品情報 - 配置順序を変更
          <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto px-6 py-6 space-y-8">
              {/* Swiperスライダー */}
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                {isAucfree ? (
                  // オークフリーの場合は1枚目のサムネイル画像と注意書きを表示
                  <div className="relative aspect-video">
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      {aucfreeThumbnailUrl ? (
                        <div className="mb-6 relative">
                          <img
                            src={aucfreeThumbnailUrl}
                            alt={title || 'タイトルなし'}
                            className="max-w-full max-h-[300px] object-contain"
                            onError={(e) => {
                              // エラー時はアイコン表示に切り替え
                              (e.currentTarget.style.display = 'none');
                              document.getElementById('fallback-icon')?.classList.remove('hidden');
                            }}
                          />
                          <div id="fallback-icon" className="hidden">
                            <Image size={80} className="text-gray-400 mb-4" />
                          </div>
                        </div>
                      ) : (
                        <Image size={80} className="text-gray-400 mb-6" />
                      )}
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 w-full">
                        <p className="text-amber-800 text-sm">
                          この商品は2枚目以降の画像を表示できません。
                          <a 
                            href={auctionUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            オークフリー
                          </a>
                          で確認してください。
                        </p>
                      </div>
                    </div>
                  </div>
                ) : images.length > 0 ? (
                  <div className="relative aspect-video">
                    {/* メインスライダー */}
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={10}
                      navigation
                      pagination={{ clickable: true, dynamicBullets: true }}
                      onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                      onSwiper={setMainSwiper}
                      loop={images.length > 1}
                      className="h-full rounded-lg"
                    >
                      {images.map((src, index) => (
                        <SwiperSlide key={index} className="flex items-center justify-center">
                          <div 
                            className="w-full h-full flex items-center justify-center cursor-zoom-in"
                            onClick={openZoomView}
                          >
                            <img
                              src={src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                              alt={`${title || 'タイトルなし'} - 画像 ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                              }}
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                      
                      {/* ズームアイコン */}
                      <button
                        className="absolute right-4 top-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                        onClick={openZoomView}
                      >
                        <ZoomIn size={20} />
                      </button>
                    </Swiper>
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center h-full text-gray-400">
                    画像はありません
                  </div>
                )}
              </div>
              
              {/* 商品名とタグ */}
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                
                {/* タグ */}
                <div className="flex flex-wrap gap-2">
                  {tags.length > 0 && tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* 詳細情報 - 落札金額を含める */}
              <div className="space-y-6">
                {/* 価格情報 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-lg">落札価格</span>
                    <span className="text-3xl font-bold text-gray-900">
                      ¥{price.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 開始価格（API情報） */}
                  {productDetail?.startPrice && (
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span className="text-gray-500">開始価格</span>
                      <span className="text-gray-700">¥{productDetail.startPrice.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                
                {/* その他の詳細情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 商品詳細情報 */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-700 mb-2">商品情報</h3>
                    <ul className="space-y-3">
                      {/* 商品状態（API情報） */}
                      {productDetail?.condition && (
                        <li className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <Tag size={20} />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-gray-600">商品の状態</span>
                            <span className="font-medium text-gray-900">{productDetail.condition}</span>
                          </div>
                        </li>
                      )}
                      
                      <li className="flex items-center gap-3">
                        <div className="text-gray-400">
                          <Package2 size={20} />
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-600">入札数</span>
                          <span className="font-medium text-gray-900">{bidCount}件</span>
                        </div>
                      </li>
                      
                      {/* ウォッチリスト数（API情報） */}
                      {productDetail?.watchListNum !== undefined && (
                        <li className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <ShoppingBag size={20} />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-gray-600">ウォッチ数</span>
                            <span className="font-medium text-gray-900">{productDetail.watchListNum}人</span>
                          </div>
                        </li>
                      )}
                      
                      {/* 入札者数（API情報） */}
                      {productDetail?.biddersNum !== undefined && (
                        <li className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <Tag size={20} />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-gray-600">入札者数</span>
                            <span className="font-medium text-gray-900">{productDetail.biddersNum}人</span>
                          </div>
                        </li>
                      )}
                      
                      <li className="flex items-center gap-3">
                        <div className="text-gray-400">
                          <Clock size={20} />
                        </div>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-gray-600">終了日時</span>
                          <span className="font-medium text-gray-900">{endDate}</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    {/* カテゴリー情報（API情報） */}
                    {productDetail?.categories && productDetail.categories.length > 0 && (
                      <div>
                        <h3 className="text-base font-medium text-gray-700 mb-2">カテゴリー</h3>
                        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                          {productDetail.categories.map((category, index) => (
                            <span key={category.id}>
                              {category.name}
                              {index < productDetail.categories.length - 1 && ' > '}
                            </span>
                          ))}
                          
                          {/* カテゴリID表示 */}
                          {productDetail.categories.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              カテゴリID: {productDetail.categories[productDetail.categories.length - 1].id}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* 市場分析情報（サンプル） */}
                    <div>
                      <h3 className="text-base font-medium text-gray-700 mb-2">市場分析</h3>
                      <ul className="space-y-3 bg-gray-50 p-3 rounded">
                        <li className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <BarChart4 size={20} />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-gray-600">平均落札価格</span>
                            <span className="font-medium text-gray-900">¥12,800</span>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="text-gray-400">
                            <Tag size={20} />
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-gray-600">相場比較</span>
                            <span className={`font-medium ${price > 12800 ? 'text-red-600' : 'text-green-600'}`}>
                              {price > 12800 ? '高め' : '平均以下'}
                            </span>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 商品説明（API情報） - フレームなしでシンプルに表示 */}
              {productDetail?.description && (
                <div className="space-y-3">
                  <h3 className="text-base font-medium text-gray-700">商品説明</h3>
                  <div className="text-sm text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: productDetail.description }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* 外部リンクボタン - 下部に固定 */}
            <div className="sticky bottom-0 left-0 right-0 px-4 pt-4 pb-6 md:pb-8 bg-white border-t mt-auto">
              <div className="flex gap-3">
                {/* 閉じるボタン */}
                <button
                  onClick={onClose}
                  className="w-1/3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <X size={18} />
                  閉じる
                </button>
                
                {/* オークションページで見るボタン */}
                <a 
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-base"
                >
                  <ExternalLink size={18} />
                  {isAucfree ? 'オークフリーで見る' : 'オークションページで見る'}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 画像拡大モーダル */}
      {showZoom && (
        <>
          {/* オーバーレイ - 明示的に背景用の要素を作成 */}
          <div 
            className="fixed inset-0 z-[60] bg-black/90" 
            onClick={closeZoomView}
          />
          
          {/* コンテンツコンテナ */}
          <div className="fixed inset-0 z-[61] flex flex-col pointer-events-none">
            {/* スライダー部分 */}
            <div className="relative flex-1 flex items-center justify-center pointer-events-auto">
              {/* 閉じるボタン */}
              <button
                className="absolute right-4 top-4 z-[70] bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                onClick={closeZoomView}
              >
                <X size={24} />
              </button>
              
              {/* 縮小ボタン */}
              <button
                className="absolute right-16 top-4 z-[70] bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                onClick={closeZoomView}
              >
                <ZoomOut size={24} />
              </button>
              
              {/* 拡大表示スライダー */}
              <Swiper
                modules={[Navigation, Pagination, Zoom, Thumbs]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                zoom={{ maxRatio: 3 }}
                initialSlide={activeIndex}
                loop={images.length > 1}
                thumbs={{ swiper: zoomThumbsSwiper && !zoomThumbsSwiper.destroyed ? zoomThumbsSwiper : null }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                onSwiper={setZoomSwiper}
                className="w-full max-h-[calc(100vh-150px)]"
              >
                {images.map((src, index) => (
                  <SwiperSlide key={index} className="flex items-center justify-center h-[calc(100vh-150px)]">
                    <div className="swiper-zoom-container w-full h-full flex items-center justify-center">
                      <img
                        src={src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                        alt={`${title || 'タイトルなし'} - 拡大画像 ${index + 1}`}
                        className="max-w-full max-h-[calc(100vh-180px)] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
            
            {/* 拡大表示モード用サムネイル */}
            {images.length > 1 && (
              <div className="bg-black/70 py-3 pointer-events-auto">
                <div className="container mx-auto px-4 max-w-4xl">
                  <Swiper
                    modules={[FreeMode, Navigation, Thumbs]}
                    onSwiper={setZoomThumbsSwiper}
                    spaceBetween={10}
                    slidesPerView="auto"
                    freeMode={true}
                    watchSlidesProgress={true}
                    className="zoom-thumbs-swiper"
                  >
                    {images.map((src, index) => (
                      <SwiperSlide key={index} style={{ width: '80px', height: '60px' }}>
                        <div className={`h-full p-1 cursor-pointer border-2 rounded ${activeIndex === index ? 'border-blue-500' : 'border-transparent'}`}>
                          <img
                            src={src || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}
                            alt={`サムネイル ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30';
                            }}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ProductDrawer; 