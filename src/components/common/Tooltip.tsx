import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TooltipProps } from '../../types';

/**
 * ツールチップを表示するコンポーネント
 * 要素にホバーした際に、指定されたテキストを表示する
 * ポータルを使用して親コンポーネントの制約を受けずに表示する
 * 
 * @param text - 表示するツールチップのテキスト
 * @param children - ツールチップを表示する対象の要素
 */
const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState({ left: 0 });
  const childRef = useRef<HTMLDivElement>(null);
  
  const showTooltip = () => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    const childWidth = rect.width;
    const childLeft = rect.left;
    const childCenterX = childLeft + childWidth / 2;
    const tooltipWidth = text.length * 8; // 推定ツールチップ幅
    const viewportWidth = window.innerWidth;
    
    let tooltipLeft = childCenterX - tooltipWidth / 2;
    
    // 左端対応
    if (tooltipLeft < 10) {
      tooltipLeft = 10;
    }
    
    // 右端対応
    if (tooltipLeft + tooltipWidth > viewportWidth - 10) {
      tooltipLeft = viewportWidth - 10 - tooltipWidth;
    }
    
    // 矢印の位置を計算（対象要素の中心からの相対位置）
    const arrowLeftPosition = childCenterX - tooltipLeft;
    
    setPosition({
      top: rect.top - 30, // ツールチップの高さ + マージン
      left: tooltipLeft
    });
    
    setArrowPosition({
      left: arrowLeftPosition
    });
    
    setIsVisible(true);
  };
  
  const hideTooltip = () => {
    setIsVisible(false);
  };
  
  return (
    <>
      <div 
        ref={childRef}
        className="inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </div>
      
      {isVisible && createPortal(
        <div 
          className="fixed z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded whitespace-nowrap"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: 1,
            transition: 'opacity 0.2s'
          }}
        >
          {text}
          <div 
            className="absolute border-4 border-transparent border-t-gray-900"
            style={{
              top: '100%',
              left: `${arrowPosition.left}px`,
              marginTop: '-1px'
            }}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip; 