# Apex Code v4.2.0 - MCQ Test Series App

> A modern, fully-featured MCQ testing platform with authentication, notifications, and interactive onboarding.

## Features

### 🔐 Google Firebase Authentication
- Secure Google OAuth sign-in
- Protected routes (non-authenticated users redirected to login)
- Client-side only (no backend server needed)
- Automatic session persistence

### 🔔 Real-Time Notifications
- Bell icon showing unread count
- Version updates and feature announcements
- Mark as read / dismiss functionality
- Beautiful, categorized notifications

### 📍 Interactive Onboarding Tour
- Guided tour of all features
- 4-step walkthrough with element highlighting
- Skip anytime option
- Remembers if user has seen tour

### 🚪 Logout Functionality
- Sign out button in navbar
- Clears Firebase session
- Automatic redirect to login

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: Firebase Google OAuth
- **Styling**: Tailwind CSS + shadcn/ui
- **Tour**: React Joyride
- **Hosting**: Vercel (SSG)

---

## Quick Start

### 1. Environment Setup
```bash
# Add these variables to your Vercel project (Vars section):
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 2. Firebase Setup
1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Google Sign-In in Authentication → Sign-in method
3. Copy Web Config from Project Settings
4. Paste values into environment variables

### 3. Deploy
```bash
git push origin main
# Vercel auto-deploys in 2-3 minutes
```

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with auth providers
│   ├── page.tsx                # Protected home page
│   ├── login/
│   │   └── page.tsx            # Login page
│   └── globals.css             # Global styles
├── components/
│   ├── auth-provider.tsx       # Firebase auth context
│   ├── protected-layout.tsx    # Route protection wrapper
│   ├── login-form.tsx          # Google sign-in form
│   ├── logout-button.tsx       # Sign-out button
│   ├── notifications-provider.tsx  # Notification system
│   ├── tour-provider.tsx       # Joyride tour setup
│   ├── help-button.tsx         # Tour trigger
│   ├── coaching-list.tsx       # Main content
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── firebase.ts             # Firebase config
│   └── data.json               # Test data
└── package.json                # Dependencies
```

---

## How It Works

### Authentication Flow
```
User visits → Server renders login page (SSG)
           → Browser loads JavaScript
           → Firebase checks auth state
           → If logged in → Show home
           → If not → Stay on login
```

### User Actions
```
User clicks "Sign in with Google"
           → Firebase OAuth popup
           → User authenticates
           → Session stored in browser
           → Redirect to home

User clicks "Sign Out"
           → Firebase signs out
           → Session cleared
           → Redirect to login
```

### Features
```
Notifications: Bell icon → Click → See updates
Tour: ? button → Click → See guided walkthrough
Logout: Sign Out button → Click → Sign out and go to login
```

---

## Key Components

### AuthProvider
Context provider that:
- Initializes Firebase
- Tracks authentication state
- Provides user object and loading state
- Wraps Notifications and Tour providers

### ProtectedLayout
Wrapper that:
- Checks if user is authenticated
- Shows loading state while checking
- Redirects to login if not authenticated
- Shows content if authenticated

### NotificationsProvider
System that:
- Maintains notification list
- Adds new notifications
- Marks notifications as read
- Dismisses notifications
- Shows bell icon with unread count

### TourProvider
Joyride integration that:
- Defines tour steps
- Starts/ends tour
- Remembers tour state
- Highlights elements

---

## No Hydration Issues

All components are built to be SSG-compatible:
- ✅ No localStorage in initial state
- ✅ No Date objects in initial render
- ✅ Client-only components where needed
- ✅ Proper hydration tracking
- ✅ Safe date formatting

See `/HYDRATION_FIX.md` for technical details.

---

## API Reference

### useAuth()
Check authentication status:
```tsx
const { user, loading } = useAuth()
// user: User | null
// loading: boolean
```

### useNotifications()
Send notifications:
```tsx
const { addNotification } = useNotifications()
addNotification({
  title: 'Update',
  message: 'New feature available',
  type: 'info' // 'info' | 'success' | 'warning' | 'error'
})
```

### useTour()
Control tour:
```tsx
const { startTour, endTour, isTourActive } = useTour()
```

---

## Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Add environment variables
3. Push to main branch
4. Vercel auto-deploys

### Build Locally
```bash
npm run build
npm run start
```

---

## Documentation

- **Hydration Fixes**: See `/HYDRATION_FIX.md`
- **Changes Made**: See `/FINAL_CHANGES_SUMMARY.md`
- **Quick Reference**: See `/QUICK_REFERENCE.md`
- **Deploy Checklist**: See `/DEPLOY_NOW.md`

---

## Version History

- **v4.0.0** - Firebase authentication
- **v4.1.0** - Notifications + Tour
- **v4.2.0** - Hydration fixes + Logout button

---

## Support

- **Firebase Issues**: https://console.firebase.google.com
- **Vercel Support**: https://vercel.com/help
- **Next.js Docs**: https://nextjs.org
- **React Joyride**: https://docs.react-joyride.com

---

## License

MIT - Use freely for any purpose

---

**Built with Next.js, Firebase, and Tailwind CSS** ⚡
