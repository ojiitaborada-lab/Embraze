import { useState } from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faCarBurst, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import AlertDetailsModal from './AlertDetailsModal';
import noNotificationAnimation from '../assets/No Result.json';

function NotificationPanel({ notifications, onClose, onViewLocation, onNavigate, userProfile, helpActive, helpStopped, onClearAll }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState(null);
  if (notifications.length === 0) {
    return (
      <div className="h-full w-full bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-gray-900 tracking-tight">Notifications</h3>
        </div>
        
        {/* Empty State */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4">
          <div className="w-24 h-24 mb-3">
            <Player
              autoplay
              loop
              src={noNotificationAnimation}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
          <p className="text-gray-700 text-center text-sm font-semibold mb-1">All caught up!</p>
          <p className="text-gray-500 text-center text-xs">No new notifications right now</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white flex flex-col">
      {/* Header with Clear All button */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 bg-slate-50">
        <div>
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Notifications</h3>
          <p className="text-[9px] text-gray-600 font-medium">{notifications.length} active alert{notifications.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={onClearAll}
          className="text-[10px] text-gray-700 hover:text-gray-900 font-bold transition-all px-2 py-1 hover:bg-gray-100 rounded-full cursor-pointer shadow-sm border border-gray-200"
        >
          Clear All
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 px-3 py-2.5 space-y-2">
        {notifications.map((notification) => {
          const isUserAlert = notification.userId === userProfile?.id;
          const isActiveEmergency = notification.isActive || (isUserAlert && helpActive);
          const isStoppedEmergency = isUserAlert && helpStopped;
          
          // Get emergency type styling and icon
          const getEmergencyStyle = () => {
            if (isStoppedEmergency) {
              return {
                bgColor: 'bg-slate-400',
                ringColor: 'ring-slate-200',
                textColor: 'text-slate-500',
                borderColor: 'border-slate-200',
                shadowColor: 'shadow-slate-100/50',
                buttonBg: 'bg-slate-500',
                buttonHover: 'hover:bg-slate-600'
              };
            }
            
            switch(notification.emergencyType) {
              case 'fire':
                return {
                  bgColor: 'bg-orange-500',
                  ringColor: 'ring-orange-200',
                  textColor: 'text-orange-600',
                  borderColor: 'border-orange-200',
                  shadowColor: 'shadow-orange-100/50',
                  buttonBg: 'bg-orange-500',
                  buttonHover: 'hover:bg-orange-600'
                };
              case 'accident':
                return {
                  bgColor: 'bg-yellow-500',
                  ringColor: 'ring-yellow-200',
                  textColor: 'text-yellow-600',
                  borderColor: 'border-yellow-200',
                  shadowColor: 'shadow-yellow-100/50',
                  buttonBg: 'bg-yellow-500',
                  buttonHover: 'hover:bg-yellow-600'
                };
              case 'life-threat':
                return {
                  bgColor: 'bg-red-500',
                  ringColor: 'ring-red-200',
                  textColor: 'text-red-600',
                  borderColor: 'border-red-200',
                  shadowColor: 'shadow-red-100/50',
                  buttonBg: 'bg-red-500',
                  buttonHover: 'hover:bg-red-600'
                };
              default:
                return {
                  bgColor: 'bg-blue-600',
                  ringColor: 'ring-blue-200',
                  textColor: 'text-blue-600',
                  borderColor: 'border-blue-100',
                  shadowColor: 'shadow-blue-100/50',
                  buttonBg: 'bg-blue-600',
                  buttonHover: 'hover:bg-blue-700'
                };
            }
          };
          
          const getEmergencyIcon = () => {
            switch(notification.emergencyType) {
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
            switch(notification.emergencyType) {
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
              key={notification.id} 
              onClick={() => !isStoppedEmergency && onViewLocation(notification)}
              className={`bg-white rounded-xl p-2.5 transition-all duration-300 ${
                isStoppedEmergency 
                  ? 'opacity-60 shadow-sm border border-slate-200 cursor-not-allowed' 
                  : isActiveEmergency
                    ? 'shadow-lg border-2 border-slate-200 cursor-pointer hover:shadow-xl'
                    : 'shadow-md hover:shadow-xl border border-slate-100 hover:border-slate-200 cursor-pointer'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center overflow-hidden transition-all shadow-sm ${
                    style.bgColor
                  } ${
                    isActiveEmergency ? `ring-2 ${style.ringColor} ring-offset-1` : `ring-1 ${style.ringColor}`
                  }`}>
                    {notification.photoUrl ? (
                      <img 
                        src={notification.photoUrl} 
                        alt={notification.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {notification.userName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-xs leading-tight tracking-tight">{notification.userName}</h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      {getEmergencyIcon()}
                      <p className={`text-[9px] font-medium ${style.textColor}`}>
                        {isStoppedEmergency ? 'Alert stopped' : getEmergencyLabel()}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose(notification.id);
                  }}
                  className="text-slate-400 hover:text-slate-700 transition-all p-1 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Location & Phone */}
              <div className="space-y-1.5 mb-2 bg-slate-50 rounded-lg p-2">
                <div className="flex items-start gap-1.5 text-[10px]">
                  <MapPinIcon className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 leading-snug font-medium">{notification.address}</span>
                </div>
                {notification.phone && (
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <PhoneIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <a href={`tel:${notification.phone}`} className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                      {notification.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-1.5 mb-1.5">
                {/* See Details Button - Show if alert has notes or photos */}
                {(notification.notes || (notification.photos && notification.photos.length > 0)) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAlertDetails(notification);
                      setShowDetailsModal(true);
                    }}
                    disabled={isStoppedEmergency}
                    className={`w-full py-1.5 rounded-full text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 ${
                      isStoppedEmergency
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95 cursor-pointer'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCircleInfo} className="w-2.5 h-2.5" />
                    See Details
                  </button>
                )}
                
                {/* Navigate Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(notification);
                  }}
                  disabled={isStoppedEmergency}
                  className={`w-full py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm ${
                    isStoppedEmergency
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
                  }`}
                >
                  <FontAwesomeIcon icon={faRoute} className="w-2.5 h-2.5" />
                  Navigate
                </button>
              </div>

              {/* Timestamp */}
              <div className="pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-center gap-1">
                  <ClockIcon className="w-2.5 h-2.5 text-slate-500" />
                  <p className="text-[9px] text-slate-500 font-medium">
                    {notification.createdAt ? 
                      new Date(notification.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                      notification.timestamp ?
                      new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                      'Just now'
                    }
                  </p>
                </div>
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

export default NotificationPanel;
