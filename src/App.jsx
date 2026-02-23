import { useState, useRef, useEffect } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import Toast from './components/Toast';
import Banner from './components/Banner';
import { signInWithGoogle, logOut, onAuthChange, getHighQualityPhotoUrl } from './firebase/auth';
import { 
  getUserProfile, 
  subscribeToActiveAlerts,
  createFamilyCircle,
  joinFamilyCircle,
  leaveFamilyCircle,
  removeFamilyMember,
  subscribeFamilyMembers,
  updateUserLocation,
  createInviteCode,
  getAlertHistory,
  deleteHistoryItem,
  subscribeToUserProfile
} from './firebase/services';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  const [allHelpPings, setAllHelpPings] = useState([]);
  const [helpActive, setHelpActive] = useState(false);
  const [helpStopped, setHelpStopped] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [logoutMessage, setLogoutMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(false);
  const [welcomeText, setWelcomeText] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [helpCooldown, setHelpCooldown] = useState({ isOnCooldown: false, timeLeft: null });
  const [emergencyMenuOpen, setEmergencyMenuOpen] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  
  const [history, setHistory] = useState([]);
  
  const [dismissedAlerts, setDismissedAlerts] = useState(() => {
    // Load dismissed alerts from localStorage
    const stored = localStorage.getItem('dismissedAlerts');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const mapViewRef = useRef(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        console.log('Firebase User photoURL:', firebaseUser.photoURL);
        
        // Load user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          console.log('Firestore profile data:', profileResult.data);
          const profile = {
            id: firebaseUser.uid,
            ...profileResult.data,
            // Always use the latest photoURL from Firebase Auth with high quality
            photoUrl: getHighQualityPhotoUrl(firebaseUser.photoURL) || profileResult.data.photoUrl
          };
          console.log('Final userProfile:', profile);
          setUserProfile(profile);
        } else {
          // Use Firebase auth data as fallback
          const profile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            phone: '',
            photoUrl: getHighQualityPhotoUrl(firebaseUser.photoURL)
          };
          console.log('Fallback userProfile:', profile);
          setUserProfile(profile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time user profile updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserProfile(user.uid, (profileData) => {
      if (profileData) {
        const profile = {
          id: user.uid,
          ...profileData,
          // Always use the latest photoURL from Firebase Auth with high quality
          photoUrl: getHighQualityPhotoUrl(user.photoURL) || profileData.photoUrl
        };
        console.log('Profile updated from Firestore:', profile);
        setUserProfile(profile);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to real-time emergency alerts
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToActiveAlerts((alerts) => {
      setAllHelpPings(alerts);
      
      // Check if user has an active emergency alert
      const userActiveAlert = alerts.find(alert => 
        alert.userId === user.uid && alert.status === 'active'
      );
      
      if (userActiveAlert) {
        setHelpActive(true);
        setHelpStopped(false);
      } else {
        // Check if user has a stopped alert
        const userStoppedAlert = alerts.find(alert => 
          alert.userId === user.uid && alert.status === 'stopped'
        );
        
        if (userStoppedAlert) {
          setHelpActive(false);
          setHelpStopped(true);
        } else {
          // No active or stopped alert - reset both states
          setHelpActive(false);
          setHelpStopped(false);
        }
      }
      
      // Filter notifications: exclude user's own alerts, stopped alerts, and dismissed alerts
      const otherUsersActiveAlerts = alerts.filter(alert => 
        alert.userId !== user.uid && 
        alert.status === 'active' &&
        !dismissedAlerts.has(alert.id)
      );
      
      setNotifications(otherUsersActiveAlerts.slice(0, 10)); // Show max 10 notifications
    });

    return () => unsubscribe();
  }, [user, dismissedAlerts]);

  // Subscribe to family members
  useEffect(() => {
    if (!userProfile?.familyId) {
      setFamilyMembers([]);
      setFamilyName('');
      return;
    }

    const unsubscribe = subscribeFamilyMembers(userProfile.familyId, ({ members, familyName }) => {
      setFamilyMembers(members);
      setFamilyName(familyName);
    });

    return () => unsubscribe();
  }, [userProfile?.familyId]);

  // Update user location periodically
  useEffect(() => {
    if (!user || !userProfile?.familyId) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (user?.uid) {
              updateUserLocation(user.uid, position.coords.latitude, position.coords.longitude);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    };

    // Update location immediately
    updateLocation();

    // Update location every 10 seconds
    const interval = setInterval(updateLocation, 10000);

    return () => clearInterval(interval);
  }, [user, userProfile?.familyId]);

  // Fetch alert history
  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.uid && userProfile?.familyId) {
        const result = await getAlertHistory(user.uid);
        if (result.success) {
          setHistory(result.history);
        }
      }
    };

    fetchHistory();
    // Refresh history every 30 seconds
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [user, userProfile?.familyId]);

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      alert('Failed to sign in: ' + result.error);
    } else {
      // Extract first name from display name
      const fullName = result.user?.displayName || 'User';
      const firstName = fullName.split(' ')[0];
      
      if (result.isNewUser) {
        // Show welcome message for new users
        setWelcomeText(`Welcome to Embraze, ${firstName}!`);
        setWelcomeMessage(true);
        setTimeout(() => {
          setWelcomeMessage(false);
        }, 3000);
      } else {
        // Show welcome back message for returning users
        setWelcomeText(`Welcome back, ${firstName}!`);
        setWelcomeMessage(true);
        setTimeout(() => {
          setWelcomeMessage(false);
        }, 3000);
      }
    }
  };

  const handleSignOut = async () => {
    const result = await logOut();
    if (result.success) {
      setUser(null);
      setUserProfile(null);
      setNotifications([]);
      setAllHelpPings([]);
      setLogoutMessage(true);
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setLogoutMessage(false);
      }, 3000);
    }
  };

  const handleNewHelpRequest = (helpRequest) => {
    // This will be handled by Firebase in MapView
    // Real-time listener will automatically update allHelpPings
  };

  const handleCloseNotification = (id) => {
    // Add to dismissed alerts
    const newDismissedAlerts = new Set(dismissedAlerts);
    newDismissedAlerts.add(id);
    setDismissedAlerts(newDismissedAlerts);
    
    // Save to localStorage
    localStorage.setItem('dismissedAlerts', JSON.stringify([...newDismissedAlerts]));
    
    // Remove from notifications
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    // Add all current notification IDs to dismissed alerts
    const newDismissedAlerts = new Set(dismissedAlerts);
    notifications.forEach(n => newDismissedAlerts.add(n.id));
    setDismissedAlerts(newDismissedAlerts);
    
    // Save to localStorage
    localStorage.setItem('dismissedAlerts', JSON.stringify([...newDismissedAlerts]));
    
    // Clear all notifications
    setNotifications([]);
  };

  const handleViewLocation = (notification) => {
    // Fly to the notification location on the map
    if (mapViewRef.current) {
      mapViewRef.current.flyToLocation(notification.latitude, notification.longitude);
    }
  };

  const handleNavigate = (notification) => {
    // Activate map navigation/routing to the notification location
    if (mapViewRef.current) {
      mapViewRef.current.showRouteTo(notification.latitude, notification.longitude);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    setUserProfile(updatedProfile);
    // Profile will be saved to Firebase in SettingsPanel
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const handleCreateFamily = async (inviteCode, familyName) => {
    if (!user?.uid) return;
    
    const result = await createFamilyCircle(user.uid, inviteCode, familyName);
    if (result.success) {
      // Update user profile with family ID
      setUserProfile(prev => ({ ...prev, familyId: result.familyId }));
      showToastMessage('Family circle created!');
    } else {
      showToastMessage('Failed to create family: ' + result.error);
    }
  };

  const handleJoinFamily = async (inviteCode) => {
    if (!user?.uid) return;
    
    const result = await joinFamilyCircle(user.uid, inviteCode);
    if (result.success) {
      // Update user profile with family ID
      setUserProfile(prev => ({ ...prev, familyId: result.familyId }));
      showToastMessage('Joined family circle!');
    } else {
      showToastMessage('Failed to join: ' + result.error);
    }
  };

  const handleLeaveFamily = async () => {
    if (!user?.uid || !userProfile?.familyId) return;
    
    const result = await leaveFamilyCircle(user.uid, userProfile.familyId);
    if (result.success) {
      setUserProfile(prev => ({ ...prev, familyId: null }));
      setFamilyMembers([]);
      showToastMessage('Successfully left family circle');
    } else {
      showToastMessage('Failed to leave: ' + result.error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!user?.uid || !userProfile?.familyId) return;
    
    const result = await removeFamilyMember(user.uid, userProfile.familyId, memberId);
    if (result.success) {
      showToastMessage('Member removed');
    } else {
      showToastMessage('Failed to remove: ' + result.error);
    }
  };

  const handleViewMemberLocation = (member) => {
    if (member.location && mapViewRef.current) {
      mapViewRef.current.flyToLocation(member.location.latitude, member.location.longitude);
    }
  };

  const handleCreateInviteCode = async (inviteCode) => {
    if (!user?.uid || !userProfile?.familyId) return;
    
    await createInviteCode(userProfile.familyId, inviteCode, user.uid);
  };

  const handleFindMyLocation = () => {
    if (mapViewRef.current) {
      mapViewRef.current.handleFindMyLocation();
    }
  };

  const handleOpenHelpMenu = () => {
    if (mapViewRef.current) {
      mapViewRef.current.toggleHelpMenu();
    }
  };

  const handleClearHistory = async () => {
    setHistory([]);
    showToastMessage('History cleared');
  };

  const handleClearHistoryItem = async (itemId) => {
    const result = await deleteHistoryItem(itemId);
    if (result.success) {
      setHistory(prev => prev.filter(item => item.id !== itemId));
      showToastMessage('Item removed from history');
    } else {
      showToastMessage('Failed to remove item');
    }
  };

  const handleAskForHelp = (emergencyType, additionalData) => {
    // Trigger the ask for help function in MapView with emergency type and additional data
    // Don't set helpActive here - let the Firebase subscription handle it
    if (mapViewRef.current) {
      mapViewRef.current.triggerAskForHelp(emergencyType, additionalData);
    }
  };

  const handleStopHelp = () => {
    // Stop the help request in MapView
    // Don't set helpActive here - let the Firebase subscription handle it
    if (mapViewRef.current) {
      mapViewRef.current.stopHelp();
    }
    
    // Marker will remain visible for 24 hours (handled by Firebase query)
    // Notification card is removed immediately (filtered in subscription above)
  };

  // Show loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  // Show login screen if not authenticated
  if (!user || !userProfile) {
    return <LoginScreen onSignIn={handleSignIn} showLogoutMessage={logoutMessage} />;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Toast 
            message={welcomeText || `Welcome to Embraze, ${userProfile?.name || 'User'}!`}
            isVisible={welcomeMessage}
            onClose={() => setWelcomeMessage(false)}
            type="success"
            position="top-center"
          />
          
          <Toast 
            message={toastMessage}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
            type="info"
            position="top-center"
          />
          
          <MapView 
            ref={mapViewRef}
            onNewHelpRequest={handleNewHelpRequest}
            allHelpPings={allHelpPings}
            userProfile={userProfile}
            helpActive={helpActive}
            helpStopped={helpStopped}
            familyMembers={familyMembers}
            onAskForHelp={handleAskForHelp}
            onStopHelp={handleStopHelp}
            onCooldownChange={setHelpCooldown}
            onEmergencyMenuChange={setEmergencyMenuOpen}
            activeSidePanel={activeSidePanel}
            onVoiceListeningChange={setIsVoiceListening}
          />
        </div>
        <SidePanel 
          notifications={notifications}
          onCloseNotification={handleCloseNotification}
          onViewLocation={handleViewLocation}
          onNavigate={handleNavigate}
          userProfile={userProfile}
          onUpdateProfile={handleUpdateProfile}
          helpActive={helpActive}
          helpStopped={helpStopped}
          onSignOut={handleSignOut}
          familyMembers={familyMembers}
          familyName={familyName}
          onCreateFamily={handleCreateFamily}
          onJoinFamily={handleJoinFamily}
          onLeaveFamily={handleLeaveFamily}
          onRemoveMember={handleRemoveMember}
          onViewMemberLocation={handleViewMemberLocation}
          onCreateInviteCode={handleCreateInviteCode}
          showToastMessage={showToastMessage}
          onFindMyLocation={handleFindMyLocation}
          onClearAllNotifications={handleClearAllNotifications}
          alertHistory={history}
          onClearHistory={handleClearHistory}
          onClearHistoryItem={handleClearHistoryItem}
          onOpenHelpMenu={handleOpenHelpMenu}
          isHelpOnCooldown={helpCooldown.isOnCooldown}
          cooldownTime={helpCooldown.timeLeft}
          emergencyMenuOpen={emergencyMenuOpen}
          onPanelChange={setActiveSidePanel}
          onToggleVoice={() => mapViewRef.current?.toggleVoiceRecognition()}
          isListening={isVoiceListening}
        />
      </div>
    </div>
  );
}

export default App;
