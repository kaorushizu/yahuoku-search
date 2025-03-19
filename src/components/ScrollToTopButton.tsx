import React from 'react';
import { ArrowUpToLine } from 'lucide-react';

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ show, onClick }) => {
  if (!show) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 z-50 transition-opacity duration-300"
      aria-label="トップへスクロール"
    >
      <ArrowUpToLine size={20} />
    </button>
  );
};

export default ScrollToTopButton; 