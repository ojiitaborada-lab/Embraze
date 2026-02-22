import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from './config';

// User Profile Services
export const saveUserProfile = async (userId, profileData) => {
  try {
    // Check if name is being changed
    if (profileData.name) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const lastNameChange = userData.lastNameChange;
        
        // Check if 7 days have passed since last name change
        if (lastNameChange) {
          const daysSinceChange = (Date.now() - lastNameChange) / (1000 * 60 * 60 * 24);
          if (daysSinceChange < 7 && userData.name !== profileData.name) {
            const daysLeft = Math.ceil(7 - daysSinceChange);
            return { 
              success: false, 
              error: `You can change your name again in ${daysLeft} day${daysLeft > 1 ? 's' : ''}` 
            };
          }
        }
        
        // If name is being changed, update lastNameChange timestamp
        if (userData.name !== profileData.name) {
          profileData.lastNameChange = Date.now();
        }
      } else {
        // First time setting name
        profileData.lastNameChange = Date.now();
      }
    }
    
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return { success: false, error: error.message };
  }
};

// Emergency Alert Services
// NOTE: Photos are currently stored as base64 in Firestore (MVP)
// TODO: For production, upload photos to Firebase Storage and store URLs
export const createEmergencyAlert = async (userId, alertData) => {
  try {
    const alertRef = doc(collection(db, 'emergencyAlerts'));
    await setDoc(alertRef, {
      ...alertData,
      userId,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, alertId: alertRef.id };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: error.message };
  }
};

