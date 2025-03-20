import React, { useState } from 'react';

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
  magnifierSize = 256,
  zoomLevel = 1.5
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = fallbackSrc;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    const tooltip = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
    if (tooltip) {
      const rect = e.currentTarget.getBoundingClientRect();
      tooltip.style.top = `${rect.top}px`;
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    }
  };

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLImageElement>) => {
    const tooltip = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
    if (tooltip) {
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    }
    setShowMagnifier(false);
  };

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width, height, cursor: 'zoom-in' }}
        onError={handleImageError}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      
      <div 
        className="fixed opacity-0 invisible transition-all duration-200 z-50 pointer-events-none" 
        style={{ transform: 'translateX(-100%)', marginLeft: '-20px' }}
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
      </div>
    </>
  );
};

export default ImageMagnifier; 