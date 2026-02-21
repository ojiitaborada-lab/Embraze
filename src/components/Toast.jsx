import { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

function Toast({ message, isVisible, onClose, type = 'success', position = 'top-left' }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000); // 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  // Position classes based on position prop
  const positionClasses = {
    'top-left': 'top-4 md:top-6 left-4 md:left-6 animate-slideInFromLeft',
    'top-center': 'top-4 md:top-6 left-1/2 animate-slideInFromTop'
  };

  return (
    <div className={`absolute z-[100] ${positionClasses[position]}`}>
      <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl px-3 md:px-5 py-2 md:py-3 flex items-center gap-2 md:gap-3 border border-gray-100/50">
        <CheckCircleIcon 
          className={`w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0 ${type === 'success' ? 'text-green-500' : 'text-blue-500'}`} 
        />
        <p className="text-xs md:text-sm text-gray-800 font-medium whitespace-nowrap">{message}</p>
        <button
          onClick={onClose}
          className="w-5 h-5 md:w-6 md:h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
        >
          <XMarkIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
