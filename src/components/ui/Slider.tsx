import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export const Slider: React.FC<SliderProps> = ({
  min,
  max,
  value,
  onChange,
  step = 1
}) => {
  const [activeThumb, setActiveThumb] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // 値をパーセントに変換する関数
  const valueToPercent = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  // 位置からスライダーの値を計算する関数
  const positionToValue = useCallback((position: number) => {
    if (!trackRef.current) return min;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, position / trackRect.width));
    let value = min + percent * (max - min);
    
    // ステップに合わせて丸める
    if (step > 0) {
      value = Math.round(value / step) * step;
    }
    
    return Math.max(min, Math.min(max, value));
  }, [min, max, step]);

  // マウスムーブハンドラ
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!activeThumb || !trackRef.current) return;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const position = e.clientX - trackRect.left;
    const newValue = positionToValue(position);
    
    if (activeThumb === 'min') {
      // 最小値のスライダーを動かす（最大値よりも大きくならないように）
      onChange([Math.min(newValue, value[1] - step), value[1]]);
    } else {
      // 最大値のスライダーを動かす（最小値よりも小さくならないように）
      onChange([value[0], Math.max(newValue, value[0] + step)]);
    }
  }, [activeThumb, value, onChange, positionToValue, step]);

  // マウスアップハンドラ
  const handleMouseUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  // マウスダウンイベントの監視を設定
  useEffect(() => {
    if (activeThumb) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeThumb, handleMouseMove, handleMouseUp]);

  // 最小値のつまみのマウスダウンハンドラ
  const handleMinThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveThumb('min');
  };

  // 最大値のつまみのマウスダウンハンドラ
  const handleMaxThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveThumb('max');
  };

  // トラックのクリックハンドラ
  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    
    const trackRect = trackRef.current.getBoundingClientRect();
    const position = e.clientX - trackRect.left;
    const clickValue = positionToValue(position);
    
    // クリックした位置が最小値と最大値のどちらに近いかで操作するつまみを決定
    const distToMin = Math.abs(clickValue - value[0]);
    const distToMax = Math.abs(clickValue - value[1]);
    
    if (distToMin <= distToMax) {
      setActiveThumb('min');
      onChange([clickValue, value[1]]);
    } else {
      setActiveThumb('max');
      onChange([value[0], clickValue]);
    }
  };

  return (
    <div className="relative h-7 w-full">
      {/* トラック（バー全体） */}
      <div
        ref={trackRef}
        className="absolute h-2 w-full bg-gray-200 rounded-full cursor-pointer"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        onMouseDown={handleTrackMouseDown}
      >
        {/* 選択された範囲 */}
        <div
          className="absolute h-full bg-blue-500 rounded-full"
          style={{
            left: `${valueToPercent(value[0])}%`,
            width: `${valueToPercent(value[1]) - valueToPercent(value[0])}%`
          }}
        />
      </div>

      {/* 最小値のつまみ */}
      <div
        className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab z-10 ${
          activeThumb === 'min' ? 'cursor-grabbing shadow-md' : ''
        }`}
        style={{ left: `${valueToPercent(value[0])}%` }}
        onMouseDown={handleMinThumbMouseDown}
      />

      {/* 最大値のつまみ */}
      <div
        className={`absolute w-5 h-5 rounded-full bg-white border-2 border-blue-500 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab z-10 ${
          activeThumb === 'max' ? 'cursor-grabbing shadow-md' : ''
        }`}
        style={{ left: `${valueToPercent(value[1])}%` }}
        onMouseDown={handleMaxThumbMouseDown}
      />
    </div>
  );
}; 