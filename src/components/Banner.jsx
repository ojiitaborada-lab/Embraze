import { useState, useEffect } from 'react';

function Banner() {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('heartCount');
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('heartCount', count.toString());
  }, [count]);

  const handleHeartClick = () => {
    setCount(prev => prev + 1);
  };

  return (
    <div className="w-full bg-white border-b border-gray-100 py-3 px-4 flex items-center justify-center gap-3">
      <span className="text-gray-800 text-sm font-light tracking-wide">
        Kate Loraine
      </span>
      <button
        onClick={handleHeartClick}
        className="group transition-transform hover:scale-110 active:scale-95"
        aria-label="Tap heart"
      >
        <svg
          className="w-5 h-5 text-rose-400 transition-colors group-hover:text-rose-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <span className="text-gray-800 text-sm font-light tracking-wide">
        Mark Isaac Abangan
      </span>
    </div>
  );
}

export default Banner;