export const createOrUpdateEmergencyAlert = async (userId, alertData) => {
  try {
    // Check if user already has an active alert
    const q = query(
      collection(db, 'emergencyAlerts'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Update existing alert
      const existingAlertDoc = snapshot.docs[0];
      await updateDoc(existingAlertDoc.ref, {
        ...alertData,
        status: 'active',
        updatedAt: serverTimestamp()
      });
      return { success: true, alertId: existingAlertDoc.id, isUpdate: true };
    } else {
      // Create new alert
      const alertRef = doc(collection(db, 'emergencyAlerts'));
      await setDoc(alertRef, {
        ...alertData,
        userId,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true, alertId: alertRef.id, isUpdate: false };
    }
  } catch (error) {
    console.error('Error creating/updating alert:', error);
    return { success: false, error: error.message };
  }
};

export const updateEmergencyAlert = async (alertId, updates) => {
  try {
    const alertRef = doc(db, 'emergencyAlerts', alertId);
    await updateDoc(alertRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating alert:', error);
    return { success: false, error: error.message };
  }
};

export const stopEmergencyAlert = async (alertId) => {
  try {
    const alertRef = doc(db, 'emergencyAlerts', alertId);
    await updateDoc(alertRef, {
      status: 'stopped',
      isActive: false,
      stoppedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error stopping alert:', error);
    return { success: false, error: error.message };
  }
};

export const deleteEmergencyAlert = async (alertId) => {
  try {
    await deleteDoc(doc(db, 'emergencyAlerts', alertId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting alert:', error);
    return { success: false, error: error.message };
  }
};

// Real-time listeners
export const subscribeToActiveAlerts = (callback) => {
  const q = query(
    collection(db, 'emergencyAlerts'),
    where('status', 'in', ['active', 'stopped'])
  );
  
  return onSnapshot(q, (snapshot) => {
    const alerts = [];
    const now = Date.now();
    const twentyFourHoursAgo = now - (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    
    snapshot.forEach((doc) => {
      const alertData = doc.data();
      
      // If alert is stopped, check if it's older than 24 hours
      if (alertData.status === 'stopped' && alertData.stoppedAt) {
        const stoppedTime = alertData.stoppedAt.toMillis ? alertData.stoppedAt.toMillis() : alertData.stoppedAt;
        
        // Skip alerts stopped more than 24 hours ago
        if (stoppedTime < twentyFourHoursAgo) {
          // Optionally delete the old stopped alert from Firestore
          deleteDoc(doc.ref).catch(err => console.error('Error deleting old alert:', err));
          return; // Don't include in results
        }
      }
      
      alerts.push({
        id: doc.id,
        ...alertData
      });
    });
    
    callback(alerts);
  }, (error) => {
    console.error('Error listening to alerts:', error);
  });
};

export const subscribeToUserProfile = (userId, callback) => {
  const docRef = doc(db, 'users', userId);
  
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  }, (error) => {
    console.error('Error listening to profile:', error);
  });
};

// Emergency Contacts Services
export const saveEmergencyContacts = async (userId, contacts) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      emergencyContacts: contacts,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving contacts:', error);
    return { success: false, error: error.message };
  }
};

export const getEmergencyContacts = async (userId) => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().emergencyContacts) {
      return { success: true, contacts: docSnap.data().emergencyContacts };
    } else {
      return { success: true, contacts: [] };
    }
  } catch (error) {
    console.error('Error getting contacts:', error);
    return { success: false, error: error.message };
  }
};

// Delete user data
export const deleteUserData = async (userId) => {
  try {
    // Delete user profile
    await deleteDoc(doc(db, 'users', userId));
    
    // Delete all user's emergency alerts
    const alertsQuery = query(
      collection(db, 'emergencyAlerts'),
      where('userId', '==', userId)
    );
    const alertsSnapshot = await getDocs(alertsQuery);
    const deletePromises = alertsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return { success: false, error: error.message };
  }
};

// Family Circle Services
export const createFamilyCircle = async (creatorId, inviteCode, familyName = 'My Family') => {
  try {
    const familyRef = doc(collection(db, 'familyCircles'));
    const codeRef = doc(db, 'inviteCodes', inviteCode);
    
    // Create family circle
    await setDoc(familyRef, {
      name: familyName,
      creatorId,
      members: [creatorId],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Create invite code with expiry
    await setDoc(codeRef, {
      familyId: familyRef.id,
      creatorId,
      expiresAt: Date.now() + 25000, // 25 seconds
      createdAt: serverTimestamp()
    });
    
    // Update user profile with family ID
    await updateDoc(doc(db, 'users', creatorId), {
      familyId: familyRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, familyId: familyRef.id };
  } catch (error) {
    console.error('Error creating family circle:', error);
    return { success: false, error: error.message };
  }
};

export const joinFamilyCircle = async (userId, inviteCode) => {
  try {
    const codeRef = doc(db, 'inviteCodes', inviteCode);
    const codeSnap = await getDoc(codeRef);
    
    if (!codeSnap.exists()) {
      return { success: false, error: 'Invalid invite code' };
    }
    
    const codeData = codeSnap.data();
    
    // Check if code expired
    if (codeData.expiresAt < Date.now()) {
      await deleteDoc(codeRef);
      return { success: false, error: 'Invite code expired' };
    }
    
    const familyRef = doc(db, 'familyCircles', codeData.familyId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return { success: false, error: 'Family circle not found' };
    }
    
    const familyData = familySnap.data();
    
    // Check if family is full (max 6 members)
    if (familyData.members.length >= 6) {
      return { success: false, error: 'Family circle is full' };
    }
    
    // Check if user already in family
    if (familyData.members.includes(userId)) {
      return { success: false, error: 'Already in this family circle' };
    }
    
    // Add user to family
    await updateDoc(familyRef, {
      members: [...familyData.members, userId],
      updatedAt: serverTimestamp()
    });
    
    // Update user profile with family ID
    await updateDoc(doc(db, 'users', userId), {
      familyId: codeData.familyId,
      updatedAt: serverTimestamp()
    });
    
    // Delete the invite code after successful join
    await deleteDoc(codeRef);
    
    return { success: true, familyId: codeData.familyId };
  } catch (error) {
    console.error('Error joining family circle:', error);
    return { success: false, error: error.message };
  }
};

export const leaveFamilyCircle = async (userId, familyId) => {
  try {
    const familyRef = doc(db, 'familyCircles', familyId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return { success: false, error: 'Family circle not found' };
    }
    
    const familyData = familySnap.data();
    
    // If user is creator, delete the entire family
    if (familyData.creatorId === userId) {
      // Remove family ID from all members
      const updatePromises = familyData.members.map(memberId =>
        updateDoc(doc(db, 'users', memberId), {
          familyId: null,
          updatedAt: serverTimestamp()
        })
      );
      await Promise.all(updatePromises);
      
      // Delete family circle
      await deleteDoc(familyRef);
    } else {
      // Remove user from family members
      const updatedMembers = familyData.members.filter(id => id !== userId);
      await updateDoc(familyRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp()
      });
      
      // Remove family ID from user profile
      await updateDoc(doc(db, 'users', userId), {
        familyId: null,
        updatedAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error leaving family circle:', error);
    return { success: false, error: error.message };
  }
};

export const removeFamilyMember = async (creatorId, familyId, memberId) => {
  try {
    const familyRef = doc(db, 'familyCircles', familyId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return { success: false, error: 'Family circle not found' };
    }
    
    const familyData = familySnap.data();
    
    // Verify user is creator
    if (familyData.creatorId !== creatorId) {
      return { success: false, error: 'Only creator can remove members' };
    }
    
    // Remove member from family
    const updatedMembers = familyData.members.filter(id => id !== memberId);
    await updateDoc(familyRef, {
      members: updatedMembers,
      updatedAt: serverTimestamp()
    });
    
    // Remove family ID from member's profile
    await updateDoc(doc(db, 'users', memberId), {
      familyId: null,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing family member:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeFamilyMembers = (familyId, callback) => {
  const familyRef = doc(db, 'familyCircles', familyId);
  
  let unsubscribeUsers = [];
  
  const unsubscribeFamily = onSnapshot(familyRef, async (familyDoc) => {
    if (!familyDoc.exists()) {
      callback({ members: [], familyName: '' });
      return;
    }
    
    const familyData = familyDoc.data();
    const memberIds = familyData.members || [];
    
    // Unsubscribe from previous user listeners
    unsubscribeUsers.forEach(unsub => unsub());
    unsubscribeUsers = [];
    
    // Create a map to store member data
    const membersMap = new Map();
    
    // Subscribe to each member's user document for real-time updates
    memberIds.forEach((memberId) => {
      const userRef = doc(db, 'users', memberId);
      const unsubUser = onSnapshot(userRef, (userDoc) => {
        if (userDoc.exists()) {
          membersMap.set(memberId, {
            id: memberId,
            ...userDoc.data(),
            isCreator: memberId === familyData.creatorId,
            isOnline: userDoc.data().isOnline || false
          });
        } else {
          membersMap.delete(memberId);
        }
        
        // Trigger callback with updated members
        const members = Array.from(membersMap.values());
        callback({ members, familyName: familyData.name || 'My Family' });
      });
      
      unsubscribeUsers.push(unsubUser);
    });
  }, (error) => {
    console.error('Error listening to family members:', error);
    callback({ members: [], familyName: '' });
  });
  
  // Return combined unsubscribe function
  return () => {
    unsubscribeFamily();
    unsubscribeUsers.forEach(unsub => unsub());
  };
};

export const updateUserLocation = async (userId, latitude, longitude) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      location: { latitude, longitude },
      lastLocationUpdate: serverTimestamp(),
      isOnline: true,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating location:', error);
    return { success: false, error: error.message };
  }
};

export const createInviteCode = async (familyId, inviteCode, creatorId) => {
  try {
    const codeRef = doc(db, 'inviteCodes', inviteCode);
    
    // Create invite code with expiry
    await setDoc(codeRef, {
      familyId,
      creatorId,
      expiresAt: Date.now() + 25000, // 25 seconds
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error creating invite code:', error);
    return { success: false, error: error.message };
  }
};


// History Management
export const getAlertHistory = async (userId, daysBack = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const q = query(
      collection(db, 'emergencyAlerts'),
      where('status', '==', 'stopped'),
      where('stoppedAt', '>=', cutoffDate),
      orderBy('stoppedAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const history = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt,
        stoppedAt: data.stoppedAt?.toMillis ? data.stoppedAt.toMillis() : data.stoppedAt
      });
    });
    
    return { success: true, history };
  } catch (error) {
    console.error('Error fetching history:', error);
    return { success: false, error: error.message, history: [] };
  }
};

export const clearAlertHistory = async (userId) => {
  try {
    // Get all stopped alerts older than 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    
    const q = query(
      collection(db, 'emergencyAlerts'),
      where('status', '==', 'stopped'),
      where('stoppedAt', '<', cutoffDate)
    );
    
    const snapshot = await getDocs(q);
    const deletePromises = [];
    
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    return { success: true };
  } catch (error) {
    console.error('Error clearing history:', error);
    return { success: false, error: error.message };
  }
};

export const deleteHistoryItem = async (alertId) => {
  try {
    await deleteDoc(doc(db, 'emergencyAlerts', alertId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting history item:', error);
    return { success: false, error: error.message };
  }
};
