import { useState, useRef, useEffect } from 'react';
import MapView from './components/MapView';
import SidePanel from './components/SidePanel';
import LoginScreen from './components/LoginScreen';
import LoadingScreen from './components/LoadingScreen';
import Toast from './components/Toast';
import { signInWithGoogle, logOut, onAuthChange } from './firebase/auth';
import { 
  getUserProfile, 
  subscribeToActiveAlerts,
  createFamilyCircle,
  joinFamilyCircle,
  leaveFamilyCircle,
  removeFamilyMember,
  subscribeFamilyMembers,
  updateUserLocation,
  createInviteCode
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
  const [familyMembers, setFamilyMembers] = useState([]);
  const [familyName, setFamilyName] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const mapViewRef = useRef(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Load user profile from Firestore
        const profileResult = await getUserProfile(firebaseUser.uid);
        if (profileResult.success) {
          setUserProfile({
            id: firebaseUser.uid,
            ...profileResult.data
          });
        } else {
          // Use Firebase auth data as fallback
          setUserProfile({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email,
            phone: '',
            photoUrl: firebaseUser.photoURL
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to real-time emergency alerts
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToActiveAlerts((alerts) => {
      setAllHelpPings(alerts);
      
      // Show only other users' alerts in notifications (not your own)
      const otherUsersAlerts = alerts.filter(alert => alert.userId !== user.uid);
      setNotifications(otherUsersAlerts.slice(0, 10)); // Show max 10 notifications
    });

    return () => unsubscribe();
  }, [user]);

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

  const handleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      alert('Failed to sign in: ' + result.error);
    } else if (result.isNewUser) {
      // Show welcome message for new users
      setWelcomeMessage(true);
      setTimeout(() => {
        setWelcomeMessage(false);
      }, 3000);
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
    setNotifications(prev => prev.filter(n => n.id !== id));
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
      showToastMessage('Left family circle');
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
      mapViewRef.current.flyTo({
        center: [member.location.longitude, member.location.latitude],
        zoom: 17,
        pitch: 60,
        duration: 2000,
        essential: true
      });
    }
  };

  const handleCreateInviteCode = async (inviteCode) => {
    if (!user?.uid || !userProfile?.familyId) return;
    
    await createInviteCode(userProfile.familyId, inviteCode, user.uid);
  };

  const handleAskForHelp = () => {
    // Trigger the ask for help function in MapView
    setHelpActive(true);
    setHelpStopped(false);
    if (mapViewRef.current) {
      mapViewRef.current.triggerAskForHelp();
    }
  };

  const handleStopHelp = () => {
    // Stop the help request in MapView
    setHelpActive(false);
    setHelpStopped(true);
    if (mapViewRef.current) {
      mapViewRef.current.stopHelp();
    }
    
    // Remove the stopped alert after 1 hour (3600000 ms)
    setTimeout(() => {
      setAllHelpPings(prev => prev.filter(ping => ping.userId !== userProfile.id));
      setNotifications(prev => prev.filter(notification => notification.userId !== userProfile.id));
      setHelpStopped(false);
    }, 3600000); // 1 hour
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
    <div className="flex h-screen">
      <Toast 
        message={`Welcome to Embraze, ${userProfile?.name || 'User'}!`}
        isVisible={welcomeMessage}
        onClose={() => setWelcomeMessage(false)}
        type="success"
      />
      
      <Toast 
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        type="info"
      />
      
      <div className="flex-1">
        <MapView 
          ref={mapViewRef}
          onNewHelpRequest={handleNewHelpRequest}
          allHelpPings={allHelpPings}
          userProfile={userProfile}
          helpActive={helpActive}
          helpStopped={helpStopped}
          familyMembers={familyMembers}
        />
      </div>
      <SidePanel 
        notifications={notifications}
        onCloseNotification={handleCloseNotification}
        onViewLocation={handleViewLocation}
        onNavigate={handleNavigate}
        userProfile={userProfile}
        onUpdateProfile={handleUpdateProfile}
        onAskForHelp={handleAskForHelp}
        onStopHelp={handleStopHelp}
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
      />
    </div>
  );
}

export default App;
