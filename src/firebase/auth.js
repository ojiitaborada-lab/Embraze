import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  deleteUser
} from 'firebase/auth';
import { auth } from './config';
import { saveUserProfile, getUserProfile } from './services';

// Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user profile exists
    const profileResult = await getUserProfile(user.uid);
    
    let isNewUser = false;
    
    // If new user, create profile
    if (!profileResult.success) {
      isNewUser = true;
      await saveUserProfile(user.uid, {
        name: user.displayName || 'User',
        email: user.email,
        phone: '',
        photoUrl: user.photoURL,
        createdAt: new Date().toISOString()
      });
    }
    
    return { success: true, user, isNewUser };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific error codes
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in cancelled' };
    } else if (error.code === 'auth/popup-blocked') {
      return { success: false, error: 'Popup blocked by browser. Please allow popups for this site.' };
    } else if (error.code === 'auth/cancelled-popup-request') {
      return { success: false, error: 'Another sign-in popup is already open' };
    }
    
    return { success: false, error: error.message };
  }
};

// Sign out
export const logOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Delete account
export const deleteAccount = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    
    await deleteUser(user);
    return { success: true };
  } catch (error) {
    console.error('Error deleting account:', error);
    return { success: false, error: error.message };
  }
};
