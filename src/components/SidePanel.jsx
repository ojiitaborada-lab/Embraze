import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  QuestionMarkCircleIcon, 
  MoonIcon, 
  UserGroupIcon, 
  XMarkIcon, 
  ExclamationTriangleIcon, 
  MapPinIcon
} from '@heroicons/react/24/solid';
import NotificationPanel from './NotificationPanel';
import SettingsPanel from './SettingsPanel';
import FamilyPanel from './FamilyPanel';

function SidePanel({ notifications, onCloseNotification, onViewLocation, onNavigate, userProfile, onUpdateProfile, onAskForHelp, onStopHelp, helpActive: parentHelpActive, helpStopped, onSignOut, familyMembers, familyName, onCreateFamily, onJoinFamily, onLeaveFamily, onRemoveMember, onViewMemberLocation, onCreateInviteCode, showToastMessage, onFindMyLocation, onClearAllNotifications }) {
  const [activePanel, setActivePanel] = useState(null); // 'notifications', 'settings', 'family', 'help'
  const [helpTimeout, setHelpTimeout] = useState(null);
  const [isProcessingHelp, setIsProcessingHelp] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [cooldownEnd, setCooldownEnd] = useState(() => {
    // Load cooldown from localStorage
    const stored = localStorage.getItem(`helpCooldown_${userProfile.id}`);
    return stored ? parseInt(stored) : null;
  });
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  
  // Load seen notification IDs from localStorage
  const [seenNotificationIds, setSeenNotificationIds] = useState(() => {
    const stored = localStorage.getItem(`seenNotifications_${userProfile.id}`);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Handle closing with animation
  const handleClosePanel = () => {
    setIsClosing(true);
    setTimeout(() => {
      setActivePanel(null);
      setIsClosing(false);
      setDragOffset(0);
      setIsDragging(false);
    }, 300); // Match animation duration
  };

  // Swipe down gesture handlers
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStart(touch.clientY);
    setTouchEnd(null);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const diff = currentY - touchStart;
    
    // Only allow dragging down
    if (diff > 0) {
      setIsDragging(true);
      setDragOffset(diff);
      setTouchEnd(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      setDragOffset(0);
      return;
    }
    
    const distance = touchEnd - touchStart;
    
    // If dragged down more than 100px, close the drawer
    if (distance > 100) {
      handleClosePanel();
    } else {
      // Snap back
      setDragOffset(0);
      setIsDragging(false);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Cooldown timer
  useEffect(() => {
    if (!cooldownEnd) {
      setCooldownTimeLeft(0);
      return;
    }
    
    const updateCooldown = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((cooldownEnd - now) / 1000));
      setCooldownTimeLeft(remaining);
      
      if (remaining === 0) {
        setCooldownEnd(null);
        localStorage.removeItem(`helpCooldown_${userProfile.id}`);
      }
    };
    
    // Update immediately
    updateCooldown();
    
    // Update every second
    const interval = setInterval(updateCooldown, 1000);
    
    return () => clearInterval(interval);
  }, [cooldownEnd, userProfile.id]);

  // Save seen notification IDs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      `seenNotifications_${userProfile.id}`,
      JSON.stringify([...seenNotificationIds])
    );
  }, [seenNotificationIds, userProfile.id]);

  // Calculate unread count based on notifications that haven't been seen
  const unreadCount = notifications.filter(n => !seenNotificationIds.has(n.id)).length;

  const handleNotificationClick = () => {
    if (activePanel === 'notifications') {
      setActivePanel(null);
    } else {
      // Mark all current notifications as seen when opening
      const newSeenIds = new Set(seenNotificationIds);
      notifications.forEach(n => newSeenIds.add(n.id));
      setSeenNotificationIds(newSeenIds);
      setActivePanel('notifications');
    }
  };

  const handleAskForHelp = async () => {
    // Check if on cooldown
    if (cooldownTimeLeft > 0) {
      return; // Button is disabled, do nothing
    }
    
    // Prevent multiple rapid clicks
    if (isProcessingHelp) {
      return;
    }
    
    if (parentHelpActive) {
      // Stop help if already active
      setIsProcessingHelp(true);
      
      if (helpTimeout) {
        clearTimeout(helpTimeout);
        setHelpTimeout(null);
      }
      if (onStopHelp) {
        await onStopHelp();
      }
      
      // Start 30-minute cooldown AFTER stopping
      const cooldownEndTime = Date.now() + (30 * 60 * 1000); // 30 minutes
      setCooldownEnd(cooldownEndTime);
      localStorage.setItem(`helpCooldown_${userProfile.id}`, cooldownEndTime.toString());
      
      setIsProcessingHelp(false);
    } else {
      // Activate help (no cooldown yet)
      setIsProcessingHelp(true);
      
      await onAskForHelp();
      
      // Auto-deactivate after 30 seconds
      const timeout = setTimeout(async () => {
        if (onStopHelp) {
          await onStopHelp();
        }
        setHelpTimeout(null);
      }, 30000);
      
      setHelpTimeout(timeout);
      
      // Add a small delay before allowing next click
      setTimeout(() => {
        setIsProcessingHelp(false);
      }, 1000);
    }
  };

  // Format cooldown time for display
  const formatCooldownTime = () => {
    if (cooldownTimeLeft === 0) return null;
    const minutes = Math.floor(cooldownTimeLeft / 60);
    const seconds = cooldownTimeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isOnCooldown = cooldownTimeLeft > 0;

  return (
    <>
      {/* Side Rail - Desktop: Fixed to right, Mobile: Bottom navigation */}
      <div className="fixed right-0 top-0 w-16 h-screen bg-white/95 backdrop-blur-sm border-l border-gray-100 md:flex flex-col items-center py-3 space-y-2.5 z-[70] hidden">
        {/* Notification Bell */}
        <button 
          onClick={handleNotificationClick}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
            activePanel === 'notifications' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Notifications"
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold px-0.5">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Ask for Help Button */}
        <button 
          onClick={handleAskForHelp}
          disabled={isOnCooldown}
          className={`w-13 h-13 rounded-full flex flex-col items-center justify-center transition-all relative ${
            isOnCooldown
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : parentHelpActive 
                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse ring-2 ring-red-200 cursor-pointer' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 cursor-pointer'
          }`}
          title={isOnCooldown ? `Cooldown: ${formatCooldownTime()}` : parentHelpActive ? 'Stop Help Request' : 'Ask for Help'}
        >
          {isOnCooldown ? (
            <span className="text-[10px] text-white font-bold">{formatCooldownTime()}</span>
          ) : (
            parentHelpActive ? (
              <XMarkIcon className="w-5 h-5 text-white" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-white" />
            )
          )}
        </button>

        {/* Family Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'family' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Family Circle"
        >
          <UserGroupIcon className="w-5 h-5" />
        </button>

        {/* Help Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'help' ? null : 'help')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'help' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Help & Support"
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Dark Mode Toggle */}
        <button 
          className="w-11 h-11 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer text-gray-600"
          title="Dark Mode"
        >
          <MoonIcon className="w-5 h-5" />
        </button>

        {/* Profile Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
          className={`w-11 h-11 rounded-full overflow-hidden hover:shadow-md transition-all flex items-center justify-center relative cursor-pointer ${
            activePanel === 'settings' ? 'ring-2 ring-blue-500' : ''
          }`}
          title="Profile Settings"
        >
          {userProfile.photoUrl ? (
            <img 
              src={userProfile.photoUrl} 
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-500 flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {userProfile.name.charAt(0)}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-[70] safe-area-pb transition-all duration-300 ${
        activePanel ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        <div className="flex items-center justify-around px-1 py-1.5">
          {/* Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className={`relative p-2 rounded-full transition-all cursor-pointer ${
              activePanel === 'notifications' ? 'bg-gray-200 text-gray-700' : 'text-gray-600'
            }`}
          >
            <BellIcon className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] rounded-full flex items-center justify-center font-semibold px-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Find My Location Button */}
          <button 
            onClick={onFindMyLocation}
            className="p-2 rounded-full transition-all cursor-pointer text-gray-600 hover:bg-gray-100"
          >
            <MapPinIcon className="w-4 h-4" />
          </button>

          {/* Ask for Help Button */}
          <button 
            onClick={handleAskForHelp}
            disabled={isOnCooldown}
            className={`w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all -mt-6 ${
              isOnCooldown
                ? 'bg-gray-400 cursor-not-allowed opacity-60'
                : parentHelpActive 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse ring-4 ring-red-200 cursor-pointer' 
                  : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40 cursor-pointer'
            }`}
          >
            {isOnCooldown ? (
              <span className="text-[10px] text-white font-bold">{formatCooldownTime()}</span>
            ) : (
              parentHelpActive ? (
                <XMarkIcon className="w-5 h-5 text-white" />
              ) : (
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              )
            )}
          </button>

          {/* Family Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              activePanel === 'family' ? 'bg-gray-200 text-gray-700' : 'text-gray-600'
            }`}
          >
            <UserGroupIcon className="w-4 h-4" />
          </button>

          {/* Profile Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
            className={`w-8 h-8 rounded-full overflow-hidden transition-all cursor-pointer ${
              activePanel === 'settings' ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {userProfile.photoUrl ? (
              <img 
                src={userProfile.photoUrl} 
                alt={userProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">
                  {userProfile.name.charAt(0)}
                </span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Desktop: Expandable Content Panel - Fixed to right, next to rail */}
      <div className={`hidden md:block fixed right-16 top-0 h-screen bg-white border-l border-gray-100 transition-all duration-300 ease-in-out overflow-hidden z-[60] ${
        activePanel ? 'w-[360px]' : 'w-0'
      }`}>
        <div className="w-[360px] h-full">
          {activePanel === 'notifications' && (
            <NotificationPanel
              notifications={notifications}
              onClose={onCloseNotification}
              onViewLocation={(notification) => {
                onViewLocation(notification);
              }}
              onNavigate={(notification) => {
                onNavigate(notification);
              }}
              onClearAll={onClearAllNotifications}
              isOpen={true}
              userProfile={userProfile}
              helpActive={parentHelpActive}
              helpStopped={helpStopped}
            />
          )}

          {activePanel === 'settings' && (
            <SettingsPanel 
              isOpen={true}
              onClose={() => setActivePanel(null)}
              userProfile={userProfile}
              onUpdateProfile={onUpdateProfile}
              onSignOut={onSignOut}
              showToastMessage={showToastMessage}
            />
          )}

          {activePanel === 'family' && (
            <FamilyPanel
              isOpen={true}
              onClose={() => setActivePanel(null)}
              userProfile={userProfile}
              familyMembers={familyMembers}
              familyName={familyName}
              onCreateFamily={onCreateFamily}
              onJoinFamily={onJoinFamily}
              onLeaveFamily={onLeaveFamily}
              onRemoveMember={onRemoveMember}
              isCreator={familyMembers.length > 0 && familyMembers.find(m => m.id === userProfile.id)?.isCreator}
              onViewMemberLocation={onViewMemberLocation}
              onCreateInviteCode={onCreateInviteCode}
            />
          )}

          {activePanel === 'help' && (
            <div className="h-full flex flex-col">
              <div className="px-4 py-4">
                <h3 className="text-lg font-semibold text-gray-800">Help & Support</h3>
              </div>
              <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center">
                <p className="text-sm text-gray-400">Coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Bottom Sheet/Drawer */}
      {activePanel && (
        <>
          {/* Backdrop */}
          <div 
            className={`md:hidden fixed inset-0 bg-black/50 z-[55] ${isClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
            onClick={handleClosePanel}
          />
          
          {/* Bottom Sheet */}
          <div 
            className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] max-h-[80vh] flex flex-col shadow-2xl ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}
            style={{
              transform: isDragging ? `translateY(${dragOffset}px)` : 'translateY(0)',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))'
            }}
          >
            {/* Handle - Draggable area */}
            <div 
              className="flex justify-center pt-2 pb-1 flex-shrink-0 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>
            
            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y'
              }}
            >
              {activePanel === 'notifications' && (
                <NotificationPanel
                  notifications={notifications}
                  onClose={onCloseNotification}
                  onViewLocation={(notification) => {
                    onViewLocation(notification);
                    handleClosePanel();
                  }}
                  onNavigate={(notification) => {
                    onNavigate(notification);
                    handleClosePanel();
                  }}
                  onClearAll={onClearAllNotifications}
                  isOpen={true}
                  userProfile={userProfile}
                  helpActive={parentHelpActive}
                  helpStopped={helpStopped}
                />
              )}

              {activePanel === 'settings' && (
                <SettingsPanel 
                  isOpen={true}
                  onClose={handleClosePanel}
                  userProfile={userProfile}
                  onUpdateProfile={onUpdateProfile}
                  onSignOut={onSignOut}
                  showToastMessage={showToastMessage}
                />
              )}

              {activePanel === 'family' && (
                <FamilyPanel
                  isOpen={true}
                  onClose={handleClosePanel}
                  userProfile={userProfile}
                  familyMembers={familyMembers}
                  familyName={familyName}
                  onCreateFamily={onCreateFamily}
                  onJoinFamily={onJoinFamily}
                  onLeaveFamily={onLeaveFamily}
                  onRemoveMember={onRemoveMember}
                  isCreator={familyMembers.length > 0 && familyMembers.find(m => m.id === userProfile.id)?.isCreator}
                  onViewMemberLocation={(member) => {
                    onViewMemberLocation(member);
                    handleClosePanel();
                  }}
                  onCreateInviteCode={onCreateInviteCode}
                />
              )}

              {activePanel === 'help' && (
                <div className="h-full flex flex-col">
                  <div className="px-4 py-4">
                    <h3 className="text-lg font-semibold text-gray-800">Help & Support</h3>
                  </div>
                  <div className="p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-400">Coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SidePanel;
