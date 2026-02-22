import { useState, useEffect } from 'react';
import { 
  CameraIcon, 
  ArrowRightOnRectangleIcon, 
  XMarkIcon, 
  BellIcon, 
  MapPinIcon, 
  TrashIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/solid';
import { saveUserProfile, deleteUserData } from '../firebase/services';
import { deleteAccount } from '../firebase/auth';

function SettingsPanel({ isOpen, onClose, userProfile, onUpdateProfile, onSignOut, showToastMessage, onOpenHelp }) {
  const [formData, setFormData] = useState(userProfile);
  const [notificationSound, setNotificationSound] = useState(true);
  const [autoShareLocation, setAutoShareLocation] = useState(true);
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showThemeDropup, setShowThemeDropup] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('light'); // 'light', 'dark', 'system'

  // Update formData when userProfile changes
  useEffect(() => {
    if (userProfile) {
      console.log('SettingsPanel - userProfile updated:', userProfile);
      console.log('SettingsPanel - photoUrl:', userProfile.photoUrl);
      setFormData(userProfile);
    }
  }, [userProfile]);

  // Calculate days until name can be changed
  const getDaysUntilNameChange = () => {
    if (!userProfile.lastNameChange) return 0;
    const daysSinceChange = (Date.now() - userProfile.lastNameChange) / (1000 * 60 * 60 * 24);
    const daysLeft = Math.ceil(7 - daysSinceChange);
    return daysLeft > 0 ? daysLeft : 0;
  };

  const canChangeName = getDaysUntilNameChange() === 0;
  const daysLeft = getDaysUntilNameChange();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format phone number for PH mobile format
    if (name === 'phone') {
      // Remove all non-digit characters except +
      let cleaned = value.replace(/[^\d+]/g, '');
      
      // Ensure it starts with +63
      if (!cleaned.startsWith('+63')) {
        if (cleaned.startsWith('63')) {
          cleaned = '+' + cleaned;
        } else if (cleaned.startsWith('0')) {
          cleaned = '+63' + cleaned.substring(1);
        } else if (cleaned.length > 0 && !cleaned.startsWith('+')) {
          cleaned = '+63' + cleaned;
        }
      }
      
      // Format: +63 XXX XXX XXXX
      if (cleaned.length > 3) {
        const countryCode = cleaned.substring(0, 3);
        const rest = cleaned.substring(3);
        
        if (rest.length <= 3) {
          cleaned = `${countryCode} ${rest}`;
        } else if (rest.length <= 6) {
          cleaned = `${countryCode} ${rest.substring(0, 3)} ${rest.substring(3)}`;
        } else {
          cleaned = `${countryCode} ${rest.substring(0, 3)} ${rest.substring(3, 6)} ${rest.substring(6, 10)}`;
        }
      }
      
      setFormData({
        ...formData,
        [name]: cleaned
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSave = async () => {
    // Check if name was changed
    const nameChanged = formData.name !== userProfile.name;
    
    const updatedProfile = {
      ...formData,
      settings: {
        notificationSound,
        autoShareLocation
      }
    };
    
    // If name was changed, update lastNameChange timestamp
    if (nameChanged && canChangeName) {
      updatedProfile.lastNameChange = Date.now();
    }
    
    // Save to Firebase
    const result = await saveUserProfile(userProfile.id, updatedProfile);
    
    if (result.success) {
      onUpdateProfile(updatedProfile);
      if (nameChanged) {
        showToastMessage('Profile saved! Name can be changed again in 7 days.');
      } else {
        showToastMessage('Profile saved successfully!');
      }
      onClose();
    } else {
      showToastMessage('Failed to save profile: ' + result.error);
    }
  };

  const addEmergencyContact = () => {
    setEmergencyContacts([
      ...emergencyContacts,
      { id: Date.now(), name: '', email: '' }
    ]);
  };

  const removeEmergencyContact = (id) => {
    setEmergencyContacts(emergencyContacts.filter(c => c.id !== id));
  };

  const updateEmergencyContact = (id, field, value) => {
    setEmergencyContacts(emergencyContacts.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleLogout = () => {
    onSignOut();
    onClose();
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    if (deleteConfirmText.toLowerCase() !== 'delete my account') {
      return;
    }
    
    try {
      // Delete user data from Firestore
      const dataResult = await deleteUserData(userProfile.id);
      
      if (!dataResult.success) {
        alert('Failed to delete user data: ' + dataResult.error);
        return;
      }
      
      // Delete Firebase Auth account
      const authResult = await deleteAccount();
      
      if (authResult.success) {
        alert('Account deleted successfully');
        onSignOut();
        onClose();
      } else {
        alert('Failed to delete account: ' + authResult.error);
      }
    } catch (error) {
      alert('Error deleting account: ' + error.message);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          photoUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="h-full w-full bg-white flex flex-col relative">

      {/* Header */}
        <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight">Profile</h3>
          <p className="text-[9px] text-gray-600 font-medium mt-0.5">Manage your account</p>
        </div>

        {/* Content */}
        <div className="px-3 py-2.5 space-y-3 overflow-y-auto flex-1">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden ring-2 ring-blue-200 ring-offset-2">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt=""
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Failed to load image:', formData.photoUrl);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                {!formData.photoUrl && (
                  <span className="text-white text-xl font-bold">{formData.name.charAt(0)}</span>
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-white hover:bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shadow-lg transition-all border-2 border-white group-hover:scale-110 cursor-pointer">
                <CameraIcon className="w-3 h-3" />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1.5 text-[9px] text-gray-500 font-medium">Click camera to change photo</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-2.5">
            {/* Name */}
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!canChangeName}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs shadow-sm ${
                  canChangeName 
                    ? 'bg-white border-gray-200 focus:bg-white text-gray-900' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                }`}
                placeholder="Enter your name"
              />
              {!canChangeName ? (
                <p className="text-[9px] text-orange-600 mt-1 font-medium">
                  You can change your name again in {daysLeft} day{daysLeft > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-[9px] text-gray-500 mt-1">
                  Name can be changed once every 7 days
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-xs cursor-not-allowed shadow-sm"
                placeholder="Enter your email"
              />
              <p className="text-[9px] text-gray-500 mt-1">Email cannot be changed (Google account)</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all outline-none text-gray-900 text-xs shadow-sm"
                placeholder="+63 912 345 6789"
                maxLength={16}
              />
              <p className="text-[9px] text-gray-500 mt-1">Format: +63 XXX XXX XXXX</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-200 my-1.5"></div>

          {/* Notification Settings */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                <BellIcon className="w-3 h-3 text-white" />
              </div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Notifications
              </label>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-700 font-medium">Sound & Vibration</span>
                <button
                  onClick={() => setNotificationSound(!notificationSound)}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer shadow-inner ${
                    notificationSound ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      notificationSound ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Auto-share Location */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                <MapPinIcon className="w-3 h-3 text-white" />
              </div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Location
              </label>
            </div>
            <div className="bg-white rounded-lg p-2.5 shadow-sm border border-gray-100/50">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-gray-700 font-medium block">Auto-share Location</span>
                  <span className="text-[9px] text-gray-500">When help is activated</span>
                </div>
                <button
                  onClick={() => setAutoShareLocation(!autoShareLocation)}
                  className={`relative w-10 h-5 rounded-full transition-all cursor-pointer flex-shrink-0 shadow-inner ${
                    autoShareLocation ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      autoShareLocation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Theme Selector with Drop-up - Mobile Only */}
          <div className="relative md:hidden">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
                {selectedTheme === 'light' ? (
                  <SunIcon className="w-3 h-3 text-white" />
                ) : selectedTheme === 'dark' ? (
                  <MoonIcon className="w-3 h-3 text-white" />
                ) : (
                  <ComputerDesktopIcon className="w-3 h-3 text-white" />
                )}
              </div>
              <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Appearance
              </label>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowThemeDropup(!showThemeDropup);
              }}
              className="w-full bg-white hover:bg-gray-50 rounded-lg p-2.5 shadow-sm border border-gray-100/50 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedTheme === 'light' && <SunIcon className="w-4 h-4 text-gray-700" />}
                  {selectedTheme === 'dark' && <MoonIcon className="w-4 h-4 text-gray-700" />}
                  {selectedTheme === 'system' && <ComputerDesktopIcon className="w-4 h-4 text-gray-700" />}
                  <span className="text-[10px] text-gray-700 font-medium capitalize">{selectedTheme} Mode</span>
                </div>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Drop-up Theme Menu */}
            {showThemeDropup && (
              <>
                {/* Invisible backdrop */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowThemeDropup(false);
                  }}
                />
                
                {/* Drop-up */}
                <div 
                  className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
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
                        <p className="text-[9px] text-gray-500">Match device settings</p>
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-2 rounded-full font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-95 border-2 border-gray-200 hover:border-gray-300"
          >
            <CheckCircleIcon className="w-3.5 h-3.5" />
            Save Profile
          </button>

          {/* Logout Button with Drop-up - Mobile Only */}
          <div className="relative md:hidden">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoutDropdown(!showLogoutDropdown);
              }}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 py-2 rounded-full font-bold transition-all border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-sm active:scale-95"
            >
              <ArrowRightOnRectangleIcon className="w-3.5 h-3.5" />
              Logout
            </button>
            
            {/* Drop-up Confirmation */}
            {showLogoutDropdown && (
              <>
                {/* Invisible backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  style={{ pointerEvents: 'auto' }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLogoutDropdown(false);
                  }}
                />
                
                {/* Drop-up */}
                <div 
                  className="absolute left-0 right-0 bottom-full mb-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
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
                        setShowLogoutDropdown(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-left hover:bg-gray-50 text-gray-700 cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ArrowRightOnRectangleIcon className="w-4 h-4 text-gray-600" />
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
      </div>
  );
}

export default SettingsPanel;
