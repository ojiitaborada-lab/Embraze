# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "Embraze")
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In Firebase Console, click the web icon (</>) to add a web app
2. Enter app nickname (e.g., "Embraze Web")
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## Step 3: Update Firebase Config

1. Open `src/firebase/config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 4: Enable Authentication

1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Click "Sign-in method" tab
4. Enable "Email/Password"
5. Click "Save"

## Step 5: Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Select "Start in test mode" (for development)
4. Choose a location (closest to your users)
5. Click "Enable"

## Step 6: Set Up Firestore Security Rules

In Firestore, go to "Rules" tab and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if true; // Anyone can read profiles (for emergency alerts)
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Emergency alerts are public (anyone can read)
    match /emergencyAlerts/{alertId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Step 7: Set Up Cloud Functions (Optional - for Mailgun)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Cloud Functions:
```bash
firebase init functions
```

4. Install Mailgun in functions folder:
```bash
cd functions
npm install mailgun-js
```

5. Create function to send emails (functions/index.js):
```javascript
const functions = require('firebase-functions');
const mailgun = require('mailgun-js');

const mg = mailgun({
  apiKey: functions.config().mailgun.key,
  domain: functions.config().mailgun.domain
});

exports.sendEmergencyEmail = functions.firestore
  .document('emergencyAlerts/{alertId}')
  .onCreate(async (snap, context) => {
    const alert = snap.data();
    
    // Get user profile to get emergency contacts
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(alert.userId)
      .get();
    
    const user = userDoc.data();
    const contacts = user.emergencyContacts || [];
    
    // Send email to each contact
    const emailPromises = contacts.map(contact => {
      return mg.messages().send({
        from: 'Emergency Alert <alert@your-domain.com>',
        to: contact.email,
        subject: `🚨 Emergency Alert from ${alert.userName}`,
        text: `${alert.userName} needs help!\n\nLocation: ${alert.address}\nTime: ${new Date(alert.createdAt).toLocaleString()}\n\nView on map: https://your-app.com/map?lat=${alert.latitude}&lng=${alert.longitude}`
      });
    });
    
    await Promise.all(emailPromises);
    console.log(`Sent ${contacts.length} emergency emails`);
  });
```

6. Set Mailgun config:
```bash
firebase functions:config:set mailgun.key="YOUR_MAILGUN_API_KEY"
firebase functions:config:set mailgun.domain="YOUR_MAILGUN_DOMAIN"
```

7. Deploy functions:
```bash
firebase deploy --only functions
```

## Step 8: Test Your Setup

1. Run your app: `npm run dev`
2. Try signing up a new user
3. Update profile information
4. Create an emergency alert
5. Check Firestore Console to see data

## Firestore Collections Structure

### users
```
{
  userId: {
    name: "John Doe",
    email: "john@example.com",
    phone: "+63 912 345 6789",
    photoUrl: "https://...",
    emergencyContacts: [
      { id: 1, name: "Jane", email: "jane@example.com" }
    ],
    settings: {
      notificationSound: true,
      autoShareLocation: true
    },
    createdAt: timestamp,
    updatedAt: timestamp
  }
}
```

### emergencyAlerts
```
{
  alertId: {
    userId: "user123",
    userName: "John Doe",
    phone: "+63 912 345 6789",
    photoUrl: "https://...",
    latitude: 10.3157,
    longitude: 123.8854,
    address: "Cebu City, Philippines",
    status: "active", // or "stopped"
    createdAt: timestamp,
    updatedAt: timestamp,
    stoppedAt: timestamp (optional)
  }
}
```

## Important Notes

- **Test Mode**: Firestore is in test mode for 30 days. Update security rules before going to production!
- **Free Tier Limits**: 
  - 50K reads/day
  - 20K writes/day
  - 20K deletes/day
  - 1GB storage
- **Mailgun Free Tier**: 5,000 emails/month
- **Cloud Functions**: Free tier includes 2M invocations/month

## Next Steps

After setup, the app will:
- ✅ Store user profiles in Firestore
- ✅ Real-time sync of emergency alerts across all users
- ✅ Persist emergency contacts
- ✅ Send email notifications via Mailgun (when Cloud Functions are set up)
- ✅ Authenticate users securely
