import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  XMarkIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import emptyAnimation from '../assets/empty ghost.json';

function HistoryPanel({ history, onClearHistory, onClearItem, userProfile }) {
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'family'
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const filteredHistory = history.filter(item => {
    if (filter === 'mine') return item.userId === userProfile?.id;
    if (filter === 'family') return item.userId !== userProfile?.id;
    return true;
  });

  const formatDuration = (startTime, endTime) => {
    const duration = Math.floor((endTime - startTime) / 1000 / 60); // minutes
    if (duration < 1) return 'Less than a minute';
    if (duration < 60) return `${duration} min`;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (history.length === 0) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">History</h3>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
          <div className="w-24 h-24 mb-2">
            <Player
              autoplay
              loop
              src={emptyAnimation}
              style={{ height: '96px', width: '96px' }}
            />
          </div>
          <p className="text-gray-500 text-center text-xs font-semibold mb-0.5">No history yet</p>
          <p className="text-gray-400 text-center text-[10px]">Past emergency alerts will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header with Filter and Clear All */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">History</h3>
          <p className="text-[10px] text-gray-500">
            {filteredHistory.length} alert{filteredHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="text-xs text-gray-600 hover:text-gray-800 font-semibold transition-colors px-2 py-1.5 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center gap-1"
            >
              <FunnelIcon className="w-3 h-3" />
              {filter === 'all' ? 'All' : filter === 'mine' ? 'Mine' : 'Family'}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[90px]">
                <button
                  onClick={() => { setFilter('all'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 ${filter === 'all' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                >
                  All
                </button>
                <button
                  onClick={() => { setFilter('mine'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 ${filter === 'mine' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                >
                  Mine
                </button>
                <button
                  onClick={() => { setFilter('family'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs hover:bg-gray-50 ${filter === 'family' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                >
                  Family
                </button>
              </div>
            )}
          </div>
          
          {/* Clear All Button */}
          <button
            onClick={onClearHistory}
            className="text-xs text-red-600 hover:text-red-700 font-semibold transition-colors px-2 py-1.5 hover:bg-red-50 rounded-lg cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2.5">
        {filteredHistory.map((item) => {
          const isUserAlert = item.userId === userProfile?.id;
          
          return (
            <div 
              key={item.id} 
              className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden ${
                    isUserAlert ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    {item.photoUrl ? (
                      <img 
                        src={item.photoUrl} 
                        alt={item.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {item.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs leading-tight">
                      {item.userName}
                      {isUserAlert && <span className="text-gray-400 text-[10px] ml-1">(You)</span>}
                    </h3>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onClearItem(item.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-full cursor-pointer"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location */}
              <div className="mb-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 leading-relaxed">{item.address}</span>
                </div>
              </div>

              {/* Time Info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-500">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {item.stoppedAt && (
                  <span className="text-[10px] text-gray-500">
                    Duration: {formatDuration(item.createdAt, item.stoppedAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryPanel;
