import { useEffect, useState } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

function Toast({ message, isVisible, onClose, type = 'success', position = 'top-left' }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        // Wait for animation to complete before calling onClose
        setTimeout(() => {
          onClose();
        }, 300); // Match animation duration
      }, 2000); // 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible && !isExiting) return null;

  // Position classes based on position prop
  const positionClasses = {
    'top-left': 'top-4 md:top-6 left-4 md:left-6',
    'top-center': 'top-4 md:top-6 left-1/2 -translate-x-1/2'
  };

  return (
    <div 
      className={`fixed z-[100] transition-all duration-300 ${positionClasses[position]} ${
        isExiting ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-lg px-5 py-2.5 flex items-center gap-2.5 border border-gray-200">
        <CheckCircleIcon 
          className={`w-4 h-4 flex-shrink-0 ${type === 'success' ? 'text-green-500' : 'text-blue-500'}`} 
        />
        <p className="text-sm text-gray-800 font-medium whitespace-nowrap">{message}</p>
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
        >
          <XMarkIcon className="w-3 h-3 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
