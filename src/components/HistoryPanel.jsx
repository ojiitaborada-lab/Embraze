import { useState } from 'react';
import { 
  ClockIcon,
  XMarkIcon,
  FunnelIcon,
  FireIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faCarBurst, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import AlertDetailsModal from './AlertDetailsModal';
import emptyAnimation from '../assets/No Result.json';

function HistoryPanel({ history, onClearHistory, onClearItem, userProfile }) {
  const [filter, setFilter] = useState('all'); // 'all', 'mine', 'family'
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState(null);

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
      <div className="h-full w-full bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">History</h3>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
          <div className="w-24 h-24 mb-3">
            <Player
              autoplay
              loop
              src={emptyAnimation}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
          <p className="text-gray-700 text-center text-sm font-bold mb-1">No history yet</p>
          <p className="text-gray-500 text-center text-xs">Past emergency alerts will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header with Filter and Clear All */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">History</h3>
          <p className="text-[9px] text-gray-600 font-medium">
            {filteredHistory.length} alert{filteredHistory.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {/* Filter Button */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="text-[10px] text-gray-700 hover:text-blue-600 font-bold transition-all px-2 py-1 hover:bg-blue-50 rounded-full cursor-pointer flex items-center gap-1 shadow-sm border border-gray-200"
            >
              <FunnelIcon className="w-2.5 h-2.5" />
              {filter === 'all' ? 'All' : filter === 'mine' ? 'Mine' : 'Family'}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-blue-100 py-1 z-10 min-w-[90px]">
                <button
                  onClick={() => { setFilter('all'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-blue-50 rounded transition-colors ${filter === 'all' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700 font-medium'}`}
                >
                  All
                </button>
                <button
                  onClick={() => { setFilter('mine'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-blue-50 rounded transition-colors ${filter === 'mine' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700 font-medium'}`}
                >
                  Mine
                </button>
                <button
                  onClick={() => { setFilter('family'); setShowFilterMenu(false); }}
                  className={`w-full text-left px-2.5 py-1.5 text-[10px] hover:bg-blue-50 rounded transition-colors ${filter === 'family' ? 'text-blue-600 font-bold bg-blue-50' : 'text-gray-700 font-medium'}`}
                >
                  Family
                </button>
              </div>
            )}
          </div>
          
          {/* Clear All Button */}
          <button
            onClick={onClearHistory}
            className="text-[10px] text-gray-700 hover:text-gray-900 font-bold transition-all px-2 py-1 hover:bg-gray-100 rounded-full cursor-pointer shadow-sm border border-gray-200"
          >
            Clear All
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 px-3 py-2.5 space-y-2">
        {filteredHistory.map((item) => {
          const isUserAlert = item.userId === userProfile?.id;
          
          // Get emergency type styling and icon
          const getEmergencyStyle = () => {
            switch(item.emergencyType) {
              case 'fire':
                return {
                  bgColor: 'bg-orange-500',
                  ringColor: 'ring-orange-200',
                  textColor: 'text-orange-600'
                };
              case 'accident':
                return {
                  bgColor: 'bg-yellow-500',
                  ringColor: 'ring-yellow-200',
                  textColor: 'text-yellow-600'
                };
              case 'life-threat':
                return {
                  bgColor: 'bg-red-500',
                  ringColor: 'ring-red-200',
                  textColor: 'text-red-600'
                };
              default:
                return {
                  bgColor: 'bg-blue-600',
                  ringColor: 'ring-blue-200',
                  textColor: 'text-blue-600'
                };
            }
          };
          
          const getEmergencyIcon = () => {
            switch(item.emergencyType) {
              case 'fire':
                return <FireIcon className="w-3 h-3 text-orange-600" />;
              case 'accident':
                return <FontAwesomeIcon icon={faCarBurst} className="w-3 h-3 text-yellow-600" />;
              case 'life-threat':
                return <ExclamationTriangleIcon className="w-3 h-3 text-red-600" />;
              default:
                return <ExclamationTriangleIcon className="w-3 h-3 text-blue-600" />;
            }
          };
          
          const getEmergencyLabel = () => {
            switch(item.emergencyType) {
              case 'fire':
                return 'Fire Emergency';
              case 'accident':
                return 'Accident';
              case 'life-threat':
                return 'Life Threat';
              default:
                return 'Emergency';
            }
          };
          
          const style = getEmergencyStyle();
          
          return (
            <div 
              key={item.id} 
              className="bg-white rounded-xl p-2.5 shadow-sm hover:shadow-md transition-all border border-gray-100/50"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shadow-sm ring-1 ${
                    style.bgColor
                  } ${
                    style.ringColor
                  }`}>
                    {item.photoUrl ? (
                      <img 
                        src={item.photoUrl} 
                        alt={item.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {item.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs leading-tight tracking-tight">
                      {item.userName}
                      {isUserAlert && <span className="text-gray-600 text-[9px] ml-1 font-medium">(You)</span>}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getEmergencyIcon()}
                      <p className={`text-[9px] font-bold ${style.textColor}`}>
                        {getEmergencyLabel()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onClearItem(item.id)}
                  className="text-gray-400 hover:text-red-600 transition-all p-1 hover:bg-red-50 rounded-full cursor-pointer"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location */}
              <div className="mb-2 bg-gray-50/50 rounded-lg p-2">
                <div className="flex items-start gap-1.5 text-[10px]">
                  <FontAwesomeIcon icon={faLocationDot} className={`w-3 h-3 ${style.textColor} mt-0.5 flex-shrink-0`} />
                  <span className="text-gray-700 leading-snug font-medium">{item.address}</span>
                </div>
              </div>

              {/* See Details Button - Show if alert has notes or photos */}
              {(item.notes || (item.photos && item.photos.length > 0)) && (
                <button
                  onClick={() => {
                    setSelectedAlertDetails(item);
                    setShowDetailsModal(true);
                  }}
                  className="w-full py-1.5 mb-2 rounded-full text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faCircleInfo} className="w-2.5 h-2.5" />
                  See Details
                </button>
              )}

              {/* Time Info */}
              <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-2.5 h-2.5 text-gray-500" />
                  <span className="text-[9px] text-gray-600 font-medium">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {item.stoppedAt && (
                  <span className="text-[9px] text-gray-600 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                    {formatDuration(item.createdAt, item.stoppedAt)}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Details Modal */}
      <AlertDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAlertDetails(null);
        }}
        alert={selectedAlertDetails}
      />
    </div>
  );
}

export default HistoryPanel;
