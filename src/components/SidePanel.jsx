import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircleQuestion, faMoon, faHandPaper, faUserGroup, faTimes, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import NotificationPanel from './NotificationPanel';
import SettingsPanel from './SettingsPanel';
import FamilyPanel from './FamilyPanel';

function SidePanel({ notifications, onCloseNotification, onViewLocation, onNavigate, userProfile, onUpdateProfile, onAskForHelp, onStopHelp, helpActive: parentHelpActive, helpStopped, onSignOut, familyMembers, familyName, onCreateFamily, onJoinFamily, onLeaveFamily, onRemoveMember, onViewMemberLocation, onCreateInviteCode, showToastMessage }) {
  const [activePanel, setActivePanel] = useState(null); // 'notifications', 'settings', 'family', 'help'
  const [helpTimeout, setHelpTimeout] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  
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
    }, 300); // Match animation duration
  };

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

  const handleAskForHelp = () => {
    if (parentHelpActive) {
      // Stop help if already active
      if (helpTimeout) {
        clearTimeout(helpTimeout);
        setHelpTimeout(null);
      }
      if (onStopHelp) {
        onStopHelp();
      }
    } else {
      // Activate help
      onAskForHelp();
      
      // Auto-deactivate after 30 seconds
      const timeout = setTimeout(() => {
        if (onStopHelp) {
          onStopHelp();
        }
        setHelpTimeout(null);
      }, 30000);
      
      setHelpTimeout(timeout);
    }
  };

  return (
    <>
      {/* Side Rail - Desktop: Fixed to right, Mobile: Bottom navigation */}
      <div className="fixed right-0 top-0 w-16 h-screen bg-white/95 backdrop-blur-sm border-l border-gray-100 md:flex flex-col items-center py-4 space-y-3 z-[70] hidden">
        {/* Notification Bell */}
        <button 
          onClick={handleNotificationClick}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
            activePanel === 'notifications' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Notifications"
        >
          <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-semibold px-1">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Ask for Help Button */}
        <button 
          onClick={handleAskForHelp}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            parentHelpActive 
              ? 'bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/50 animate-pulse ring-4 ring-red-200' 
              : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105'
          }`}
          title={parentHelpActive ? 'Stop Help Request' : 'Ask for Help'}
        >
          <FontAwesomeIcon 
            icon={parentHelpActive ? faTimes : faTriangleExclamation} 
            className="w-6 h-6 text-white" 
          />
        </button>

        {/* Family Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'family' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Family Circle"
        >
          <FontAwesomeIcon icon={faUserGroup} className="w-5 h-5" />
        </button>

        {/* Help Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'help' ? null : 'help')}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'help' ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600'
          }`}
          title="Help & Support"
        >
          <FontAwesomeIcon icon={faCircleQuestion} className="w-5 h-5" />
        </button>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Dark Mode Toggle */}
        <button 
          className="w-12 h-12 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all cursor-pointer text-gray-600"
          title="Dark Mode"
        >
          <FontAwesomeIcon icon={faMoon} className="w-5 h-5" />
        </button>

        {/* Profile Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
          className={`w-12 h-12 rounded-full overflow-hidden hover:shadow-lg transition-all flex items-center justify-center relative cursor-pointer ${
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
              <span className="text-white text-lg font-bold">
                {userProfile.name.charAt(0)}
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-[70] safe-area-pb">
        <div className="flex items-center justify-around px-2 py-2">
          {/* Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className={`relative p-2 rounded-full transition-all ${
              activePanel === 'notifications' ? 'bg-gray-200 text-gray-700' : 'text-gray-600'
            }`}
          >
            <FontAwesomeIcon icon={faBell} className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Ask for Help Button */}
          <button 
            onClick={handleAskForHelp}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all -mt-7 ${
              parentHelpActive 
                ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse ring-4 ring-red-200' 
                : 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/40'
            }`}
          >
            <FontAwesomeIcon 
              icon={parentHelpActive ? faTimes : faTriangleExclamation} 
              className="w-6 h-6 text-white" 
            />
          </button>

          {/* Family Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
            className={`p-2 rounded-full transition-all ${
              activePanel === 'family' ? 'bg-gray-200 text-gray-700' : 'text-gray-600'
            }`}
          >
            <FontAwesomeIcon icon={faUserGroup} className="w-5 h-5" />
          </button>

          {/* Profile Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
            className={`w-9 h-9 rounded-full overflow-hidden transition-all ${
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
                <span className="text-white text-xs font-bold">
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
              onClearAll={() => {
                notifications.forEach(n => onCloseNotification(n.id));
              }}
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
          <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[60] max-h-[80vh] flex flex-col shadow-2xl pb-16 ${isClosing ? 'animate-slideDown' : 'animate-slideUp'}`}>
            {/* Handle */}
            <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
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
                  onClearAll={() => {
                    notifications.forEach(n => onCloseNotification(n.id));
                  }}
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
