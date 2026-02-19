import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faSignOutAlt, faTimes, faBell, faMapMarkerAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { saveUserProfile, deleteUserData } from '../firebase/services';
import { deleteAccount } from '../firebase/auth';

function SettingsPanel({ isOpen, onClose, userProfile, onUpdateProfile, onSignOut, showToastMessage }) {
  const [formData, setFormData] = useState(userProfile);
  const [notificationSound, setNotificationSound] = useState(true);
  const [autoShareLocation, setAutoShareLocation] = useState(true);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
    const updatedProfile = {
      ...formData,
      settings: {
        notificationSound,
        autoShareLocation
      }
    };
    
    // Save to Firebase
    const result = await saveUserProfile(userProfile.id, updatedProfile);
    
    if (result.success) {
      onUpdateProfile(updatedProfile);
      showToastMessage('Profile saved successfully!');
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
    if (!logoutConfirm) {
      setLogoutConfirm(true);
      return;
    }
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
    <div className="h-full w-full bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4">
          <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30 overflow-hidden">
                {formData.photoUrl ? (
                  <img 
                    src={formData.photoUrl} 
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  formData.name.charAt(0)
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-7 h-7 bg-white hover:bg-blue-50 rounded-full flex items-center justify-center text-blue-500 shadow-lg transition-all border-2 border-white group-hover:scale-110 cursor-pointer">
                <FontAwesomeIcon icon={faCamera} className="w-2.5 h-2.5" />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-1.5 text-[10px] text-gray-400">Click camera to change</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!canChangeName}
                className={`w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-xs ${
                  canChangeName 
                    ? 'bg-gray-50 focus:bg-white text-gray-900' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
                placeholder="Enter your name"
              />
              {!canChangeName ? (
                <p className="text-[10px] text-orange-600 mt-0.5">
                  You can change your name again in {daysLeft} day{daysLeft > 1 ? 's' : ''}
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Name can be changed once every 7 days
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 text-xs cursor-not-allowed"
                placeholder="Enter your email"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Email cannot be changed (Google account)</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all outline-none text-gray-900 text-xs"
                placeholder="+63 912 345 6789"
                maxLength={16}
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Format: +63 XXX XXX XXXX</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Notification Settings */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FontAwesomeIcon icon={faBell} className="w-2.5 h-2.5 text-blue-500" />
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Notifications
              </label>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">Sound & Vibration</span>
                <button
                  onClick={() => setNotificationSound(!notificationSound)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                    notificationSound ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      notificationSound ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Auto-share Location */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-2.5 h-2.5 text-blue-500" />
              <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Location
              </label>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs text-gray-700 block">Auto-share Location</span>
                  <span className="text-[10px] text-gray-500">When help is activated</span>
                </div>
                <button
                  onClick={() => setAutoShareLocation(!autoShareLocation)}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 ${
                    autoShareLocation ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
                      autoShareLocation ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition-all text-xs cursor-pointer"
          >
            Save Profile
          </button>

          {/* Logout Button */}
          {!logoutConfirm ? (
            <button
              onClick={handleLogout}
              className="w-full bg-white hover:bg-red-50 text-red-600 py-2 rounded-lg font-medium transition-all border border-red-200 hover:border-red-300 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-3 h-3" />
              Logout
            </button>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[11px] text-gray-700 text-center font-medium">Are you sure you want to logout?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLogoutConfirm(false)}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

          {/* Delete Account Button */}
          {!deleteConfirm ? (
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-white hover:bg-red-100 text-red-700 py-2 rounded-lg font-medium transition-all border border-red-300 hover:border-red-400 flex items-center justify-center gap-1.5 text-xs cursor-pointer"
            >
              <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              Delete Account
            </button>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[11px] text-red-700 text-center font-semibold">⚠️ This will permanently delete your account</p>
              
              <div>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:bg-white transition-all outline-none text-gray-900 text-xs text-center"
                  placeholder='Type "delete my account"'
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-1.5 rounded-lg font-medium transition-all text-xs cursor-pointer border border-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText.toLowerCase() !== 'delete my account'}
                  className={`flex-1 py-1.5 rounded-lg font-medium transition-all text-xs ${
                    deleteConfirmText.toLowerCase() === 'delete my account'
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Delete Forever
                </button>
              </div>
            </div>
          )}
          {!deleteConfirm && (
            <p className="text-[10px] text-gray-400 text-center -mt-1">
              This action cannot be undone
            </p>
          )}
        </div>
      </div>
  );
}

export default SettingsPanel;
