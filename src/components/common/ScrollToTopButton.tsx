import React, { useState, useEffect } from 'react';
import { ArrowUpToLine } from 'lucide-react';

interface ScrollToTopButtonProps {
  threshold?: number;
}

/**
 * ページトップへ戻るボタンコンポーネント
 * スクロールが一定以上になると表示され、クリックするとページトップへスクロールします
 * 
 * @param threshold - ボタンを表示するスクロール量の閾値
 */
const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ threshold = 500 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors duration-200"
      aria-label="ページ上部へ戻る"
    >
      <ArrowUpToLine size={20} />
    </button>
  );
};

export default ScrollToTopButton; 