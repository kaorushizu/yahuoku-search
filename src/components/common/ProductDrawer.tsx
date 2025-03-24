import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Package2, Calendar, Tag, BarChart4, ShoppingBag, Clock, Info, ZoomIn, ZoomOut, Image, DollarSign, PlusCircle, Users, Eye, Percent, FileText, Folder, Flag, Award, TrendingDown, TrendingUp, ArrowRight } from 'lucide-react';
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

// No Image画像のURLを定数として定義
const NO_IMAGE_URL = 'https://placehold.jp/bdbdc2/ffffff/400x400.png?text=No%20Image';

// 経過年数を計算する関数
const getYearsSinceAuction = (endDate: string): number => {
  if (!endDate) return 0;
  
  // 日本語形式の日付をパースする（例: 2021年2月22日 20時41分）
  const jpDatePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2})時(\d{1,2})分/;
  const match = endDate.match(jpDatePattern);
  
  let endDateTime: Date;
  
  if (match) {
    // 日本語形式の日付をパース
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScriptの月は0-11
    const day = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    
    endDateTime = new Date(year, month, day, hour, minute);
  } else {
    // 通常の日付形式をパース
    endDateTime = new Date(endDate);
  }
  
  if (!isNaN(endDateTime.getTime())) {
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - endDateTime.getTime();
    const diffYears = diffTime / (1000 * 3600 * 24 * 365);
    
    return diffYears;
  }
  
  return 0;
};

