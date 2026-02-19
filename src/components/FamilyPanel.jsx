import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faCopy, faUserGroup, faMapMarkerAlt, faTrash, faUsers, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { Player } from '@lottiefiles/react-lottie-player';
import circleLineAnimation from '../../public/circle line.json';

function FamilyPanel({ isOpen, onClose, userProfile, familyMembers = [], familyName = '', onCreateFamily, onJoinFamily, onLeaveFamily, onRemoveMember, isCreator, onViewMemberLocation, onCreateInviteCode }) {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const hasFamily = familyMembers.length > 0;
  const canAddMembers = isCreator && familyMembers.length < 6; // Creator + 5 members

  // Auto-generate code when creator has family and no code exists
  useEffect(() => {
    if (isCreator && hasFamily && !inviteCode && canAddMembers && isOpen) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setInviteCode(code);
      setCodeExpiry(Date.now() + 25000);
      // Save invite code to Firebase
      if (onCreateInviteCode) {
        onCreateInviteCode(code);
      }
    }
  }, [isCreator, hasFamily, inviteCode, canAddMembers, isOpen, onCreateInviteCode]);

  // Countdown timer for invite code
  useEffect(() => {
    if (codeExpiry) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((codeExpiry - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          // Auto-regenerate code when it expires
          const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          setInviteCode(newCode);
          setCodeExpiry(Date.now() + 25000); // 25 seconds
          // Save new invite code to Firebase
          if (onCreateInviteCode) {
            onCreateInviteCode(newCode);
          }
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [codeExpiry, onCreateInviteCode]);

  const handleGenerateCode = () => {
    // Generate 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setInviteCode(code);
    setCodeExpiry(Date.now() + 25000); // 25 seconds
    // Append " Family" to the name
    onCreateFamily(code, `${newFamilyName.trim()} Family`);
  };

  const handleCreateFamily = () => {
    if (newFamilyName.trim()) {
      handleGenerateCode();
      setShowCreateInput(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    // Could add a toast notification here
  };

  const handleJoinFamily = () => {
    if (joinCode.trim()) {
      onJoinFamily(joinCode.trim().toUpperCase());
      setJoinCode('');
      setShowJoinInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-50/30 to-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {hasFamily ? familyName : 'Family Circle'}
            </h3>
            {hasFamily && (
              <p className="text-[10px] text-gray-500 mt-0.5">{familyMembers.length} member{familyMembers.length !== 1 ? 's' : ''}</p>
            )}
          </div>
          {hasFamily && (
            <button
              onClick={onLeaveFamily}
              className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center gap-1.5 transition-all cursor-pointer text-xs font-medium"
              title="Leave Family Circle"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-3 h-3" />
              Leave
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1 flex flex-col">
        {!hasFamily ? (
          /* No Family - Show Create/Join Options */
          <div className="space-y-3 max-w-md mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="text-center py-8 flex flex-col items-center">
              <div className="w-32 h-32 mb-3">
                <Player
                  autoplay
                  loop
                  src={circleLineAnimation}
                  style={{ height: '128px', width: '128px' }}
                />
              </div>
              <p className="text-sm text-gray-500 font-semibold mb-1">No family circle yet</p>
              <p className="text-xs text-gray-400">Create or join a family to get started</p>
            </div>

            {/* Create Family */}
            {!showCreateInput && !showJoinInput ? (
              <button
                onClick={() => setShowCreateInput(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all text-xs cursor-pointer"
              >
                Create Family Circle
              </button>
            ) : showCreateInput ? (
              <div className="space-y-2 bg-gray-50 p-2.5 rounded-lg">
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  placeholder="Enter family name"
                  maxLength={30}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-xs"
                />
                <p className="text-[10px] text-gray-500">Will be saved as "{newFamilyName.trim() || 'Name'} Family"</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCreateInput(false);
                      setNewFamilyName('');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={!newFamilyName.trim()}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      newFamilyName.trim()
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Create
                  </button>
                </div>
              </div>
            ) : null}

            {/* Join Family */}
            {!showJoinInput && !showCreateInput ? (
              <button
                onClick={() => setShowJoinInput(true)}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded-lg font-medium transition-all border border-gray-200 hover:border-gray-300 text-xs cursor-pointer"
              >
                Join Family Circle
              </button>
            ) : showJoinInput ? (
              <div className="space-y-2 bg-gray-50 p-2.5 rounded-lg">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter invite code"
                  maxLength={6}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 text-xs text-center uppercase tracking-widest font-semibold"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowJoinInput(false);
                      setJoinCode('');
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={joinCode.length !== 6}
                    className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-xs ${
                      joinCode.length === 6
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Join
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
              <div className="bg-blue-50 rounded-xl p-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-gray-700">Invite Code</span>
                  {inviteCode && (
                    <span className="text-[9px] text-blue-600 font-medium">
                      Expires in {timeLeft}s
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 bg-white rounded-full px-2.5 py-1.5 text-center">
                    <span className="text-lg font-bold text-gray-900 tracking-widest">{inviteCode || '------'}</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    disabled={!inviteCode}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      inviteCode
                        ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FontAwesomeIcon icon={faCopy} className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Members List */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[10px] font-semibold text-gray-700">Members ({familyMembers.length}/6)</h3>
              </div>
              
              <div className="space-y-1.5">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                        {member.photoUrl ? (
                          <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-900">
                          {member.name}
                          {member.id === userProfile.id && (
                            <span className="text-[9px] text-gray-500 ml-1">(You)</span>
                          )}
                          {member.isCreator && (
                            <span className="text-[9px] text-blue-600 ml-1">(Creator)</span>
                          )}
                        </p>
                        {member.isOnline && (
                          <div className="flex items-center gap-0.5 text-[9px] text-green-600">
                            <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                            Online
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewMemberLocation && onViewMemberLocation(member)}
                        disabled={!member.location}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          member.location
                            ? 'bg-blue-100 hover:bg-blue-200 text-blue-600 cursor-pointer'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={member.location ? "View on map" : "Location unavailable"}
                      >
                        <FontAwesomeIcon icon={faMapMarkerAlt} className="w-2 h-2" />
                      </button>
                      
                      {isCreator && member.id !== userProfile.id && (
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all cursor-pointer"
                          title="Remove member"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-2 h-2" />
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
