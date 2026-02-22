import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre';
import { 
  ExclamationTriangleIcon, 
  XMarkIcon, 
  ChevronDownIcon, 
  ChevronUpIcon, 
  PhoneIcon, 
  UserIcon,
  ClockIcon,
  FireIcon,
  HeartIcon,
  MicrophoneIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRoute, faLocationCrosshairs, faLocationDot, faCarBurst, faHandshake, faCircleInfo, faCompass } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import Toast from './Toast';
import Tooltip from './Tooltip';
import EmergencyNotesModal from './EmergencyNotesModal';
import AlertDetailsModal from './AlertDetailsModal';
import { createOrUpdateEmergencyAlert, stopEmergencyAlert } from '../firebase/services';
import loadingAnimation from '../assets/Trail loading.json';
import embrazeLogo from '../assets/embraze_logo.json';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapView = forwardRef(({ onNewHelpRequest, allHelpPings, userProfile, helpActive, helpStopped, familyMembers = [], onAskForHelp, onStopHelp, onCooldownChange, onEmergencyMenuChange, activeSidePanel }, ref) => {
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
  
  // Cooldown state
  const [cooldownEnd, setCooldownEnd] = useState(() => {
    // Load cooldown from user profile (will be set when profile loads)
    return userProfile?.cooldownEnd || null;
  });
  
  // Update cooldown when user profile changes
  useEffect(() => {
    if (userProfile?.cooldownEnd) {
      setCooldownEnd(userProfile.cooldownEnd);
    }
  }, [userProfile?.cooldownEnd]);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  
  // Long press states for help button
  const [isPressingHelp, setIsPressingHelp] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [pressTimer, setPressTimer] = useState(null);
  const [progressInterval, setProgressInterval] = useState(null);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null);
  
  // Emergency notes modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const recognitionRef = useRef(null);
  const [pendingEmergencyType, setPendingEmergencyType] = useState(null);
  
  // Alert details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAlertDetails, setSelectedAlertDetails] = useState(null);
  
  // Notify parent when emergency menu state changes
  useEffect(() => {
    if (onEmergencyMenuChange) {
      onEmergencyMenuChange(showEmergencyMenu);
    }
  }, [showEmergencyMenu, onEmergencyMenuChange]);
  
  const [viewState, setViewState] = useState({
    longitude: 123.8854,
    latitude: 10.3157,
    zoom: 13,
    pitch: 60,
    bearing: 0
  });

  // Format cooldown time for display
  const formatCooldownTime = () => {
    if (cooldownTimeLeft === 0) return null;
    const minutes = Math.floor(cooldownTimeLeft / 60);
    const seconds = cooldownTimeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const isOnCooldown = cooldownTimeLeft > 0;

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

  // Cooldown timer
  useEffect(() => {
    if (!cooldownEnd) {
      setCooldownTimeLeft(0);
      if (onCooldownChange) {
        onCooldownChange({ isOnCooldown: false, timeLeft: null });
      }
      return;
    }
    
    const updateCooldown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
      setCooldownTimeLeft(remaining);
      
      // Format time for display
      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      const formattedTime = remaining > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : null;
      
      if (onCooldownChange) {
        onCooldownChange({ 
          isOnCooldown: remaining > 0, 
          timeLeft: formattedTime
        });
      }
      
      if (remaining === 0) {
        setCooldownEnd(null);
        // Remove cooldown from Firestore
        if (userProfile?.id) {
          import('../firebase/services').then(({ updateUserCooldown }) => {
            updateUserCooldown(userProfile.id, null);
          });
        }
      }
    };
    
    // Update immediately
    updateCooldown();
    
    // Update every second
    const interval = setInterval(updateCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownEnd, userProfile?.id, onCooldownChange]);

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

  // Initialize voice recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fil-PH'; // Filipino language
    
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      setVoiceTranscript(transcript.toLowerCase());
      
      // Keyword detection for emergency types
      const keywords = {
        fire: ['sunog', 'fire', 'apoy', 'kalayo', 'nasunog', 'nasusunog'],
        accident: ['aksidente', 'accident', 'disgrasya', 'nabangga', 'nabunggo', 'collision'],
        'life-threat': ['delikado', 'danger', 'emergency', 'tabang', 'tulong', 'help', 'sakit', 'masakit', 'critical', 'dying']
      };
      
      const lowerTranscript = transcript.toLowerCase();
      
      // Check for keywords
      for (const [type, words] of Object.entries(keywords)) {
        if (words.some(word => lowerTranscript.includes(word))) {
          // Stop listening
          recognition.stop();
          setIsListening(false);
          
          // Auto-trigger emergency with detected type
          setPendingEmergencyType(type);
          setShowNotesModal(true);
          setShowEmergencyMenu(false);
          
          // Show toast
          const typeLabels = {
            fire: 'Fire',
            accident: 'Accident',
            'life-threat': 'Life Threat'
          };
          setToastMessage(`Detected: ${typeLabels[type]} emergency`);
          setShowToast(true);
          
          break;
        }
      }
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Toggle voice recognition
  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      setToastMessage('Voice recognition not supported');
      setShowToast(true);
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setVoiceTranscript('');
    } else {
      setVoiceTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      setShowEmergencyMenu(true);
    }
  };

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

  // Handle reset camera angle button
  const handleResetCamera = () => {
    if (mapRef.current) {
      // Reset to initial view
      mapRef.current.flyTo({
        center: [123.8854, 10.3157],
        zoom: 13,
        pitch: 60,
        bearing: 0,
        duration: 1500, // 1.5 seconds smooth animation
        essential: true
      });
    }
  };

  // Handle ask for help button
  const handleAskForHelp = async (emergencyType = 'general', additionalData = {}) => {
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
        isActive: true,
        emergencyType: emergencyType, // Store emergency type: 'fire', 'accident', 'life-threat', or 'general'
        notes: additionalData.notes || '',
        photos: additionalData.photos || []
      };
      
      // Create or update alert in Firebase (reuses existing marker if user has one)
      const result = await createOrUpdateEmergencyAlert(userProfile?.id, alertData);
      
      if (result.success) {
        setCurrentAlertId(result.alertId);
        setHelpPing({ id: result.alertId, ...alertData, userId: userProfile?.id });
        onNewHelpRequest({ id: result.alertId, ...alertData, userId: userProfile?.id });
        
        // Show toast message
        if (result.isUpdate) {
          setToastMessage('Alert location updated');
        } else {
          setToastMessage('Emergency alert sent');
        }
        setShowToast(true);
        
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
  
  // Long press handlers for help button
  const handleHelpPressStart = (type) => {
    if (!onAskForHelp || !type) return;
    
    setSelectedEmergencyType(type);
    setIsPressingHelp(true);
    setPressProgress(0);
    
    // Progress animation
    const interval = setInterval(() => {
      setPressProgress(prev => {
        const newProgress = prev + (100 / (3000 / 16.67));
        return Math.min(newProgress, 100);
      });
    }, 16.67);
    setProgressInterval(interval);
    
    // Timer to trigger action after 3 seconds
    const timer = setTimeout(() => {
      handleHelpActivation(type);
    }, 3000);
    setPressTimer(timer);
  };
  
  const handleHelpPressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setIsPressingHelp(false);
    setPressProgress(0);
    setSelectedEmergencyType(null);
  };
  
  const handleHelpActivation = async (type) => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
    setIsPressingHelp(false);
    setPressProgress(0);
    
    // Show notes modal instead of immediately sending alert
    setPendingEmergencyType(type);
    setShowNotesModal(true);
    setShowEmergencyMenu(false);
    setSelectedEmergencyType(null);
  };
  
  const handleNotesSubmit = async ({ notes, photos }) => {
    if (onAskForHelp && pendingEmergencyType) {
      // Start 25-minute cooldown immediately when alert is created
      const cooldownEndTime = Date.now() + (25 * 60 * 1000); // 25 minutes
      setCooldownEnd(cooldownEndTime);
      
      // Save cooldown to Firestore
      if (userProfile?.id) {
        const { updateUserCooldown } = await import('../firebase/services');
        await updateUserCooldown(userProfile.id, cooldownEndTime);
      }
      
      // Pass emergency type and additional data to parent
      await onAskForHelp(pendingEmergencyType, { notes, photos });
      setPendingEmergencyType(null);
    }
  };

  // Reverse geocoding function with timeout and better error handling
  const getAddressFromCoords = async (lat, lng) => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
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
        console.warn('Geocoding API returned error status:', response.status);
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Check if we got valid data
      if (!data || data.error) {
        console.warn('Geocoding returned error:', data?.error);
        throw new Error('Invalid geocoding response');
      }
      
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
        
        // Add country if available and parts are limited
        if (parts.length <= 2 && data.address.country) {
          parts.push(data.address.country);
        }
        
        if (parts.length > 0) {
          console.log('Geocoding success:', parts.join(', '));
          return parts.join(', ');
        }
      }
      
      // Fallback to display_name if address parts not available
      if (data.display_name) {
        // Shorten the display name (take first 3-4 parts for better context)
        const nameParts = data.display_name.split(',').slice(0, 4).map(part => part.trim());
        console.log('Using display_name:', nameParts.join(', '));
        return nameParts.join(', ');
      }
      
      // Last resort: return "Location unavailable" instead of coordinates
      console.warn('No address data available, using fallback');
      return 'Location unavailable';
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      
      // Return a user-friendly message instead of coordinates
      if (error.name === 'AbortError') {
        console.warn('Geocoding request timed out');
        return 'Location unavailable (timeout)';
      }
      
      return 'Location unavailable';
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
    triggerAskForHelp: (emergencyType, additionalData) => handleAskForHelp(emergencyType, additionalData),
    stopHelp: async () => {
      if (currentAlertId) {
        await stopEmergencyAlert(currentAlertId);
        setCurrentAlertId(null);
        setHelpPing(null);
      }
    },
    handleFindMyLocation: handleFindMyLocation,
    openHelpMenu: () => {
      if (!helpActive && !isOnCooldown) {
        setShowEmergencyMenu(true);
      }
    },
    closeHelpMenu: () => {
      setShowEmergencyMenu(false);
    },
    toggleHelpMenu: () => {
      if (!isOnCooldown) {
        setShowEmergencyMenu(prev => !prev);
      }
    },
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
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full max-w-[220px] mx-4">
            <div className="w-24 h-24">
              <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
            <p className="text-gray-700 font-bold text-sm text-center tracking-tight">Calculating route...</p>
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
          
          // Determine icon based on emergency type
          const getEmergencyIcon = () => {
            switch(ping.emergencyType) {
              case 'fire':
                return <FireIcon className="w-4 h-4 text-white drop-shadow-md" />;
              case 'accident':
                return <FontAwesomeIcon icon={faCarBurst} className="w-4 h-4 text-white drop-shadow-md" />;
              case 'life-threat':
                return <ExclamationTriangleIcon className="w-4 h-4 text-white drop-shadow-md" />;
              default:
                return <ExclamationTriangleIcon className="w-4 h-4 text-white drop-shadow-md" />;
            }
          };
          
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
                  
                  {/* Icon - changes based on emergency type */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center justify-center">
                    {getEmergencyIcon()}
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
                    <div className="relative w-9 h-9 rounded-full border-3 border-white shadow-lg overflow-hidden bg-blue-600">
                      {member.photoUrl ? (
                        <img 
                        src={member.photoUrl} 
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!member.photoUrl && (
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
            <div className="p-2.5 min-w-[180px] max-w-[240px] relative bg-white rounded-xl shadow-xl">
              {/* Custom Close Button */}
              <button
                onClick={() => setSelectedMarker(null)}
                className="absolute top-1.5 right-1.5 w-5 h-5 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all z-10 cursor-pointer"
              >
                <XMarkIcon className="w-3 h-3 text-gray-500 hover:text-gray-700 transition-colors" />
              </button>
              
              <div className="flex items-center gap-2 mb-2 pr-6">
                {(() => {
                  // Get emergency type styling
                  const getEmergencyStyle = () => {
                    if (selectedMarker.isFamilyMember) {
                      return {
                        bgColor: 'bg-blue-600',
                        ringColor: 'ring-blue-200',
                        textColor: 'text-blue-600'
                      };
                    }
                    if (selectedMarker.userId === userProfile?.id && helpStopped) {
                      return {
                        bgColor: 'bg-slate-400',
                        ringColor: 'ring-slate-200',
                        textColor: 'text-gray-500'
                      };
                    }
                    
                    switch(selectedMarker.emergencyType) {
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
                    if (selectedMarker.isFamilyMember) return null;
                    
                    switch(selectedMarker.emergencyType) {
                      case 'fire':
                        return <FireIcon className="w-3.5 h-3.5 text-orange-600" />;
                      case 'accident':
                        return <FontAwesomeIcon icon={faCarBurst} className="w-3.5 h-3.5 text-yellow-600" />;
                      case 'life-threat':
                        return <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-600" />;
                      default:
                        return <ExclamationTriangleIcon className="w-3.5 h-3.5 text-blue-600" />;
                    }
                  };
                  
                  const getEmergencyLabel = () => {
                    if (selectedMarker.isFamilyMember) {
                      return selectedMarker.isOnline ? 'Family • Online' : 'Family Member';
                    }
                    if (selectedMarker.userId === userProfile?.id && helpStopped) {
                      return 'Alert Stopped';
                    }
                    
                    switch(selectedMarker.emergencyType) {
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
                  const isActive = selectedMarker.isActive || (selectedMarker.userId === userProfile?.id && helpActive);
                  
                  return (
                    <>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0 shadow-sm ring-1 ${
                        style.bgColor
                      } ${
                        isActive && !selectedMarker.isFamilyMember ? `${style.ringColor} animate-pulse` : style.ringColor
                      }`}>
                        {selectedMarker.photoUrl ? (
                          <img 
                            src={selectedMarker.photoUrl} 
                            alt={selectedMarker.userName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{selectedMarker.userName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-xs truncate leading-tight tracking-tight">{selectedMarker.userName}</h3>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getEmergencyIcon()}
                          <p className={`text-[9px] font-bold truncate ${style.textColor}`}>
                            {getEmergencyLabel()}
                          </p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="space-y-1.5 mb-2 bg-gray-50/50 rounded-lg p-2">
                <div className="flex items-start gap-1.5">
                  <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-500" />
                  <p className="text-[10px] text-gray-700 flex-1 leading-snug line-clamp-2 font-medium">{selectedMarker.address}</p>
                </div>
                
                {selectedMarker.phone && (
                  <div className="flex items-center gap-1.5">
                    <PhoneIcon className="w-3 h-3 flex-shrink-0 text-gray-500" />
                    <a href={`tel:${selectedMarker.phone}`} className="text-[10px] font-semibold transition-colors truncate text-blue-600 hover:text-blue-700">
                      {selectedMarker.phone}
                    </a>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-1.5">
                {/* See Details Button - Show if alert has notes or photos */}
                {!selectedMarker.isFamilyMember && (selectedMarker.notes || (selectedMarker.photos && selectedMarker.photos.length > 0)) && (
                  <button
                    onClick={() => {
                      setSelectedAlertDetails(selectedMarker);
                      setShowDetailsModal(true);
                      setSelectedMarker(null);
                    }}
                    className="w-full py-1.5 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 text-[10px] shadow-sm bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer active:scale-95"
                  >
                    <FontAwesomeIcon icon={faCircleInfo} className="w-3 h-3" />
                    See Details
                  </button>
                )}
                
                {/* Navigate Button */}
                <button
                  onClick={() => {
                    // If already navigating to this destination, end navigation
                    if (selectedDestination?.id === selectedMarker.id) {
                      clearRoute();
                    } else {
                      handleNavigateFromPopup(selectedMarker);
                    }
                  }}
                  disabled={selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember}
                  className={`w-full py-1.5 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 text-[10px] shadow-sm ${
                    selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : selectedDestination?.id === selectedMarker.id
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer active:scale-95'
                        : selectedMarker.isFamilyMember
                          ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                  }`}
                >
                  {selectedMarker.userId === userProfile?.id && !selectedMarker.isFamilyMember ? (
                    <>
                      <FontAwesomeIcon icon={faRoute} className="w-3 h-3" />
                      Your Alert
                    </>
                  ) : selectedDestination?.id === selectedMarker.id ? (
                    <>
                      <XMarkIcon className="w-3.5 h-3.5" />
                      End Navigation
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faRoute} className="w-3 h-3" />
                      Navigate
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-center gap-1 mt-2 pt-1.5 border-t border-gray-100">
                <ClockIcon className="w-2.5 h-2.5 text-gray-500" />
                <p className="text-[9px] text-gray-600 font-medium">
                  {selectedMarker.createdAt ? 
                    new Date(selectedMarker.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    selectedMarker.timestamp ?
                    new Date(selectedMarker.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                    'Just now'
                  }
                </p>
              </div>
            </div>
          </Popup>
        )}
      </Map>
      
      {/* Route Info Panel - Bottom Left */}
      {routeInfo && selectedDestination && (
        <div 
          className="absolute left-3 md:left-6 bottom-20 md:bottom-6 w-56 md:w-60 bg-white rounded-xl shadow-2xl transition-all duration-300 ease-in-out border border-blue-100/50 overflow-hidden backdrop-blur-sm"
        >
          {/* Header */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-full flex items-center justify-between px-2.5 py-2 hover:bg-slate-50 transition-all cursor-pointer bg-slate-50"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                <FontAwesomeIcon icon={faRoute} className="w-3 h-3 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 text-[10px] leading-tight tracking-tight">{selectedDestination.userName}</h3>
                <p className="text-[9px] text-blue-600 font-semibold">Navigation active</p>
              </div>
            </div>
            {isMinimized ? (
              <ChevronUpIcon className="w-3.5 h-3.5 text-gray-500 transition-transform duration-300" />
            ) : (
              <ChevronDownIcon className="w-3.5 h-3.5 text-gray-500 transition-transform duration-300" />
            )}
          </button>

          {/* Panel Content */}
          <div 
            className={`transition-all duration-300 ease-in-out border-t border-blue-100/50 ${
              isMinimized ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
            }`}
          >
            <div className="px-2.5 pb-2.5 space-y-2 pt-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center bg-slate-50 rounded-lg p-2 shadow-sm border border-slate-200">
                  <p className="text-[9px] text-gray-600 mb-0.5 font-bold uppercase tracking-wide">Distance</p>
                  <p className="text-xl font-bold text-blue-600">{routeInfo.distance}</p>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5">km</p>
                </div>
                <div className="text-center bg-slate-50 rounded-lg p-2 shadow-sm border border-slate-200">
                  <p className="text-[9px] text-gray-600 mb-0.5 font-bold uppercase tracking-wide">Duration</p>
                  <p className="text-xl font-bold text-blue-600">{routeInfo.duration}</p>
                  <p className="text-[9px] text-gray-500 font-medium mt-0.5">min</p>
                </div>
              </div>

              <button
                onClick={clearRoute}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-full font-bold transition-all flex items-center justify-center gap-1.5 text-[10px] cursor-pointer active:scale-95 shadow-sm border border-slate-200"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
                End Navigation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Find My Location Button - Visible on all devices at top right */}
      <div className="absolute top-4 right-4 md:right-[80px] z-10 flex flex-col gap-2">
        <Tooltip text="Find My Location" position="left">
          <button 
            onClick={handleFindMyLocation}
            className="w-11 h-11 bg-white backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 hover:scale-110 active:scale-95 group cursor-pointer border border-blue-100/50 flex items-center justify-center"
            disabled={!userLocation}
          >
            <FontAwesomeIcon icon={faLocationCrosshairs} className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>
        </Tooltip>
        
        <Tooltip text="Reset Camera View" position="left">
          <button 
            onClick={handleResetCamera}
            className="w-11 h-11 bg-white backdrop-blur-md rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 group cursor-pointer border border-blue-100/50 flex items-center justify-center"
          >
            <FontAwesomeIcon 
              icon={faCompass} 
              className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" 
              style={{ 
                transform: `rotate(${-viewState.bearing}deg)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </button>
        </Tooltip>
      </div>
      
      {/* Request Help Button - Bottom Center - Desktop Only */}
      <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        {/* Emergency Type Menu - Drop-up */}
        <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 p-1.5 min-w-[180px] transition-all duration-300 ease-out ${
          showEmergencyMenu && !isOnCooldown
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          {/* Voice Listening Indicator */}
          {isListening && (
            <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-[10px] font-bold text-blue-700">Listening...</p>
              </div>
              {voiceTranscript && (
                <p className="text-[9px] text-gray-600 mt-1 italic">"{voiceTranscript}"</p>
              )}
            </div>
          )}
          
          <div className="space-y-1">
            {/* Fire Emergency */}
            <button
              onMouseDown={() => handleHelpPressStart('fire')}
              onMouseUp={handleHelpPressEnd}
              onMouseLeave={handleHelpPressEnd}
              onTouchStart={() => handleHelpPressStart('fire')}
              onTouchEnd={handleHelpPressEnd}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-orange-50 transition-all text-left relative overflow-hidden group"
            >
              {/* Progress indicator - fills from bottom to top */}
              {isPressingHelp && selectedEmergencyType === 'fire' && (
                <div 
                  className="absolute inset-0 bg-orange-500/30 rounded-lg"
                  style={{ 
                    height: `${pressProgress}%`,
                    bottom: 0,
                    top: 'auto',
                    transition: 'none'
                  }}
                />
              )}
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors relative z-10">
                <FireIcon className="w-4 h-4 text-orange-600" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-xs text-gray-700">Fire</p>
                <p className="text-[9px] text-gray-500">Hold 3s</p>
              </div>
            </button>
            
            {/* Accident Emergency */}
            <button
              onMouseDown={() => handleHelpPressStart('accident')}
              onMouseUp={handleHelpPressEnd}
              onMouseLeave={handleHelpPressEnd}
              onTouchStart={() => handleHelpPressStart('accident')}
              onTouchEnd={handleHelpPressEnd}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-yellow-50 transition-all text-left relative overflow-hidden group"
            >
              {/* Progress indicator - fills from bottom to top */}
              {isPressingHelp && selectedEmergencyType === 'accident' && (
                <div 
                  className="absolute inset-0 bg-yellow-500/30 rounded-lg"
                  style={{ 
                    height: `${pressProgress}%`,
                    bottom: 0,
                    top: 'auto',
                    transition: 'none'
                  }}
                />
              )}
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 group-hover:bg-yellow-200 transition-colors relative z-10">
                <FontAwesomeIcon icon={faCarBurst} className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-xs text-gray-700">Accident</p>
                <p className="text-[9px] text-gray-500">Hold 3s</p>
              </div>
            </button>
            
            {/* Life Threat Emergency */}
            <button
              onMouseDown={() => handleHelpPressStart('life-threat')}
              onMouseUp={handleHelpPressEnd}
              onMouseLeave={handleHelpPressEnd}
              onTouchStart={() => handleHelpPressStart('life-threat')}
              onTouchEnd={handleHelpPressEnd}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-all text-left relative overflow-hidden group"
            >
              {/* Progress indicator - fills from bottom to top */}
              {isPressingHelp && selectedEmergencyType === 'life-threat' && (
                <div 
                  className="absolute inset-0 bg-red-500/30 rounded-lg"
                  style={{ 
                    height: `${pressProgress}%`,
                    bottom: 0,
                    top: 'auto',
                    transition: 'none'
                  }}
                />
              )}
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 group-hover:bg-red-200 transition-colors relative z-10">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              </div>
              <div className="relative z-10">
                <p className="font-bold text-xs text-gray-700">Life Threat</p>
                <p className="text-[9px] text-gray-500">Hold 3s</p>
              </div>
            </button>
          </div>
        </div>
        
        {/* Main Button */}
        <button
          onClick={() => {
            if (!isOnCooldown) {
              setShowEmergencyMenu(!showEmergencyMenu);
            }
          }}
          className={`relative overflow-hidden rounded-full font-bold text-sm shadow-lg transition-all duration-300 ease-out ${
            isOnCooldown
              ? 'bg-slate-600 text-white border border-slate-500 cursor-not-allowed px-6 py-3'
              : showEmergencyMenu
                ? 'bg-gray-700 hover:bg-gray-800 text-white border border-gray-600 px-6 py-3'
                : 'bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 border border-gray-200 hover:shadow-xl hover:scale-105 active:scale-95 px-6 py-3'
          }`}
          disabled={isOnCooldown}
        >
          <div className="relative z-10 flex items-center gap-2 transition-all duration-300">
            {isOnCooldown ? (
              <>
                <ClockIcon className="w-5 h-5 transition-all duration-300" />
                <span className="transition-all duration-300 tabular-nums">{formatCooldownTime()}</span>
              </>
            ) : showEmergencyMenu ? (
              <>
                <XMarkIcon className="w-5 h-5 transition-all duration-300" />
                <span className="transition-all duration-300">Close</span>
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faHandshake} className="w-5 h-5 transition-all duration-300 text-blue-600" />
                <span className="transition-all duration-300">Request Help</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Voice Recognition Button - Desktop - Right Side */}
      <div className="hidden md:block absolute bottom-6 right-20 z-10">
        <button
          onClick={toggleVoiceRecognition}
          className={`w-12 h-12 rounded-full font-bold shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-white/95 backdrop-blur-md hover:bg-white text-gray-700 border border-gray-200 hover:shadow-xl hover:scale-105 active:scale-95'
          }`}
          title={isListening ? 'Stop listening' : 'Voice command'}
        >
          <MicrophoneIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Type Menu - Mobile - Above Bottom Navigation */}
      <div className={`md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-[75] bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200 p-1.5 min-w-[180px] transition-all duration-300 ease-out ${
        showEmergencyMenu && !isOnCooldown
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {/* Voice Listening Indicator - Mobile */}
        {isListening && (
          <div className="mb-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-blue-700">Listening...</p>
            </div>
            {voiceTranscript && (
              <p className="text-[9px] text-gray-600 mt-1 italic">"{voiceTranscript}"</p>
            )}
          </div>
        )}
        
        <div className="space-y-1">
          {/* Fire Emergency */}
          <button
            onTouchStart={() => handleHelpPressStart('fire')}
            onTouchEnd={handleHelpPressEnd}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg active:bg-orange-50 transition-all text-left relative overflow-hidden"
          >
            {/* Progress indicator */}
            {isPressingHelp && selectedEmergencyType === 'fire' && (
              <div 
                className="absolute inset-0 bg-orange-500/30 rounded-lg"
                style={{ 
                  height: `${pressProgress}%`,
                  bottom: 0,
                  top: 'auto',
                  transition: 'none'
                }}
              />
            )}
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 relative z-10">
              <FireIcon className="w-4 h-4 text-orange-600" />
            </div>
            <div className="relative z-10">
              <p className="font-bold text-xs text-gray-900">Fire</p>
              <p className="text-[9px] text-gray-600">Hold 3s</p>
            </div>
          </button>
          
          {/* Accident Emergency */}
          <button
            onTouchStart={() => handleHelpPressStart('accident')}
            onTouchEnd={handleHelpPressEnd}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg active:bg-yellow-50 transition-all text-left relative overflow-hidden"
          >
            {/* Progress indicator */}
            {isPressingHelp && selectedEmergencyType === 'accident' && (
              <div 
                className="absolute inset-0 bg-yellow-500/30 rounded-lg"
                style={{ 
                  height: `${pressProgress}%`,
                  bottom: 0,
                  top: 'auto',
                  transition: 'none'
                }}
              />
            )}
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0 relative z-10">
              <FontAwesomeIcon icon={faCarBurst} className="w-4 h-4 text-yellow-600" />
            </div>
            <div className="relative z-10">
              <p className="font-bold text-xs text-gray-900">Accident</p>
              <p className="text-[9px] text-gray-600">Hold 3s</p>
            </div>
          </button>
          
          {/* Life Threat Emergency */}
          <button
            onTouchStart={() => handleHelpPressStart('life-threat')}
            onTouchEnd={handleHelpPressEnd}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg active:bg-red-50 transition-all text-left relative overflow-hidden"
          >
            {/* Progress indicator */}
            {isPressingHelp && selectedEmergencyType === 'life-threat' && (
              <div 
                className="absolute inset-0 bg-red-500/30 rounded-lg"
                style={{ 
                  height: `${pressProgress}%`,
                  bottom: 0,
                  top: 'auto',
                  transition: 'none'
                }}
              />
            )}
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 relative z-10">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            </div>
            <div className="relative z-10">
              <p className="font-bold text-xs text-gray-900">Life Threat</p>
              <p className="text-[9px] text-gray-600">Hold 3s</p>
            </div>
          </button>
        </div>
      </div>

      {/* Voice Recognition Button - Mobile - Floating at Right Side */}
      {!activeSidePanel && (
        <div className="md:hidden fixed bottom-24 right-3 z-[70]">
          <button
            onClick={toggleVoiceRecognition}
            className={`w-12 h-12 rounded-full font-bold shadow-lg transition-all duration-300 ease-out flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-white/95 backdrop-blur-md text-gray-700 border border-gray-200 active:scale-95'
            }`}
          >
            <MicrophoneIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Emergency Notes Modal */}
      <EmergencyNotesModal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setPendingEmergencyType(null);
        }}
        onSubmit={handleNotesSubmit}
        emergencyType={pendingEmergencyType}
      />

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
});

MapView.displayName = 'MapView';

export default MapView;
