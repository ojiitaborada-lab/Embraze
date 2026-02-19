# Firestore Security Rules Setup

The family circle feature requires Firestore security rules to be deployed to Firebase.

## Option 1: Deploy via Firebase CLI (Recommended)

1. Make sure you have Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Deploy only the Firestore rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Option 2: Manual Setup via Firebase Console

If you prefer to set up rules manually through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

## What the Rules Allow

The security rules enable:

- **Users Collection**: Users can read all profiles, create/update/delete their own
- **Emergency Alerts**: All authenticated users can read alerts, users can manage their own
- **Family Circles**: All authenticated users can read, creators can create, members can update
- **Invite Codes**: All authenticated users can read and create codes, anyone can delete expired codes

## Testing

After deploying the rules, test the family circle feature:

1. Create a family circle (generates invite code)
2. Join a family circle with the code
3. View family members in real-time
4. See family member locations on the map
5. Leave or remove members from the family

## Troubleshooting

If you still see permission errors:

1. Verify rules are deployed: Check Firebase Console → Firestore → Rules
2. Ensure user is authenticated before creating family circles
3. Check browser console for detailed error messages
4. Verify your Firebase project has Firestore enabled
