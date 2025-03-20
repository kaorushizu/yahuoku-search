import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageMagnifierProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  fallbackSrc?: string;
  magnifierSize?: number;
  zoomLevel?: number;
}

/**
 * 画像拡大表示コンポーネント
 * 画像にマウスホバーすると、カーソルの左側に拡大画像を表示します
 * 
 * @param src - 画像のURL
 * @param alt - 画像の代替テキスト
 * @param width - 画像の幅
 * @param height - 画像の高さ
 * @param className - 追加のCSSクラス
 * @param fallbackSrc - 読み込みエラー時の代替画像URL
 * @param magnifierSize - 拡大表示のサイズ (デフォルト: 256px)
 * @param zoomLevel - 拡大レベル (デフォルト: 1.5)
 */
const ImageMagnifier: React.FC<ImageMagnifierProps> = ({
  src,
  alt,
  width = 'auto',
  height = 'auto',
  className = '',
  fallbackSrc = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
  magnifierSize = 300,
  zoomLevel = 1.5
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ top: 0, left: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const portalContainerRef = useRef<HTMLDivElement | null>(null);

  // Portalコンテナを作成して初期化
  useEffect(() => {
    // すでに作成済みの場合は何もしない
    if (portalContainerRef.current) return;
    
    // Portalコンテナを作成
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.width = '100%';
    div.style.height = '0';
    div.style.overflow = 'visible';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '9999';
    document.body.appendChild(div);
    
    portalContainerRef.current = div;
    
    // クリーンアップ関数
    return () => {
      if (portalContainerRef.current) {
        document.body.removeChild(portalContainerRef.current);
        portalContainerRef.current = null;
      }
    };
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = fallbackSrc;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current) return;
    
    // マウスの位置を取得
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // ビューポートのサイズを取得
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 拡大画像を左に表示するなら左、右に余裕がなければ右に表示
    let left = mouseX - magnifierSize - 20;
    if (left < 10) {
      // 左側に余裕がない場合は右側に表示
      left = mouseX + 20;
    }
    
    // 拡大画像の上下位置をカーソルに合わせる
    let top = mouseY - magnifierSize / 2;
    
    // 画面上部に収まるように調整
    if (top < 10) {
      top = 10;
    }
    
    // 画面下部に収まるように調整
    if (top + magnifierSize > viewportHeight - 10) {
      top = viewportHeight - magnifierSize - 10;
    }
    
    // オフセットをfixedの位置計算に考慮
    setMagnifierPosition({
      top: top,
      left: left
    });
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  return (
    <>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        style={{ width, height, cursor: 'zoom-in' }}
        onError={handleImageError}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      {showMagnifier && portalContainerRef.current && createPortal(
        <div 
          className="fixed transition-all duration-200 z-50 pointer-events-none" 
          style={{ 
            top: `${magnifierPosition.top}px`,
            left: `${magnifierPosition.left}px`
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl p-2"
            style={{ width: magnifierSize, height: magnifierSize }}
          >
            <img
              src={src}
              alt={alt}
              className="w-full h-full object-contain"
              onError={handleImageError}
            />
          </div>
        </div>,
        portalContainerRef.current
      )}
    </>
  );
};

export default ImageMagnifier; 