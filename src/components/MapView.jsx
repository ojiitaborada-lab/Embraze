import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  PhoneIcon, 
  UserIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faLocationCrosshairs, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import Toast from './Toast';
import Tooltip from './Tooltip';
import { createEmergencyAlert, stopEmergencyAlert } from '../firebase/services';
import loadingAnimation from '../../public/Loading.json';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapView = forwardRef(({ onNewHelpRequest, allHelpPings, userProfile, helpActive, helpStopped, familyMembers = [] }, ref) => {
  const mapRef = useRef();
  const [userLocation, setUserLocation] = useState(null);
  const [animatedUserLocation, setAnimatedUserLocation] = useState(null); // Animated user position
  const [showUserMarker, setShowUserMarker] = useState(false);
  const [helpPing, setHelpPing] = useState(null);
  const [routeData, setRouteData] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [currentAlertId, setCurrentAlertId] = useState(null); // Track current user's alert ID
  const [animatedFamilyPositions, setAnimatedFamilyPositions] = useState({}); // Store animated positions
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false); // Loading state for route calculation
  const [viewState, setViewState] = useState({
    longitude: 123.8854,
    latitude: 10.3157,
    zoom: 13,
    pitch: 60,
    bearing: 0
  });

  // Update selected destination when allHelpPings changes (profile updates)
  useEffect(() => {
    if (selectedDestination) {
      const updatedDestination = allHelpPings.find(p => p.id === selectedDestination.id);
      if (updatedDestination) {
        setSelectedDestination(updatedDestination);
      }
    }
  }, [allHelpPings]);

  // Animate family member positions smoothly
  useEffect(() => {
    familyMembers.forEach(member => {
      if (member.location && member.id !== userProfile?.id) {
        const currentPos = animatedFamilyPositions[member.id];
        const targetPos = {
          longitude: member.location.longitude,
          latitude: member.location.latitude
        };
        
        if (!currentPos) {
          // First time seeing this member, set position immediately
          setAnimatedFamilyPositions(prev => ({
            ...prev,
            [member.id]: targetPos
          }));
        } else if (
          Math.abs(currentPos.longitude - targetPos.longitude) > 0.00001 || 
          Math.abs(currentPos.latitude - targetPos.latitude) > 0.00001
        ) {
          // Position changed, animate to new position
          const startPos = { ...currentPos };
          const startTime = Date.now();
          const duration = 2000; // 2 seconds animation
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Smooth easing function (ease-in-out)
            const easeProgress = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const interpolatedLng = startPos.longitude + (targetPos.longitude - startPos.longitude) * easeProgress;
            const interpolatedLat = startPos.latitude + (targetPos.latitude - startPos.latitude) * easeProgress;
            
            setAnimatedFamilyPositions(prev => ({
              ...prev,
              [member.id]: {
                longitude: interpolatedLng,
                latitude: interpolatedLat
              }
            }));
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        }
      }
    });
  }, [familyMembers, userProfile?.id]);

  // Animate user location smoothly
  useEffect(() => {
    if (!userLocation) return;
    
    if (!animatedUserLocation) {
      // First time, set immediately
      setAnimatedUserLocation(userLocation);
    } else if (
      Math.abs(animatedUserLocation.longitude - userLocation.longitude) > 0.00001 || 
      Math.abs(animatedUserLocation.latitude - userLocation.latitude) > 0.00001
    ) {
      // Position changed, animate to new position
      const startPos = { ...animatedUserLocation };
      const targetPos = { ...userLocation };
      const startTime = Date.now();
      const duration = 1500; // 1.5 seconds for smoother user movement
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth easing function
        const easeProgress = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const interpolatedLng = startPos.longitude + (targetPos.longitude - startPos.longitude) * easeProgress;
        const interpolatedLat = startPos.latitude + (targetPos.latitude - startPos.latitude) * easeProgress;
        
        setAnimatedUserLocation({
          longitude: interpolatedLng,
          latitude: interpolatedLat
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [userLocation]);

  // Show user marker automatically during navigation
  useEffect(() => {
    if (selectedDestination) {
      setShowUserMarker(true);
    }
  }, [selectedDestination]);

  // Track user location in real-time (but don't show marker automatically)
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        // Don't automatically show marker - only when user clicks "Find My Location"
      },
      (error) => {
        console.warn('Location error:', error.message);
        // Fallback to default location (Cebu City) if geolocation fails
        setUserLocation({ latitude: 10.3157, longitude: 123.8854 });
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 30000 // Allow cached position up to 30 seconds old
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Handle find my location button
  const handleFindMyLocation = () => {
    if (userLocation && mapRef.current) {
      setShowUserMarker(true);
      // Smooth fly to user location
      mapRef.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 16,
        pitch: 60,
        duration: 1500, // 1.5 seconds smooth animation
        essential: true
      });
    }
  };

  // Handle ask for help button
  const handleAskForHelp = async () => {
    if (userLocation) {
      // Get address from coordinates (reverse geocoding)
      const address = await getAddressFromCoords(userLocation.latitude, userLocation.longitude);
      
      const alertData = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        userName: userProfile?.name || 'User',
        phone: userProfile?.phone || '',
        photoUrl: userProfile?.photoUrl || null,
        address: address,
        isActive: true
      };
      
      // Save to Firebase
      const result = await createEmergencyAlert(userProfile?.id, alertData);
      
      if (result.success) {
        setCurrentAlertId(result.alertId);
        setHelpPing({ id: result.alertId, ...alertData, userId: userProfile?.id });
        onNewHelpRequest({ id: result.alertId, ...alertData, userId: userProfile?.id });
        
        // Smooth zoom animation to user location
        if (mapRef.current) {
          mapRef.current.flyTo({
            center: [userLocation.longitude, userLocation.latitude],
            zoom: 17,
            pitch: 60,
            duration: 2000,
            essential: true
          });
        }
      } else {
        alert('Failed to create emergency alert: ' + result.error);
      }
    }
  };

  // Fetch route from OSRM (free, no API key required)
  const fetchRoute = async (startLat, startLng, endLat, endLng) => {
    setIsCalculatingRoute(true);
    
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteData({
          type: 'Feature',
          geometry: route.geometry
        });
        
        // Set route info (distance and duration)
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(2), // Convert to km
          duration: Math.round(route.duration / 60) // Convert to minutes
        });
        
        // Show success toast
        setToastMessage('Starting navigation');
        setShowToast(true);
        
        // Fit map to show entire route
        if (mapRef.current) {
          const coordinates = route.geometry.coordinates;
          const bounds = coordinates.reduce((bounds, coord) => {
            return [
              [Math.min(bounds[0][0], coord[0]), Math.min(bounds[0][1], coord[1])],
              [Math.max(bounds[1][0], coord[0]), Math.max(bounds[1][1], coord[1])]
            ];
          }, [[startLng, startLat], [startLng, startLat]]);
          
          mapRef.current.fitBounds(bounds, {
            padding: 80,
            duration: 1500
          });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      setToastMessage('Failed to calculate route');
      setShowToast(true);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  // Handle marker click to show popup (don't show blue marker)
  const handleMarkerClick = (e, ping) => {
    e.stopPropagation();
    setSelectedMarker(ping);
  };

  // Handle navigate from marker popup
  const handleNavigateFromPopup = (ping) => {
    if (userLocation) {
      setSelectedDestination(ping);
      setIsMinimized(false);
      fetchRoute(userLocation.latitude, userLocation.longitude, ping.latitude, ping.longitude);
      setSelectedMarker(null); // Close popup
    }
  };

  // Clear route
  const clearRoute = () => {
    setRouteData(null);
    setSelectedDestination(null);
    setRouteInfo(null);
    setIsMinimized(false);
    setShowUserMarker(false); // Hide user marker when navigation ends
    setToastMessage('Navigation ended');
    setShowToast(true);
  };

  // Reverse geocoding function with timeout and better error handling
  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Increased to 10 second timeout
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Embraze Emergency App'
          }
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Build a more readable address with more fallback options
      if (data.address) {
        const parts = [];
        
        // Try to get street address
        if (data.address.road || data.address.street) {
          parts.push(data.address.road || data.address.street);
        } else if (data.address.pedestrian) {
          parts.push(data.address.pedestrian);
        } else if (data.address.footway) {
          parts.push(data.address.footway);
        }
        
        // Try to get area/neighborhood
        if (data.address.suburb || data.address.neighbourhood || data.address.quarter) {
          parts.push(data.address.suburb || data.address.neighbourhood || data.address.quarter);
        } else if (data.address.village || data.address.hamlet) {
          parts.push(data.address.village || data.address.hamlet);
        }
        
        // Try to get city
        if (data.address.city || data.address.town || data.address.municipality) {
          parts.push(data.address.city || data.address.town || data.address.municipality);
        } else if (data.address.county) {
          parts.push(data.address.county);
        }
        
        // Add state/province if available
        if (data.address.state || data.address.province) {
          parts.push(data.address.state || data.address.province);
        }
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
      
      // Fallback to display_name if address parts not available
      if (data.display_name) {
        // Shorten the display name (take first 3-4 parts for better context)
        const nameParts = data.display_name.split(',').slice(0, 4).map(part => part.trim());
        return nameParts.join(', ');
      }
      
      // Last resort: return coordinates
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      
      // Try to provide a more helpful fallback message
      if (error.name === 'AbortError') {
        console.warn('Geocoding request timed out, using coordinates');
      }
      
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Trigger map resize when component mounts
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.resize();
      }, 100);
    }
  }, []);

  // Expose handleAskForHelp and stopHelp to parent component
  useImperativeHandle(ref, () => ({
    triggerAskForHelp: handleAskForHelp,
    stopHelp: async () => {
      if (currentAlertId) {
        await stopEmergencyAlert(currentAlertId);
        setCurrentAlertId(null);
        setHelpPing(null);
      }
    },
    handleFindMyLocation: handleFindMyLocation,
    flyToLocation: (latitude, longitude) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 17,
          pitch: 60,
          duration: 2000,
          essential: true
        });
      }
    },
    showRouteTo: (latitude, longitude) => {
      if (userLocation) {
        const destination = allHelpPings.find(p => p.latitude === latitude && p.longitude === longitude);
        if (destination) {
          setSelectedDestination(destination);
          setIsMinimized(false);
          fetchRoute(userLocation.latitude, userLocation.longitude, destination.latitude, destination.longitude);
          setSelectedMarker(null); // Close popup if open
        }
      }
    }
  }));

  return (
    <div className="w-full h-full relative">
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="success"
        position="top-center"
      />

      {/* Loading Modal for Route Calculation - Compact */}
      {isCalculatingRoute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 shadow-2xl flex flex-col items-center gap-2.5">
            <div className="w-16 h-16">
              <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
            <p className="text-gray-700 font-medium text-xs">Calculating route...</p>
          </div>
        </div>
      )}
      
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        attributionControl={false}
        interactiveLayerIds={['route-line']}
      >
        {/* Route Line */}
        {routeData && (
          <Source id="route" type="geojson" data={routeData}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#3B82F6',
                'line-width': 5,
                'line-opacity': 0.8
              }}
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
            />
          </Source>
        )}

        {/* User Location Marker */}
        {animatedUserLocation && showUserMarker && (
          <Marker
            longitude={animatedUserLocation.longitude}
            latitude={animatedUserLocation.latitude}
            anchor="center"
          >
            <div className="relative">
              {/* Pulsing circle */}
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" style={{ width: '20px', height: '20px' }} />
              {/* Solid center dot */}
              <div className="relative bg-blue-600 rounded-full border-2 border-white shadow-lg" style={{ width: '20px', height: '20px' }} />
            </div>
          </Marker>
        )}

        {/* Help Ping Markers - Show all community help requests */}
        {allHelpPings && allHelpPings.map((ping) => {
          const isActiveEmergency = ping.isActive || (ping.userId === userProfile?.id && helpActive);
          const isStoppedEmergency = ping.userId === userProfile?.id && helpStopped;
          const markerColor = selectedDestination?.id === ping.id 
            ? '#10B981' // Green for selected destination
            : selectedMarker?.id === ping.id 
              ? '#F59E0B' // Orange for selected marker
              : isStoppedEmergency
                ? '#9CA3AF' // Gray for stopped emergency
                : isActiveEmergency 
                  ? '#EF4444' // Red for active emergency
                  : '#3B82F6'; // Blue for normal
          
          return (
            <Marker
              key={ping.id}
              longitude={ping.longitude}
              latitude={ping.latitude}
              anchor="bottom"
            >
              <button 
                onClick={(e) => handleMarkerClick(e, ping)}
                className={`relative cursor-pointer transition-all ${
                  isActiveEmergency 
                    ? 'animate-bounce' 
                    : isStoppedEmergency 
                      ? 'opacity-40' 
                      : ''
                }`}
              >
                <div className="relative">
                  {/* Subtle glow effect */}
                  {isActiveEmergency && (
                    <div 
                      className="absolute inset-0 rounded-full blur-md opacity-50 animate-pulse" 
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        top: '-4px', 
                        left: '-4px',
                        backgroundColor: markerColor
                      }} 
                    />
                  )}
                  
                  {/* Simple pin shape */}
                  <svg width="36" height="48" viewBox="0 0 36 48" className="relative drop-shadow-xl">
                    {/* Outer white border with subtle shadow */}
                    <defs>
                      <linearGradient id={`gradient-${ping.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: markerColor, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: markerColor, stopOpacity: 0.8 }} />
                      </linearGradient>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                      </filter>
                    </defs>
                    
                    {/* Outer white border */}
                    <path
                      d="M18 0 C8.1 0 0 8.1 0 18 C0 27 18 48 18 48 C18 48 36 27 36 18 C36 8.1 27.9 0 18 0 Z"
                      fill="white"
                      filter="url(#shadow)"
                    />
                    
                    {/* Inner colored fill with gradient */}
                    <path
                      d="M18 2.5 C9.4 2.5 2.5 9.4 2.5 18 C2.5 25.5 18 45 18 45 C18 45 33.5 25.5 33.5 18 C33.5 9.4 26.6 2.5 18 2.5 Z"
                      fill={`url(#gradient-${ping.id})`}
                    />
                    
                    {/* Inner highlight for depth */}
                    <ellipse
                      cx="18"
                      cy="14"
                      rx="8"
                      ry="6"
                      fill="white"
                      opacity="0.15"
                    />
                  </svg>
                  
                  {/* Icon */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                    <ExclamationTriangleIcon className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                </div>
              </button>
            </Marker>
          );
        })}

        {/* Family Member Markers */}
        {familyMembers && familyMembers
          .filter(member => member.id !== userProfile?.id && member.location && animatedFamilyPositions[member.id])
          .map((member) => {
            const position = animatedFamilyPositions[member.id];
            return (
              <Marker
                key={`family-${member.id}`}
                longitude={position.longitude}
                latitude={position.latitude}
                anchor="center"
              >
                <div className="relative cursor-pointer" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarker({
                    id: `family-${member.id}`,
                    userName: member.name,
                    photoUrl: member.photoUrl,
                    latitude: position.latitude,
                    longitude: position.longitude,
                    address: 'Family Member',
                    phone: member.phone,
                    isFamilyMember: true,
                    isOnline: member.isOnline
                  });
                }}>
                  <div className="relative">
                    {/* Pulsing ring for online status */}
                    {member.isOnline && (
                      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-40" style={{ width: '36px', height: '36px', top: '-3px', left: '-3px' }} />
                    )}
                    
                    {/* Avatar */}
                    <div className="relative w-9 h-9 rounded-full border-3 border-white shadow-lg overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600">
                      {member.photoUrl ? (
                        <img 
                        src={member.photoUrl} 
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Online indicator */}
                  {member.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
              </div>
            </Marker>
            );
          })
        }

        {/* Marker Popup */}
        {selectedMarker && (
          <Popup
            longitude={selectedMarker.longitude}
            latitude={selectedMarker.latitude}
            anchor="bottom"
            onClose={() => setSelectedMarker(null)}
            closeButton={false}
            closeOnClick={false}
            offset={[0, -44]}
            className="marker-popup"
          >
            <div className="p-2.5 min-w-[180px] max-w-[280px] relative">
              {/* Custom Close Button */}
              <button
                onClick={() => setSelectedMarker(null)}
                className="absolute top-1.5 right-1.5 w-5 h-5 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-all z-10"
              >
                <XMarkIcon className="w-2.5 h-2.5 text-gray-500 hover:text-gray-700 transition-colors" />
              </button>
              
              <div className="flex items-center gap-2.5 mb-2.5 pr-6">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0 ${
                  selectedMarker.isFamilyMember
                    ? 'bg-purple-500'
                    : selectedMarker.userId === userProfile?.id && helpStopped
                      ? 'bg-gray-400'
                      : selectedMarker.isActive || (selectedMarker.userId === userProfile?.id && helpActive)
                        ? 'bg-red-500 animate-pulse'
                        : 'bg-blue-500'
                }`}>
                  {selectedMarker.photoUrl ? (
                    <img 
                      src={selectedMarker.photoUrl} 
                      alt={selectedMarker.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{selectedMarker.userName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-xs truncate leading-tight">{selectedMarker.userName}</h3>
                  <p className={`text-[10px] font-medium truncate mt-0.5 ${
                    selectedMarker.isFamilyMember
                      ? 'text-purple-600'
                      : selectedMarker.userId === userProfile?.id && helpStopped
                        ? 'text-gray-400'
                        : selectedMarker.isActive || (selectedMarker.userId === userProfile?.id && helpActive)
                          ? 'text-red-600'
                          : 'text-blue-600'
                  }`}>
                    {selectedMarker.isFamilyMember
                      ? selectedMarker.isOnline ? 'Family • Online' : 'Family Member'
                      : selectedMarker.userId === userProfile?.id && helpStopped
                        ? 'Alert Stopped'
                        : selectedMarker.isActive || (selectedMarker.userId === userProfile?.id && helpActive)
                          ? 'Emergency'
                          : 'Alert'
                    }
                  </p>
                </div>
              </div>
              
              <div className="space-y-1.5 mb-2.5">
                <div className="flex items-start gap-2">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-gray-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-gray-600 flex-1 leading-snug line-clamp-2">{selectedMarker.address}</p>
                </div>
                
                {selectedMarker.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <a href={`tel:${selectedMarker.phone}`} className="text-[11px] text-blue-600 hover:underline truncate">
                      {selectedMarker.phone}
                    </a>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => handleNavigateFromPopup(selectedMarker)}
                disabled={selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember}
                className={`w-full py-2 rounded-full font-medium transition-all flex items-center justify-center gap-1.5 text-[11px] ${
                  selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedMarker.isFamilyMember
                      ? 'bg-purple-500 hover:bg-purple-600 text-white cursor-pointer'
                      : 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                }`}
              >
                <FontAwesomeIcon icon={faRoute} className="w-3 h-3" />
                {selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember ? 'Your Alert' : 'Navigate'}
              </button>
              
              <p className="text-[10px] text-gray-400 text-center mt-1.5">
                {selectedMarker.createdAt ? 
                  new Date(selectedMarker.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                  selectedMarker.timestamp ?
                  new Date(selectedMarker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                  'Just now'
                }
              </p>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Route Info Panel - Bottom Left */}
      {routeInfo && selectedDestination && (
        <div 
          className="absolute left-3 md:left-6 bottom-20 md:bottom-6 w-64 md:w-72 bg-white rounded-xl shadow-xl transition-all duration-300 ease-in-out border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-full flex items-center justify-between px-2.5 md:px-3 py-2 md:py-2.5 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faRoute} className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 text-[11px] md:text-xs leading-tight">{selectedDestination.userName}</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500">Navigation active</p>
              </div>
            </div>
            {isMinimized ? (
              <ChevronUpIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 transition-transform duration-300" />
            ) : (
              <ChevronDownIcon className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400 transition-transform duration-300" />
            )}
          </button>

          {/* Panel Content */}
          <div 
            className={`transition-all duration-300 ease-in-out border-t border-gray-100 ${
              isMinimized ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
            }`}
          >
            <div className="px-2.5 md:px-3 pb-2.5 md:pb-3 space-y-2 md:space-y-2.5">
              <div className="grid grid-cols-2 gap-2 md:gap-2.5 pt-2 md:pt-2.5">
                <div className="text-center">
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-0.5">Distance</p>
                  <p className="text-lg md:text-xl font-semibold text-gray-900">{routeInfo.distance}</p>
                  <p className="text-[9px] md:text-[10px] text-gray-400">km</p>
                </div>
                <div className="text-center border-l border-gray-100">
                  <p className="text-[9px] md:text-[10px] text-gray-500 mb-0.5">Duration</p>
                  <p className="text-lg md:text-xl font-semibold text-gray-900">{routeInfo.duration}</p>
                  <p className="text-[9px] md:text-[10px] text-gray-400">min</p>
                </div>
              </div>

              <button
                onClick={clearRoute}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 md:py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 text-[11px] md:text-xs cursor-pointer active:scale-95"
              >
                <XMarkIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                End Navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Find My Location Button - Visible on all devices at top right */}
      <div className="absolute top-4 right-4 md:right-[80px] z-10">
        <Tooltip text="Find My Location" position="left">
          <button 
            onClick={handleFindMyLocation}
            className="flex bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 hover:scale-105 group cursor-pointer"
            disabled={!userLocation}
          >
            <FontAwesomeIcon icon={faLocationCrosshairs} className="w-4 h-4 text-gray-700 group-hover:text-blue-500 transition-colors" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
});

MapView.displayName = 'MapView';

export default MapView;
