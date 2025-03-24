import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Package2, Calendar, Tag, BarChart4, ShoppingBag, Clock, Info, ZoomIn, ZoomOut, Image, DollarSign, PlusCircle, Users, Eye, Percent, FileText, Folder, Flag, Award } from 'lucide-react';
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
  const [isCopied, setIsCopied] = useState(false);
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

  // クリップボードにコピーする関数
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }).catch(err => {
      console.error('クリップボードへのコピーに失敗しました', err);
    });
  };

  // 商品状態に応じた色クラスを返す
  const getConditionColorClass = (condition: string): string => {
    switch (condition) {
      case '未使用':
        return 'text-emerald-600 font-semibold';
      case '未使用に近い':
        return 'text-green-600 font-semibold';
      case '目立った傷や汚れなし':
        return 'text-teal-600 font-medium';
      case 'やや傷や汚れあり':
        return 'text-amber-600 font-medium';
      case '傷や汚れあり':
        return 'text-orange-600 font-medium';
      case '全体的に状態が悪い':
        return 'text-red-600 font-medium';
      default:
        return 'text-gray-900 font-medium';
    }
  };

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

  // 画像拡大ビューを開く
  const openZoomView = () => {
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
        className={`fixed right-0 top-0 h-full bg-white shadow-lg z-50 overflow-y-auto overscroll-contain transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{ width: `${drawerWidth}px` }}
        onWheel={(e) => {
          // スクロールがドロワーの最上部または最下部に達した場合でも
          // 親要素へのスクロール伝播を防止
          e.stopPropagation();
          
          // ドロワー内の要素
          const drawer = e.currentTarget;
          
          // 最上部でのスクロールアップまたは最下部でのスクロールダウンを防止
          if (
            (drawer.scrollTop === 0 && e.deltaY < 0) || 
            (drawer.scrollHeight - drawer.scrollTop === drawer.clientHeight && e.deltaY > 0)
          ) {
            e.preventDefault();
          }
        }}
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
            <div className="flex-grow overflow-y-auto overscroll-contain pl-6 pr-4 py-4 space-y-4">
              {/* Swiperスライダー */}
              <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
                {images.length > 0 ? (
                  <div className="relative h-[450px]">
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
                  <div className="h-[450px] flex items-center justify-center text-gray-400">
                    画像はありません
                  </div>
                )}
              </div>
              
              {/* タグを先に表示 */}
              <div className="space-y-4">
                {/* タグ */}
                <div className="flex flex-wrap gap-1">
                  {tags.length > 0 && tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tag.color}`}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>

                {/* 商品名 */}
                <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                
                {/* カテゴリー情報 - 先頭の「オークション > 」を削除 */}
                {productDetail?.categories && productDetail.categories.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-700 flex items-start gap-1">
                      <Folder size={14} className="mt-0.5 flex-shrink-0" />
                      <div>
                        {productDetail.categories.slice(1).map((category, index) => (
                          <span key={category.id}>
                            {category.name}
                            {index < productDetail.categories.length - 2 && ' > '}
                          </span>
                        ))}
                        {productDetail.categories.length > 1 && (
                          <span 
                            className="text-gray-500 cursor-pointer hover:text-blue-500 relative"
                            onClick={() => copyToClipboard(productDetail.categories[productDetail.categories.length - 1].id.toString())}
                          >
                            {' '}({productDetail.categories[productDetail.categories.length - 1].id})
                            {isCopied && (
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-100 transition-opacity duration-300">
                                コピーしました
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 詳細情報 - 落札金額を含める */}
              <div className="space-y-4">
                {/* 価格情報 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-3 gap-0">
                    <div className="p-2 text-center">
                      <div className="text-gray-600 text-sm flex items-center justify-center gap-1">
                        <Award size={14} />
                        落札価格
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        ¥{price.toLocaleString()}
                      </div>
                    </div>
                    
                    {/* 開始価格（API情報） */}
                    <div className="p-2 border-l border-gray-200 text-center">
                      <div className="text-gray-500 text-sm flex items-center justify-center gap-1">
                        <Flag size={14} />
                        開始価格
                      </div>
                      <div className="text-base font-medium text-gray-700">
                        ¥{productDetail?.startPrice?.toLocaleString() || '---'}
                      </div>
                    </div>

                    {/* 入札数 */}
                    <div className="p-2 border-l border-gray-200 text-center">
                      <div className="text-gray-500 text-sm flex items-center justify-center gap-1">
                        <Users size={14} />
                        入札数
                      </div>
                      <div className="text-base font-medium text-gray-700">
                        {bidCount}件
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* その他の詳細情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 商品詳細情報 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Package2 size={16} />
                      商品情報
                    </h3>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <table className="w-full">
                        <tbody>
                          {/* 商品状態（API情報） */}
                          {productDetail?.condition && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-1 text-gray-600 flex items-center gap-1">
                                <Tag size={14} />
                                商品の状態
                              </td>
                              <td className="py-1 text-right">
                                <span className={getConditionColorClass(productDetail.condition)}>
                                  {productDetail.condition}
                                </span>
                              </td>
                            </tr>
                          )}
                          
                          {/* ウォッチリスト数（API情報） */}
                          {productDetail?.watchListNum !== undefined && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-1 text-gray-600 flex items-center gap-1">
                                <Eye size={14} />
                                ウォッチ数
                              </td>
                              <td className="py-1 text-right font-medium text-gray-900">{productDetail.watchListNum}人</td>
                            </tr>
                          )}
                          
                          {/* 入札者数（API情報） */}
                          {productDetail?.biddersNum !== undefined && (
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-1 text-gray-600 flex items-center gap-1">
                                <Users size={14} />
                                入札者数
                              </td>
                              <td className="py-1 text-right font-medium text-gray-900">{productDetail.biddersNum}人</td>
                            </tr>
                          )}
                          
                          <tr className="last:border-0">
                            <td className="py-1 text-gray-600 flex items-center gap-1">
                              <Calendar size={14} />
                              終了日時
                            </td>
                            <td className="py-1 text-right font-medium text-gray-900">{endDate}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* 市場分析 */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <BarChart4 size={16} />
                      市場分析
                    </h3>
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-gray-200">
                            <td className="py-1 text-gray-600 flex items-center gap-1">
                              <DollarSign size={14} />
                              平均落札価格
                            </td>
                            <td className="py-1 text-right font-medium text-gray-900">¥12,800</td>
                          </tr>
                          <tr>
                            <td className="py-1 text-gray-600 flex items-center gap-1">
                              <Percent size={14} />
                              相場比較
                            </td>
                            <td className="py-1 text-right">
                              <span className={`font-medium ${price > 12800 ? 'text-red-600' : 'text-green-600'}`}>
                                {price > 12800 ? '高め' : '平均以下'}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 商品説明（API情報） - フレームなしでシンプルに表示 */}
              {productDetail?.description && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FileText size={16} />
                    商品説明
                  </h3>
                  <div className="text-sm text-gray-700">
                    <div dangerouslySetInnerHTML={{ __html: productDetail.description }} />
                  </div>
                </div>
              )}
            </div>
            
            {/* 外部リンクボタン - 下部に固定 */}
            <div className="sticky bottom-0 left-0 right-0 pl-6 pr-4 pt-2 pb-8 bg-white border-t mt-auto">
              <div className="flex gap-2">
                {/* 閉じるボタン */}
                <button
                  onClick={onClose}
                  className="w-1/3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-3 rounded flex items-center justify-center gap-1 text-sm"
                >
                  <X size={16} />
                  閉じる
                </button>
                
                {/* オークションページで見るボタン */}
                <a 
                  href={auctionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-3 rounded flex items-center justify-center gap-1 text-sm"
                >
                  <ExternalLink size={16} />
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
          <div className="fixed inset-0 z-[61] flex flex-col pointer-events-none overscroll-contain">
            {/* スライダー部分 */}
            <div className="relative flex-1 flex items-center justify-center pointer-events-auto overscroll-contain">
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
                onSlideChange={(swiper) => {
                  // loopモード時の実際のインデックスを計算
                  const realIndex = swiper.realIndex;
                  setActiveIndex(realIndex);
                }}
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
                    loop={false}
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