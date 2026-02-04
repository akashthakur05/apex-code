# Firebase Notifications Setup Guide

## Overview
This application now supports fetching notifications from Firebase Firestore. The notification system shows both locally defined notifications and notifications from your Firebase database.

## Firebase Collection Structure

### Create a `notifications` Collection
In your Firebase Firestore, create a collection named `notifications` with the following document structure:

```json
{
  "userId": "user-uid-or-broadcast",
  "title": "Notification Title",
  "message": "Notification message content",
  "type": "info|success|warning|error",
  "timestamp": Timestamp.now(),
  "read": false
}
```

### Fields Description
- **userId**: The Firebase user ID for user-specific notifications, or use `"broadcast"` for notifications visible to all users
- **title**: The notification title (max 100 characters recommended)
- **message**: The notification message content (supports multi-line)
- **type**: One of `'info'`, `'success'`, `'warning'`, or `'error'`
- **timestamp**: Firestore Timestamp (automatically set by Firebase)
- **read**: Boolean indicating if the notification has been read

## Adding Notifications Programmatically

### Using the Notifications Service
```typescript
import { addNotificationForUser, addBroadcastNotification } from '@/lib/notifications-service'

// Add a notification for a specific user
await addNotificationForUser(
  userId,
  "Welcome!",
  "You have successfully logged in",
  "success"
)

// Add a broadcast notification (visible to all users)
await addBroadcastNotification(
  "System Update",
  "System maintenance scheduled for tomorrow",
  "info"
)
```

### Direct Firebase Usage
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

await addDoc(collection(db, 'notifications'), {
  userId: 'user-123', // or 'broadcast'
  title: 'New Feature',
  message: 'A new feature has been added',
  type: 'success',
  timestamp: Timestamp.now(),
  read: false,
})
```

## How It Works

### Notification Flow
1. User logs in → AuthProvider initializes
2. AuthProvider renders NotificationsProvider
3. NotificationsProvider listens to Firebase notifications collection
4. Notifications are filtered by `userId` or `'broadcast'`
5. Notifications combined with default local notifications
6. Viewed notifications are stored in localStorage to prevent re-showing

### Notification Display
- Notifications appear as a bell icon in the bottom-right corner of the home page
- Click the bell to open/close the notification panel
- Click a notification to mark it as read
- Click the X button to dismiss a notification
- Dismissed notifications are saved to localStorage and won't reappear on refresh

## Default Notifications

The system includes two hardcoded default notifications:
1. Welcome message about keyboard shortcuts
2. Welcome message about Google OAuth

These are always shown first (if not previously viewed) and combined with Firebase notifications.

## Notification Types and Colors

- **info** (default): Blue background
- **success**: Green background
- **warning**: Yellow background
- **error**: Red background

## Firestore Rules (Recommended)

For security, set up Firestore rules to control access:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{document=**} {
      // Allow users to read notifications for themselves or broadcast
      allow read: if request.auth.uid != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.userId == 'broadcast');
      
      // Only allow admins to write/update notifications
      allow write: if request.auth.uid != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

## Troubleshooting

### Notifications not showing
1. Check Firebase console for errors
2. Verify `notifications` collection exists
3. Check browser console for error messages
4. Ensure user is logged in (notifications only show after login)

### Notifications showing on wrong pages
- Notifications intentionally only display on the homepage (`/`)
- This is controlled in `components/notifications-provider.tsx`

### localStorage clearing
- Viewed notifications are stored in `viewed_notifications` key
- Clear localStorage if you want to see previously dismissed notifications again

## API Reference

### `lib/notifications-service.ts`

#### `addNotificationForUser(userId, title, message, type)`
Add a notification for a specific user.

#### `addBroadcastNotification(title, message, type)`
Add a notification visible to all users.

#### `markNotificationAsRead(notificationId)`
Mark a notification as read in Firebase.

#### `getUnreadNotifications(userId)`
Fetch all unread notifications for a user.

#### `getAllNotifications(userId)`
Fetch all notifications for a user.

## Environment Setup

Ensure your Firebase config is properly set up in `lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  // Your Firebase config
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

## Next Steps

1. Create a `notifications` collection in Firebase Firestore
2. Test by adding a notification via the Firebase console
3. Set up proper Firestore security rules
4. Integrate notification sending in your application flows