// 経過年数に基づいてタグ情報を取得する関数
const getAgeTag = (endDate: string): ProductTag | null => {
  const years = getYearsSinceAuction(endDate);
  
  if (years >= 9) {
    return {
      keyword: 'age_9plus',
      label: '9年',
      color: 'bg-red-500 text-white',
      group: '状態' as const
    };
  } else if (years >= 7) {
    return {
      keyword: 'age_7plus',
      label: '7年',
      color: 'bg-orange-500 text-white',
      group: '状態' as const
    };
  } else if (years >= 5) {
    return {
      keyword: 'age_5plus',
      label: '5年',
      color: 'bg-yellow-400 text-gray-800',
      group: '状態' as const
    };
  } else if (years >= 3) {
    return {
      keyword: 'age_3plus',
      label: '3年',
      color: 'bg-yellow-200 text-gray-800',
      group: '状態' as const
    };
  } else if (years >= 1) {
    return {
      keyword: 'age_1plus',
      label: '1年',
      color: 'bg-gray-300 text-gray-800',
      group: '状態' as const
    };
  }
  
  return null;
};

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  product: AuctionItem | null;
  productDetail: ProductDetailResponse | null;
  isLoading: boolean;
  error: string | null;
  getProductTags: (title: string) => ProductTag[];
  getAuctionUrl: (id: string, endDate: string) => string;
  statistics: {
    medianPrice: number;
  } | null;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
  isOpen,
  onClose,
  product,
  productDetail,
  isLoading,
  error,
  getProductTags,
  getAuctionUrl,
  statistics
}) => {
  const [showZoom, setShowZoom] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomThumbsSwiper, setZoomThumbsSwiper] = useState<SwiperType | null>(null);
  const [zoomSwiper, setZoomSwiper] = useState<SwiperType | null>(null);
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [drawerWidth, setDrawerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedCategoryId, setCopiedCategoryId] = useState(false);
  const [copiedAuctionId, setCopiedAuctionId] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const isMobile = useRef(window.innerWidth < 768).current;

  // 初期表示時にモバイルの場合は画面幅に合わせる
  useEffect(() => {
    if (isMobile) {
      setDrawerWidth(window.innerWidth);
    }
  }, [isMobile]);

  // ドロワーが閉じられたらリセット
  useEffect(() => {
    if (!isOpen) {
      setShowZoom(false);
      setActiveIndex(0);
      setCopiedCategoryId(false);
      setCopiedAuctionId(false);
    }
  }, [isOpen]);

  // ドラッグによるサイズ調整機能
  useEffect(() => {
    if (!isOpen || isMobile) return;

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
  }, [isOpen, isDragging, isMobile]);

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
  const copyToClipboard = (text: string, type: 'category' | 'auction') => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'category') {
        setCopiedCategoryId(true);
        setTimeout(() => {
          setCopiedCategoryId(false);
        }, 1000);
      } else {
        setCopiedAuctionId(true);
        setTimeout(() => {
          setCopiedAuctionId(false);
        }, 1000);
      }
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
  
  // 落札日から180日以内かどうかを判定
  const isWithin180Days = (() => {
    if (!endDate) return false;
    
    // 日本語形式の日付をパースする
    const jpDatePattern = /(\d{4})年(\d{1,2})月(\d{1,2})日\s*(\d{1,2})時(\d{1,2})分/;
    const match = endDate.match(jpDatePattern);
    
    let auctionEndDate: Date;
    
    if (match) {
      // 日本語形式の日付をパース
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScriptの月は0-11
      const day = parseInt(match[3], 10);
      const hour = parseInt(match[4], 10);
      const minute = parseInt(match[5], 10);
      
      auctionEndDate = new Date(year, month, day, hour, minute);
    } else {
      // 通常の日付形式をパース
      auctionEndDate = new Date(endDate);
    }
    
    // 日付が無効な場合はfalseを返す
    if (isNaN(auctionEndDate.getTime())) return false;
    
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - auctionEndDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    
    // 180日以内ならtrue
    return daysDiff <= 180;
  })();
  
  // 落札日から180日以内ならヤフオク、それ以外はオークフリー
  const isAucfree = !isWithin180Days;
  
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
      
      {/* ドロワー */}
      <div 
        className={`fixed right-0 top-0 h-full bg-white shadow-lg z-50 overflow-y-auto overscroll-contain transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isDragging ? 'transition-none' : ''}`}
        style={{ width: isMobile ? '100%' : `${drawerWidth}px` }}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
      >
        {/* リサイザー - モバイルでは非表示 */}
        {!isMobile && (
          <div 
            ref={resizerRef}
            className={`absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize z-[51] ${
              isDragging ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <div className="h-full flex items-center justify-center">
              <div className="w-0.5 h-16 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        )}

        {/* コンテンツコンテナ - 常にフレックスレイアウトで表示 */}
        <div className="flex flex-col h-full">
          {/* コンテンツエリア - 高さを伸ばしてスクロール可能に */}
          <div className="flex-grow overflow-y-auto overscroll-contain pl-6 pr-4 py-4">
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
              // 商品情報コンテンツ
              <div className="space-y-4">
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
                                src={src || NO_IMAGE_URL}
                                alt={`${title || 'タイトルなし'} - 画像 ${index + 1}`}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = NO_IMAGE_URL;
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
                              onClick={() => copyToClipboard(productDetail.categories[productDetail.categories.length - 1].id.toString(), 'category')}
                            >
                              {' '}({productDetail.categories[productDetail.categories.length - 1].id})
                              {copiedCategoryId && (
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
                            
                            {/* オークションID */}
                            <tr className="border-b border-gray-200 last:border-0">
                              <td className="py-1 text-gray-600 flex items-center gap-1">
                                <Tag size={14} />
                                オークションID
                              </td>
                              <td className="py-1 text-right relative">
                                <span 
                                  className="font-medium text-gray-900 cursor-pointer hover:text-blue-500"
                                  onClick={() => copyToClipboard(auctionId, 'auction')}
                                >
                                  {auctionId}
                                  {copiedAuctionId && (
                                    <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-100 transition-opacity duration-300">
                                      コピーしました
                                    </span>
                                  )}
                                </span>
                              </td>
                            </tr>
                            
                            <tr className="last:border-0">
                              <td className="py-1 text-gray-600 flex items-center gap-1">
                                <Calendar size={14} />
                                終了日時
                              </td>
                              <td className="py-1 text-right font-medium text-gray-900">
                                <div className="flex items-center gap-2 justify-end">
                                  {getAgeTag(endDate) && (
                                    <span
                                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${getAgeTag(endDate)?.color} w-fit`}
                                    >
                                      <Calendar size={10} />
                                      {getAgeTag(endDate)?.label}経過
                                    </span>
                                  )}
                                  <span>{endDate}</span>
                                </div>
                              </td>
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
                                中央値
                              </td>
                              <td className="px-4 py-2 text-right text-sm text-gray-600">
                                {statistics ? `¥${Math.round(statistics.medianPrice).toLocaleString()}` : '---'}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Percent size={14} />
                                  相場比較
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right text-sm text-gray-600">
                                {statistics ? (
                                  <div className="flex flex-col items-end gap-2">
                                    {(() => {
                                      const priceDiff = price - statistics.medianPrice;
                                      const diffPercent = Math.round(Math.abs(priceDiff) / statistics.medianPrice * 100);
                                      let message;
                                      let colorClass;
                                      let icon;
                                      let barWidth;

                                      if (diffPercent <= 10) {
                                        message = '中央値と同程度';
                                        colorClass = 'text-gray-600 bg-gray-100';
                                        icon = <ArrowRight className="w-4 h-4" />;
                                        barWidth = '10%';
                                      } else if (priceDiff > 0) {
                                        if (diffPercent > 50) {
                                          message = '中央値よりかなり高い';
                                          colorClass = 'text-red-700 bg-red-100';
                                          icon = <TrendingUp className="w-4 h-4" />;
                                          barWidth = '100%';
                                        } else if (diffPercent > 30) {
                                          message = '中央値より高い';
                                          colorClass = 'text-red-600 bg-red-50';
                                          icon = <TrendingUp className="w-4 h-4" />;
                                          barWidth = '60%';
                                        } else {
                                          message = '中央値よりやや高い';
                                          colorClass = 'text-red-400 bg-red-50';
                                          icon = <TrendingUp className="w-4 h-4" />;
                                          barWidth = '30%';
                                        }
                                      } else {
                                        if (diffPercent > 50) {
                                          message = '中央値よりかなり低い';
                                          colorClass = 'text-green-700 bg-green-100';
                                          icon = <TrendingDown className="w-4 h-4" />;
                                          barWidth = '100%';
                                        } else if (diffPercent > 30) {
                                          message = '中央値より低い';
                                          colorClass = 'text-green-600 bg-green-50';
                                          icon = <TrendingDown className="w-4 h-4" />;
                                          barWidth = '60%';
                                        } else {
                                          message = '中央値よりやや低い';
                                          colorClass = 'text-green-400 bg-green-50';
                                          icon = <TrendingDown className="w-4 h-4" />;
                                          barWidth = '30%';
                                        }
                                      }

                                      const baseColorClass = colorClass.split(' ')[0];
                                      const bgColorClass = colorClass.split(' ')[1];

                                      return (
                                        <>
                                          <div className={`flex items-center gap-1 px-2 py-1 rounded ${colorClass}`}>
                                            {icon}
                                            <span className="font-medium">
                                              {message}
                                            </span>
                                          </div>
                                          <div className="w-full flex flex-col gap-1">
                                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                              <div 
                                                className={`absolute top-0 ${priceDiff > 0 ? 'right-0' : 'left-0'} h-full ${bgColorClass} rounded-full transition-all duration-300`}
                                                style={{ width: barWidth }}
                                              />
                                            </div>
                                            <div className="text-xs text-gray-500 text-right">
                                              {Math.round(Math.abs(priceDiff)).toLocaleString()}円
                                              <span className="ml-1">({diffPercent}%) {priceDiff > 0 ? '高い' : '低い'}</span>
                                            </div>
                                          </div>
                                        </>
                                      );
                                    })()}
                                  </div>
                                ) : '---'}
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
            )}
          </div>
          
          {/* 外部リンクボタン - 下部に固定（常に表示） */}
          <div className="sticky bottom-0 left-0 right-0 pl-6 pr-4 pt-2 pb-8 bg-white border-t mt-auto">
            <div className="flex gap-2">
              {/* 閉じるボタン - 常に表示 */}
              <button
                onClick={onClose}
                className="w-1/3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-3 rounded flex items-center justify-center gap-1 text-sm"
              >
                <X size={16} />
                閉じる
              </button>
              
              {/* オークションページで見るボタン - 常に表示 */}
              <a 
                href={auctionId ? (isAucfree ? `https://aucfree.com/items/${auctionId}` : `https://auctions.yahoo.co.jp/jp/auction/${auctionId}`) : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-2/3 ${!auctionId ? 'opacity-50 pointer-events-none' : ''} bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-3 rounded flex items-center justify-center gap-1 text-sm`}
              >
                <ExternalLink size={16} />
                {isAucfree ? 'オークフリーで見る' : 'オークションページで見る'}
              </a>
            </div>
          </div>
        </div>
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
                        src={src || NO_IMAGE_URL}
                        alt={`${title || 'タイトルなし'} - 拡大画像 ${index + 1}`}
                        className="max-w-full max-h-[calc(100vh-180px)] object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = NO_IMAGE_URL;
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
                            src={src || NO_IMAGE_URL}
                            alt={`サムネイル ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = NO_IMAGE_URL;
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