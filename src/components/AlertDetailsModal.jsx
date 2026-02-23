import { useState } from 'react';
import { XMarkIcon, MapPinIcon, PhoneIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FireIcon } from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCarBurst } from '@fortawesome/free-solid-svg-icons';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

function AlertDetailsModal({ isOpen, onClose, alert }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  if (!isOpen || !alert) return null;

  const getEmergencyIcon = () => {
    switch(alert.emergencyType) {
      case 'fire':
        return <FireIcon className="w-4 h-4 text-orange-600" />;
      case 'accident':
        return <FontAwesomeIcon icon={faCarBurst} className="w-4 h-4 text-yellow-600" />;
      case 'life-threat':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  const getEmergencyLabel = () => {
    switch(alert.emergencyType) {
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

  const getEmergencyColor = () => {
    switch(alert.emergencyType) {
      case 'fire':
        return 'bg-orange-500';
      case 'accident':
        return 'bg-yellow-500';
      case 'life-threat':
        return 'bg-red-500';
      default:
        return 'bg-blue-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] sm:max-w-[360px] max-h-[85vh] animate-slideUp overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header with Profile */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 shadow-sm ${getEmergencyColor()}`}>
                {alert.photoUrl ? (
                  <img 
                    src={alert.photoUrl} 
                    alt={alert.userName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{alert.userName.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-gray-900 truncate">{alert.userName}</h3>
                <div className="flex items-center gap-1">
                  {getEmergencyIcon()}
                  <p className="text-[10px] font-semibold text-gray-600 truncate">
                    {getEmergencyLabel()}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="px-4 py-2.5 space-y-2.5">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-700 leading-relaxed">{alert.address}</p>
            </div>

            {/* Phone */}
            {alert.phone && (
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${alert.phone}`} className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  {alert.phone}
                </a>
              </div>
            )}

            {/* Incident Details */}
            {alert.notes && (
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <p className="text-[10px] font-semibold text-gray-500 mb-1 uppercase tracking-wide">Incident Details</p>
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">{alert.notes}</p>
              </div>
            )}
          </div>

          {/* Photos */}
          {alert.photos && alert.photos.length > 0 && (
            <div className="mt-2.5">
              {/* Photo Carousel - Instagram/Facebook style */}
              <div className="relative bg-gray-900">
                {/* Main Photo */}
                <div className="relative w-full h-[300px] flex items-center justify-center">
                  <img 
                    src={alert.photos[currentPhotoIndex].url} 
                    alt={`Emergency scene ${currentPhotoIndex + 1}`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => window.open(alert.photos[currentPhotoIndex].url, '_blank')}
                  />
                  
                  {/* Navigation Arrows - Only show if more than 1 photo */}
                  {alert.photos.length > 1 && (
                    <>
                      {/* Previous Button */}
                      <button
                        onClick={() => setCurrentPhotoIndex((prev) => 
                          prev === 0 ? alert.photos.length - 1 : prev - 1
                        )}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all active:scale-95"
                      >
                        <ChevronLeftIcon className="w-4 h-4 text-gray-800" />
                      </button>
                      
                      {/* Next Button */}
                      <button
                        onClick={() => setCurrentPhotoIndex((prev) => 
                          prev === alert.photos.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center transition-all active:scale-95"
                      >
                        <ChevronRightIcon className="w-4 h-4 text-gray-800" />
                      </button>
                    </>
                  )}
                  
                  {/* Dots Indicator - Only show if more than 1 photo */}
                  {alert.photos.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {alert.photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`transition-all ${
                            index === currentPhotoIndex 
                              ? 'w-5 h-1.5 bg-white' 
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                          } rounded-full`}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Photo Counter - Top right */}
                  {alert.photos.length > 1 && (
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <p className="text-[10px] text-white font-semibold tabular-nums">
                        {currentPhotoIndex + 1}/{alert.photos.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="px-4 pt-2 pb-3 border-t border-gray-100 mt-2.5">
            <p className="text-[10px] text-gray-500 text-center">
              Alert sent {alert.createdAt ? 
                new Date(alert.createdAt.seconds * 1000).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) :
                alert.timestamp ?
                new Date(alert.timestamp).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) :
                'Just now'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertDetailsModal;
