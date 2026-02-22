import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  ClipboardDocumentIcon, 
  UserGroupIcon, 
  MapPinIcon, 
  TrashIcon, 
  ArrowRightOnRectangleIcon,
  LinkIcon,
  ArrowRightCircleIcon
} from '@heroicons/react/24/solid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPeopleGroup, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import emptyGhostAnimation from '../assets/empty ghost.json';
import loadingAnimation from '../assets/Trail loading.json';

function FamilyPanel({ isOpen, onClose, userProfile, familyMembers = [], familyName = '', onCreateFamily, onJoinFamily, onLeaveFamily, onRemoveMember, isCreator, onViewMemberLocation, onCreateInviteCode }) {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCreating, setIsCreating] = useState(false); // Loading state for family creation
  const [isJoining, setIsJoining] = useState(false); // Loading state for joining family
  const [showLeaveDropdown, setShowLeaveDropdown] = useState(false); // Dropdown confirmation for leaving

  const hasFamily = familyMembers.length > 0;
  const canAddMembers = isCreator && familyMembers.length < 6; // Creator + 5 members

  // Auto-generate code when creator has family and no code exists
  useEffect(() => {
    if (isCreator && hasFamily && !inviteCode && canAddMembers && isOpen) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiry = Date.now() + 25000;
      setInviteCode(code);
      setCodeExpiry(expiry);
      // Save invite code to Firebase
      if (onCreateInviteCode) {
        onCreateInviteCode(code);
      }
    }
  }, [isCreator, hasFamily, inviteCode, canAddMembers, isOpen, onCreateInviteCode]);

  // Countdown timer for invite code
  useEffect(() => {
    if (!codeExpiry) return;

    // Calculate and set initial time immediately
    const updateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((codeExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
      return remaining;
    };

    // Set initial time immediately
    const initialRemaining = updateTimeLeft();

    // If already expired, regenerate immediately
    if (initialRemaining === 0) {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const newExpiry = Date.now() + 25000;
      setInviteCode(newCode);
      setCodeExpiry(newExpiry);
      setTimeLeft(25);

      if (onCreateInviteCode) {
        onCreateInviteCode(newCode);
      }
      return;
    }

    const interval = setInterval(() => {
      const remaining = updateTimeLeft();

      if (remaining === 0) {
        clearInterval(interval);

        // Auto-regenerate code when it expires
        const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newExpiry = Date.now() + 25000;
        setInviteCode(newCode);
        setCodeExpiry(newExpiry);
        setTimeLeft(25);

        if (onCreateInviteCode) {
          onCreateInviteCode(newCode);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [codeExpiry, onCreateInviteCode]);

  const handleGenerateCode = () => {
    // Generate 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiry = Date.now() + 25000;
    setInviteCode(code);
    setCodeExpiry(expiry);
    // Append " Family" to the name
    return onCreateFamily(code, `${newFamilyName.trim()} Family`);
  };

  const handleCreateFamily = async () => {
    if (newFamilyName.trim()) {
      setIsCreating(true);
      try {
        // Ensure loading shows for at least 500ms to avoid blink
        const [result] = await Promise.all([
          handleGenerateCode(),
          new Promise(resolve => setTimeout(resolve, 500))
        ]);
        setShowCreateInput(false);
      } catch (error) {
        console.error('Error creating family:', error);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // Could add a toast notification here
  };

  const handleJoinFamily = async () => {
    if (joinCode.trim()) {
      setIsJoining(true);
      try {
        // Ensure loading shows for at least 500ms to avoid blink
        await Promise.all([
          onJoinFamily(joinCode.trim().toUpperCase()),
          new Promise(resolve => setTimeout(resolve, 500))
        ]);
        setJoinCode('');
        setShowJoinInput(false);
      } catch (error) {
        console.error('Error joining family:', error);
      } finally {
        setIsJoining(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-white flex flex-col relative">

      {/* Loading Modal - Compact */}
      {(isCreating || isJoining) && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg px-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 w-full max-w-[220px]">
            <div className="w-24 h-24">
              <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
            <p className="text-gray-700 font-bold text-sm text-center tracking-tight">
              {isCreating ? 'Creating family circle...' : 'Joining family circle...'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50 relative">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              {hasFamily ? familyName : 'Family Circle'}
            </h3>
            {hasFamily && (
              <p className="text-[9px] text-gray-600 mt-0.5 font-medium">{familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {hasFamily && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLeaveDropdown(!showLeaveDropdown);
                }}
                className="px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1 transition-all cursor-pointer text-[10px] font-bold shadow-sm"
                title="Leave Family Circle"
              >
                <ArrowRightOnRectangleIcon className="w-3 h-3" />
                Leave
              </button>
              
              {/* Dropdown Confirmation */}
              {showLeaveDropdown && (
                <>
                  {/* Invisible backdrop to close dropdown - using pointer-events */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowLeaveDropdown(false);
                    }}
                  />
                  
                  {/* Dropdown */}
                  <div 
                    className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                    style={{ pointerEvents: 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900">Leave {familyName}?</p>
                      <p className="text-[10px] text-gray-500 mt-1">You'll need a new invite code to rejoin</p>
                    </div>
                    <div className="p-2 flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLeaveDropdown(false);
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-bold transition-all text-[10px] active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLeaveDropdown(false);
                          onLeaveFamily();
                        }}
                        className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-full font-bold transition-all text-[10px] active:scale-95 shadow-sm"
                      >
                        Leave
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2.5 space-y-3 overflow-y-auto flex-1 flex flex-col">{!hasFamily ? (
          /* No Family - Show Create/Join Options */
          <div className="space-y-2.5 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center py-3 flex flex-col items-center">
              <div className="w-32 h-32 mb-2">
                <Player
                  autoplay
                  loop
                  src={emptyGhostAnimation}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
              <p className="text-xs text-gray-700 font-bold mb-0.5">No family circle yet</p>
              <p className="text-[10px] text-gray-500">Create or join a family to get started</p>
            </div>

            {/* Create Family */}
            {!showCreateInput && !showJoinInput ? (
              <button
                onClick={() => setShowCreateInput(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded-full font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-2 border-gray-200 hover:border-gray-300"
              >
                <PlusIcon className="w-3.5 h-3.5" />
                Create Family Circle
              </button>
            ) : showCreateInput ? (
              <div className="space-y-2.5 bg-white p-3 rounded-xl shadow-md border border-blue-100/50">
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  maxLength={30}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-xs shadow-sm"
                />
                <p className="text-[9px] text-gray-600 font-medium">Will be saved as "{newFamilyName.trim() || 'Name'} Family"</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setShowCreateInput(false);
                      setNewFamilyName('');
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-full font-bold transition-all text-[10px] cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={!newFamilyName.trim() || isCreating}
                    className={`flex-1 py-1.5 rounded-full font-bold transition-all text-[10px] shadow-sm ${
                      newFamilyName.trim() && !isCreating
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isCreating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Join Family */}
            {!showJoinInput && !showCreateInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded-full font-bold transition-all border-2 border-gray-200 hover:border-blue-200 text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
              >
                <FontAwesomeIcon icon={faRightToBracket} className="w-3.5 h-3.5" />
                Join Family Circle
              </button>
            ) : showJoinInput ? (
              <div className="space-y-2.5 bg-white p-3 rounded-xl shadow-md border border-blue-100/50">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-xs text-center uppercase tracking-widest font-bold shadow-sm"
                />
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      setJoinCode('');
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-full font-bold transition-all text-[10px] cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={joinCode.length !== 6 || isJoining}
                    className={`flex-1 py-1.5 rounded-full font-bold transition-all text-[10px] shadow-sm ${
                      joinCode.length === 6 && !isJoining
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          /* Has Family - Show Members and Invite */
          <div className="space-y-2.5">
            {/* Invite Code Section (Only for Creator) */}
            {isCreator && canAddMembers && (
              <div className="bg-slate-50 rounded-xl p-3 space-y-2 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-700">Invite Code</span>
                  {inviteCode && (
                    <span className="text-[9px] text-blue-600 font-bold bg-white px-1.5 py-0.5 rounded-full">
                      {timeLeft}s
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-white rounded-full px-3 py-2 text-center shadow-sm border border-blue-100">
                    <span className="text-lg font-bold text-gray-900 tracking-widest">{inviteCode || '------'}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    disabled={!inviteCode}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                      inviteCode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-gray-700">Members ({familyMembers.length}/6)</h3>
              </div>

              <div className="space-y-1.5">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 bg-white rounded-xl hover:shadow-md transition-all shadow-sm border border-gray-100/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm ring-1 ring-blue-200">
                        {member.photoUrl ? (
                          <img 
                            src={member.photoUrl} 
                            alt={member.name} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-900 tracking-tight">
                          {member.name}
                          {member.id === userProfile.id && (
                            <span className="text-[9px] text-gray-600 ml-1 font-medium">(You)</span>
                          )}
                          {member.isCreator && (
                            <span className="text-[9px] text-blue-600 ml-1 font-bold">(Creator)</span>
                          )}
                        </p>
                        {member.isOnline && (
                          <div className="flex items-center gap-0.5 text-[9px] text-green-600 mt-0.5 font-medium">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Online
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewMemberLocation && onViewMemberLocation(member)}
                        disabled={!member.location}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          member.location
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={member.location ? "View on map" : "Location unavailable"}
                      >
                        <MapPinIcon className="w-3 h-3" />
                      </button>

                      {isCreator && member.id !== userProfile.id && (
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm"
                          title="Remove member"
                        >
                          <TrashIcon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default FamilyPanel;
