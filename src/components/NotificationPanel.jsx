import { 
  MapPinIcon, 
  PhoneIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  BellIcon 
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import noNotificationAnimation from '../assets/No notification.json';

function NotificationPanel({ notifications, onClose, onViewLocation, onNavigate, isOpen, userProfile, helpActive, helpStopped, onClearAll }) {
  if (notifications.length === 0) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
          <div className="w-24 h-24 mb-2">
            <Player
              autoplay
              loop
              src={noNotificationAnimation}
              style={{ height: '96px', width: '96px' }}
            />
          </div>
          <p className="text-gray-500 text-center text-xs font-semibold mb-0.5">All caught up!</p>
          <p className="text-gray-400 text-center text-[10px]">No new notifications right now</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-gray-50 to-white flex flex-col">
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">Notifications</h3>
          <p className="text-[10px] text-gray-500">{notifications.length} active alert{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors px-2 py-1.5 hover:bg-blue-50 rounded-lg cursor-pointer"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 px-4 py-4 space-y-2.5">
        {notifications.map((notification, index) => {
          const isUserAlert = notification.userId === userProfile?.id;
          const isActiveEmergency = notification.isActive || (isUserAlert && helpActive);
          const isStoppedEmergency = isUserAlert && helpStopped;
          
          return (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl p-3 transition-all duration-300 ${
                isStoppedEmergency 
                  ? 'opacity-50 shadow-sm' 
                  : isActiveEmergency
                    ? 'shadow-lg shadow-red-100 border border-red-100'
                    : 'shadow-md hover:shadow-lg border border-gray-100'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                    isStoppedEmergency
                      ? 'bg-gray-400'
                      : isActiveEmergency
                        ? 'bg-red-500 ring-2 ring-red-200 ring-offset-1'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {notification.photoUrl ? (
                      <img 
                        src={notification.photoUrl} 
                        alt={notification.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {notification.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-xs leading-tight">{notification.userName}</h3>
                    <p className={`text-[10px] mt-0.5 ${
                      isStoppedEmergency
                        ? 'text-gray-500'
                        : isActiveEmergency
                          ? 'text-red-600 font-medium'
                          : 'text-gray-500'
                    }`}>
                      {isStoppedEmergency ? 'Alert stopped' : isActiveEmergency ? 'Active emergency' : 'Emergency alert'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onClose(notification.id)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location & Phone */}
              <div className="space-y-2 mb-2.5">
                <div className="flex items-start gap-2 text-xs">
                  <MapPinIcon className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600 leading-relaxed">{notification.address}</span>
                </div>
                {notification.phone && (
                  <div className="flex items-center gap-2 text-xs">
                    <PhoneIcon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${notification.phone}`} className="text-blue-600 hover:text-blue-700 font-medium">
                      {notification.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onViewLocation(notification)}
                  disabled={isStoppedEmergency}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all ${
                    isStoppedEmergency
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  View
                </button>
                <button
                  onClick={() => onNavigate(notification)}
                  disabled={isStoppedEmergency}
                  className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                    isStoppedEmergency
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 cursor-pointer'
                  }`}
                >
                  <FontAwesomeIcon icon={faRoute} className="w-3 h-3" />
                  Navigate
                </button>
              </div>

              {/* Timestamp */}
              <div className="mt-2.5 pt-2 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 text-center">
                  {notification.createdAt ? 
                    new Date(notification.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    notification.timestamp ?
                    new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    'Just now'
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NotificationPanel;
