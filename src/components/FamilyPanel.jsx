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
import loadingAnimation from '../../public/Loading.json';

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
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false); // Confirmation modal for leaving

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
    <div className="h-full w-full bg-gradient-to-br from-blue-50/30 to-white flex flex-col relative">
      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-xl p-4 shadow-2xl max-w-[240px] mx-4 space-y-3">
            <div className="text-center space-y-1.5">
              <h3 className="text-sm font-semibold text-gray-900">Leave {familyName}?</h3>
              <p className="text-[10px] text-gray-500">You'll need a new invite code to rejoin</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveFamily();
                }}
                className="flex-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium transition-all text-xs cursor-pointer"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Modal - Compact */}
      {(isCreating || isJoining) && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg px-4">
          <div className="bg-white rounded-xl p-5 shadow-2xl flex flex-col items-center gap-2.5 w-full max-w-[200px]">
            <div className="w-16 h-16">
              <Player
                autoplay
                loop
                src={loadingAnimation}
                style={{ height: '100%', width: '100%' }}
              />
            </div>
            <p className="text-gray-700 font-medium text-xs text-center">
              {isCreating ? 'Creating family circle...' : 'Joining family circle...'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {hasFamily ? familyName : 'Family Circle'}
            </h3>
            {hasFamily && (
              <p className="text-[10px] text-gray-500 mt-0.5">{familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {hasFamily && (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1.5 transition-all cursor-pointer text-xs font-medium"
              title="Leave Family Circle"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 flex flex-col">
        {!hasFamily ? (
          /* No Family - Show Create/Join Options */
          <div className="space-y-2.5 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center py-4 flex flex-col items-center">
              <div className="w-24 h-24 mb-2">
                <Player
                  autoplay
                  loop
                  src={emptyGhostAnimation}
                  style={{ height: '96px', width: '96px' }}
                />
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-0.5">No family circle yet</p>
              <p className="text-[10px] text-gray-400">Create or join a family to get started</p>
            </div>

            {/* Create Family */}
            {!showCreateInput && !showJoinInput ? (
              <button
                onClick={() => setShowCreateInput(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-full font-medium transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create Family Circle
              </button>
            ) : showCreateInput ? (
              <div className="space-y-2.5 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  maxLength={30}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-sm"
                />
                <p className="text-[10px] text-gray-500">Will be saved as "{newFamilyName.trim() || 'Name'} Family"</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCreateInput(false);
                      setNewFamilyName('');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-2 rounded-full font-medium transition-all text-xs cursor-pointer border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={!newFamilyName.trim() || isCreating}
                    className={`flex-1 py-2 rounded-full font-medium transition-all text-xs ${
                      newFamilyName.trim() && !isCreating
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2.5 rounded-full font-medium transition-all border border-gray-200 hover:border-gray-300 text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <FontAwesomeIcon icon={faRightToBracket} className="w-4 h-4" />
                Join Family Circle
              </button>
            ) : showJoinInput ? (
              <div className="space-y-2.5 bg-gray-50 p-3 rounded-lg">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-sm text-center uppercase tracking-widest font-semibold"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      setJoinCode('');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-2 rounded-full font-medium transition-all text-xs cursor-pointer border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={joinCode.length !== 6 || isJoining}
                    className={`flex-1 py-2 rounded-full font-medium transition-all text-xs ${
                      joinCode.length === 6 && !isJoining
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
          <div className="space-y-2">
            {/* Invite Code Section (Only for Creator) */}
            {isCreator && canAddMembers && (
              <div className="bg-blue-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-700">Invite Code</span>
                  {inviteCode && (
                    <span className="text-[10px] text-blue-600 font-medium">
                      Expires in {timeLeft}s
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-white rounded-full px-3 py-2 text-center">
                    <span className="text-lg font-bold text-gray-900 tracking-widest">{inviteCode || '------'}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    disabled={!inviteCode}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      inviteCode
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
                <h3 className="text-[10px] font-semibold text-gray-700">Members ({familyMembers.length}/6)</h3>
              </div>
              
              <div className="space-y-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">
                          {member.name}
                          {member.id === userProfile.id && (
                            <span className="text-[10px] text-gray-500 ml-1">(You)</span>
                          )}
                          {member.isCreator && (
                            <span className="text-[10px] text-blue-600 ml-1">(Creator)</span>
                          )}
                        </p>
                        {member.isOnline && (
                          <div className="flex items-center gap-1 text-[10px] text-green-600 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            Online
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewMemberLocation && onViewMemberLocation(member)}
                        disabled={!member.location}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
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
                          className="w-7 h-7 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
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
