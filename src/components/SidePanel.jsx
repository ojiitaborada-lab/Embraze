import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  QuestionMarkCircleIcon, 
  MoonIcon, 
  UserGroupIcon, 
  ClockIcon,
  XMarkIcon,
  SunIcon,
  ComputerDesktopIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandshake } from '@fortawesome/free-solid-svg-icons';
import NotificationPanel from './NotificationPanel';
import SettingsPanel from './SettingsPanel';
import FamilyPanel from './FamilyPanel';
import HistoryPanel from './HistoryPanel';
import HelpPanel from './HelpPanel';

function SidePanel({ notifications, onCloseNotification, onViewLocation, onNavigate, userProfile, onUpdateProfile, helpActive: parentHelpActive, helpStopped, onSignOut, familyMembers, familyName, onCreateFamily, onJoinFamily, onLeaveFamily, onRemoveMember, onViewMemberLocation, onCreateInviteCode, showToastMessage, onClearAllNotifications, alertHistory, onClearHistory, onClearHistoryItem, onOpenHelpMenu, isHelpOnCooldown, cooldownTime, emergencyMenuOpen, onPanelChange }) {
  const [activePanel, setActivePanel] = useState(null); // 'notifications', 'settings', 'family', 'history', 'help'
  const [isClosing, setIsClosing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showThemeDropup, setShowThemeDropup] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light'); // 'light', 'dark', 'system'
  const [showLogoutDropup, setShowLogoutDropup] = useState(false);
  
  // Notify parent when panel changes
  useEffect(() => {
    if (onPanelChange) {
      onPanelChange(activePanel);
    }
  }, [activePanel, onPanelChange]);
  
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

  return (
    <>
      {/* Side Rail - Desktop: Fixed to right, Mobile: Bottom navigation */}
      <div className="fixed right-0 top-0 w-16 h-screen bg-slate-100 shadow-lg md:flex flex-col items-center py-3 space-y-2.5 z-[70] hidden">
        {/* Notification Bell */}
        <button 
          onClick={handleNotificationClick}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all relative cursor-pointer ${
            activePanel === 'notifications' 
              ? 'bg-blue-100 text-blue-600 shadow-sm' 
              : 'hover:bg-blue-50 text-gray-600 hover:text-blue-600'
          }`}
        >
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold px-0.5 shadow-md">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Family Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'family' 
              ? 'bg-purple-100 text-purple-600 shadow-sm' 
              : 'hover:bg-purple-50 text-gray-600 hover:text-purple-600'
          }`}
        >
          <UserGroupIcon className="w-5 h-5" />
        </button>

        {/* History Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'history' ? null : 'history')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'history' 
              ? 'bg-indigo-100 text-indigo-600 shadow-sm' 
              : 'hover:bg-indigo-50 text-gray-600 hover:text-indigo-600'
          }`}
        >
          <ClockIcon className="w-5 h-5" />
        </button>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Dark Mode Toggle with Drop-up */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowThemeDropup(!showThemeDropup);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showThemeDropup
                ? 'bg-gray-200 text-gray-800'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            {selectedTheme === 'light' ? (
              <SunIcon className="w-5 h-5" />
            ) : selectedTheme === 'dark' ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <ComputerDesktopIcon className="w-5 h-5" />
            )}
          </button>

          {/* Drop-up Theme Menu */}
          {showThemeDropup && (
            <>
              {/* Invisible backdrop */}
              <div 
                className="fixed inset-0 z-[75] bg-transparent" 
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowThemeDropup(false);
                }}
              />
              
              {/* Drop-up */}
              <div 
                className="absolute right-full mr-2 bottom-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-[80] overflow-hidden min-w-[200px]"
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="p-1.5">
                  {/* Light Mode */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTheme('light');
                      setShowThemeDropup(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      selectedTheme === 'light' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedTheme === 'light' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <SunIcon className={`w-4 h-4 ${
                        selectedTheme === 'light' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold">Light</p>
                      <p className="text-[9px] text-gray-500">Bright and clear</p>
                    </div>
                    {selectedTheme === 'light' && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>

                  {/* Dark Mode */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTheme('dark');
                      setShowThemeDropup(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      selectedTheme === 'dark' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedTheme === 'dark' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <MoonIcon className={`w-4 h-4 ${
                        selectedTheme === 'dark' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold">Dark</p>
                      <p className="text-[9px] text-gray-500">Easy on the eyes</p>
                    </div>
                    {selectedTheme === 'dark' && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>

                  {/* System Mode */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTheme('system');
                      setShowThemeDropup(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left ${
                      selectedTheme === 'system' 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      selectedTheme === 'system' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <ComputerDesktopIcon className={`w-4 h-4 ${
                        selectedTheme === 'system' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold">System</p>
                      <p className="text-[9px] text-gray-500">Match device</p>
                    </div>
                    {selectedTheme === 'system' && (
                      <CheckCircleIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                </div>
                
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                  <p className="text-[9px] text-gray-500 text-center">Coming soon</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Help Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'help' ? null : 'help')}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            activePanel === 'help' 
              ? 'bg-green-100 text-green-600 shadow-sm' 
              : 'hover:bg-green-50 text-gray-600 hover:text-green-600'
          }`}
        >
          <QuestionMarkCircleIcon className="w-5 h-5" />
        </button>

        {/* Profile Button */}
        <button 
          onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
          className={`w-11 h-11 rounded-full overflow-hidden hover:shadow-lg transition-all flex items-center justify-center relative cursor-pointer ${
            activePanel === 'settings' 
              ? 'ring-2 ring-blue-500 shadow-md' 
              : parentHelpActive 
                ? 'ring-2 ring-red-500 ring-offset-2 shadow-md' 
                : 'shadow-sm hover:shadow-md'
          }`}
        >
          {userProfile.photoUrl ? (
            <img 
              src={userProfile.photoUrl} 
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          {!userProfile.photoUrl && (
            <div className={`w-full h-full flex items-center justify-center ${
              parentHelpActive ? 'bg-red-500' : 'bg-blue-600'
            }`}>
              <span className="text-white text-sm font-bold">
                {userProfile.name.charAt(0)}
              </span>
            </div>
          )}
        </button>

        {/* Logout Button with Drop-up */}
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowLogoutDropup(!showLogoutDropup);
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              showLogoutDropup
                ? 'bg-gray-200 text-gray-800'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-800'
            }`}
          >
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          </button>

          {/* Drop-up Logout Confirmation */}
          {showLogoutDropup && (
            <>
              {/* Invisible backdrop */}
              <div 
                className="fixed inset-0 z-[75] bg-transparent" 
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowLogoutDropup(false);
                }}
              />
              
              {/* Drop-up */}
              <div 
                className="absolute right-full mr-2 bottom-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-[80] overflow-hidden min-w-[200px]"
                style={{ pointerEvents: 'auto' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="p-1.5">
                  {/* Logout Option */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowLogoutDropup(false);
                      onSignOut();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left hover:bg-gray-50 text-gray-700 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <ArrowRightStartOnRectangleIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold">Sign Out</p>
                      <p className="text-[9px] text-gray-500">Sign in again later</p>
                    </div>
                  </button>
                </div>
                
                <div className="px-3 py-2 bg-gray-50 border-t border-gray-100">
                  <p className="text-[9px] text-gray-900 font-semibold truncate">{userProfile.name}</p>
                  <p className="text-[8px] text-gray-500 truncate">{userProfile.email}</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-[70] safe-area-pb transition-all duration-300 shadow-lg ${
        activePanel ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      }`}>
        <div className="flex items-center justify-around px-2 py-2">
          {/* Notification Bell */}
          <button 
            onClick={handleNotificationClick}
            className={`relative p-3 rounded-full transition-all cursor-pointer ${
              activePanel === 'notifications' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-semibold px-0.5">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Family Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'family' ? null : 'family')}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              activePanel === 'family' 
                ? 'bg-purple-100 text-purple-600' 
                : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
            }`}
          >
            <UserGroupIcon className="w-5 h-5" />
          </button>

          {/* Help Button - Center - Elevated */}
          <button 
            onClick={onOpenHelpMenu}
            disabled={isHelpOnCooldown}
            className={`relative p-3 rounded-full transition-all -mt-6 shadow-lg ${
              isHelpOnCooldown
                ? 'bg-slate-600 text-white cursor-not-allowed'
                : emergencyMenuOpen
                  ? 'bg-gray-700 text-white hover:bg-gray-800 cursor-pointer hover:scale-110 active:scale-95'
                  : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer hover:scale-110 active:scale-95'
            }`}
          >
            {isHelpOnCooldown ? (
              <ClockIcon className="w-6 h-6" />
            ) : emergencyMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <FontAwesomeIcon icon={faHandshake} className="w-6 h-6" />
            )}
            {isHelpOnCooldown && cooldownTime && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold bg-slate-700 text-white px-1 rounded whitespace-nowrap">
                {cooldownTime}
              </span>
            )}
          </button>

          {/* History Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'history' ? null : 'history')}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              activePanel === 'history' 
                ? 'bg-indigo-100 text-indigo-600' 
                : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
            }`}
          >
            <ClockIcon className="w-5 h-5" />
          </button>

          {/* Profile Button */}
          <button 
            onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
            className={`w-10 h-10 rounded-full overflow-hidden transition-all cursor-pointer ${
              activePanel === 'settings' 
                ? 'ring-2 ring-blue-500 shadow-sm' 
                : parentHelpActive 
                  ? 'ring-2 ring-red-500 ring-offset-1' 
                  : 'shadow-sm'
            }`}
          >
            {userProfile.photoUrl ? (
              <img 
                src={userProfile.photoUrl} 
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {!userProfile.photoUrl && (
              <div className={`w-full h-full flex items-center justify-center ${
                parentHelpActive ? 'bg-red-500' : 'bg-blue-600'
              }`}>
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
              onOpenHelp={() => setActivePanel('help')}
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

          {activePanel === 'history' && (
            <HistoryPanel
              history={alertHistory || []}
              onClearHistory={onClearHistory}
              onClearItem={onClearHistoryItem}
              userProfile={userProfile}
            />
          )}

          {activePanel === 'help' && (
            <HelpPanel />
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
                  onOpenHelp={() => setActivePanel('help')}
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

              {activePanel === 'history' && (
                <HistoryPanel
                  history={alertHistory || []}
                  onClearHistory={onClearHistory}
                  onClearItem={onClearHistoryItem}
                  userProfile={userProfile}
                />
              )}

              {activePanel === 'help' && (
                <HelpPanel />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SidePanel;
