# Architecture Overview - Version 4.1.0

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Client                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   RootLayout (Server)                        │
│  - Initial page load & metadata                             │
│  - Sets up global providers                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   AuthProvider (Client)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Manages Firebase authentication state              │   │
│  │  - Tracks current user                              │   │
│  │  - Handles auth state changes                       │   │
│  │  - Provides useAuth() hook                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              NotificationsProvider (Client)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Manages notification state & UI                    │   │
│  │  - Stores notifications in memory                   │   │
│  │  - Provides useNotifications() hook                 │   │
│  │  - Renders NotificationCenter (bell + dropdown)     │   │
│  │  - Fixed position in bottom-right corner            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 TourProvider (Client)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Manages Joyride guided tour                        │   │
│  │  - Stores tour state (active/completed)             │   │
│  │  - Provides useTour() hook                          │   │
│  │  - Renders Joyride overlay                          │   │
│  │  - Uses localStorage for persistence                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Page Content                               │
│                                                              │
│  ┌──────────────────────┐    ┌──────────────────────────┐  │
│  │ Public Routes        │    │ Protected Routes         │  │
│  │ - /login            │    │ - /                      │  │
│  │ - (others)          │    │ - /coaching/*            │  │
│  │                      │    │ - /progress              │  │
│  │ Accessible without   │    │ - (wrapped with          │  │
│  │ authentication       │    │  ProtectedLayout)        │  │
│  └──────────────────────┘    │                          │  │
│                               │ Redirect to /login       │  │
│                               │ if not authenticated     │  │
│                               └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Tree

```
RootLayout
  └── AuthProvider
      ├── NotificationsProvider
      │   ├── TourProvider
      │   │   ├── ProtectedLayout (for /*, /coaching/*, /progress)
      │   │   │   ├── CoachingList (main page)
      │   │   │   ├── TestList
      │   │   │   └── etc...
      │   │   │
      │   │   └── LoginPage (public)
      │   │
      │   └── NotificationCenter (UI)
      │       ├── Bell Button (fixed position)
      │       └── Notification Dropdown
      │
      └── Joyride Tour Overlay (when active)
```

---

## Data Flow Diagram

### Authentication Flow
```
User visits app
    │
    ▼
AuthProvider initializes Firebase
    │
    ├─── Firebase returns user? ───► useAuth() returns user ──► Page renders content
    │
    └─── No user? ──────────────────► ProtectedLayout redirects ──► /login page
                                            │
                                            ▼
                                    User clicks "Sign in with Google"
                                            │
                                            ▼
                                    Google OAuth popup
                                            │
                                            ▼
                                    Firebase confirms auth
                                            │
                                            ▼
                                    Redirected to original page
```

### Notification Flow
```
Component calls addNotification()
    │
    ▼
Notification added to context state
    │
    ├─── UI updates immediately
    │    └─► Bell shows unread count
    │
    └─► NotificationCenter renders new notification
        │
        ├─► User can mark as read
        └─► User can dismiss (removeNotification)
```

### Tour Flow
```
User clicks Help button or startTour() called
    │
    ▼
TourProvider sets isTourActive = true
    │
    ▼
Joyride renders overlay and highlights first step
    │
    ├─── User clicks Next ───► Shows next step
    │
    ├─── User clicks Skip ───► Tour ends (localStorage)
    │
    └─── Last step + Continue ───► Tour ends (localStorage)
```

---

## File Structure

```
/
├── app/
│   ├── layout.tsx                    (✏️ Modified - Added AuthProvider)
│   ├── page.tsx                      (✏️ Modified - Added ProtectedLayout)
│   ├── login/
│   │   └── page.tsx                  (🆕 New - Login page)
│   ├── coaching/                     (existing pages)
│   ├── progress/                     (existing pages)
│   └── ...
│
├── components/
│   ├── auth-provider.tsx             (✏️ Modified - Added providers)
│   ├── protected-layout.tsx           (🆕 New - Route protection)
│   ├── login-form.tsx                (🆕 New - Google sign-in form)
│   ├── logout-button.tsx             (🆕 New - Sign-out button)
│   │
│   ├── notifications-provider.tsx    (🆕 New - Notification system)
│   ├── help-button.tsx               (🆕 New - Tour trigger)
│   │
│   ├── tour-provider.tsx             (🆕 New - Joyride integration)
│   ├── features-demo.tsx             (🆕 New - Demo component)
│   │
│   ├── coaching-list.tsx             (✏️ Modified - Added help button)
│   │
│   ├── ui/                           (existing components)
│   └── ...
│
├── lib/
│   ├── firebase.ts                   (🆕 New - Firebase config)
│   ├── notification-examples.ts      (🆕 New - Usage examples)
│   └── ...
│
├── public/
│   └── ... (existing assets)
│
├── package.json                       (✏️ Modified - Added firebase, react-joyride)
├── FEATURES_GUIDE.md                 (🆕 New - Complete documentation)
├── IMPLEMENTATION_SUMMARY.md         (🆕 New - What was added)
├── QUICK_START.md                    (🆕 New - Quick reference)
└── ARCHITECTURE.md                   (🆕 New - This file)
```

Legend:
- 🆕 = Newly created
- ✏️ = Modified/updated
- (existing) = Unchanged

---

## State Management

### AuthProvider State
```typescript
interface AuthContextType {
  user: User | null;              // Firebase user object
  loading: boolean;                // Loading state during auth check
}
```

### NotificationsProvider State
```typescript
interface Notification {
  id: string;                      // Unique ID
  title: string;                   // Notification title
  message: string;                 // Notification message
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;                 // When notification was created
  read: boolean;                   // If user has read it
}

// Context provides:
notifications: Notification[];     // All notifications
addNotification();                 // Add new notification
removeNotification(id);            // Delete notification
markAsRead(id);                    // Mark as read
clearAll();                        // Clear all notifications
```

### TourProvider State
```typescript
interface TourContextType {
  isTourActive: boolean;           // Is tour currently showing
  startTour();                     // Start the tour
  endTour();                       // End the tour
  // localStorage: 'tour-seen'      // Persists if user saw tour
}
```

---

## API Integration Points

### Firebase Authentication
- **SDK**: firebase/auth
- **Configuration**: `/lib/firebase.ts`
- **Environment Variables**: `NEXT_PUBLIC_FIREBASE_*`
- **Methods Used**:
  - `onAuthStateChanged()` - Monitor auth state
  - `signInWithPopup()` - Google sign-in
  - `signOut()` - Logout

### Joyride Tour
- **Library**: react-joyride
- **Configuration**: `/components/tour-provider.tsx`
- **Features Used**:
  - `<Joyride>` component for rendering
  - Step targeting with CSS selectors
  - Progress indication
  - Skip/finish callbacks

### Browser APIs
- **localStorage**: 'tour-seen' key (stores tour completion)
- **Window**: Fixed position for notification center

---

## Security Considerations

### Authentication
- ✅ Firebase handles secure credential storage
- ✅ Auth state validated on every app load
- ✅ Protected routes redirect to login if needed
- ✅ Session tokens managed by Firebase

### Data Privacy
- ✅ Environment variables never exposed to client (except NEXT_PUBLIC_*)
- ✅ Notifications stored in memory only (cleared on refresh)
- ✅ Tour completion tracked locally (localStorage)

### XSS Prevention
- ✅ All dynamic content properly escaped
- ✅ No dangerous innerHTML usage
- ✅ React built-in protection

---

## Performance Considerations

### Code Splitting
- ✅ Providers loaded only when needed
- ✅ Joyride library lazy-loaded with tour
- ✅ Firebase SDK split across dynamic imports

### Optimization
- ✅ Notification state in memory (lightweight)
- ✅ Tour state only when active
- ✅ Auth state efficiently tracked

### Bundle Size Impact
- `firebase`: ~200KB (compressed)
- `react-joyride`: ~30KB (compressed)
- Custom code: ~5KB

---

## Error Handling

### Authentication Errors
```typescript
// In AuthProvider
onAuthStateChanged handles:
- Network errors
- Firebase service unavailable
- Invalid credentials
- Session expiration
```

### Notification Errors
```typescript
// Safely stored in memory
// Never fails - just adds to state
// UI updates immediately
```

### Tour Errors
```typescript
// Gracefully handles:
- Missing data-tour attributes
- Invalid step targets
- localStorage unavailable
```

---

## Extensibility

### Adding New Notifications
1. Call `addNotification()` from any client component
2. Specify type, title, message
3. Notification appears in bell dropdown automatically

### Adding Tour Steps
1. Add `data-tour="feature-name"` to element
2. Add step object to `tourSteps` array
3. Step appears in tour automatically

### Adding New Protected Routes
1. Wrap component with `<ProtectedLayout>`
2. Automatically redirects unauthenticated users
3. No additional authentication code needed

---

## Testing Strategy

### Unit Tests
- Auth state changes
- Notification CRUD operations
- Tour step progression

### Integration Tests
- End-to-end auth flow
- Notifications with other features
- Tour highlighting correct elements

### E2E Tests
- Complete user journey
- Cross-browser compatibility
- Mobile responsiveness

---

## Future Enhancements

### Notifications
- [ ] Notification persistence (database)
- [ ] Notification schedules
- [ ] Email notifications
- [ ] Sound/desktop alerts
- [ ] Notification preferences UI

### Tour
- [ ] Multiple tour tracks (onboarding, feature discovery)
- [ ] Analytics on tour completion
- [ ] Dynamic tour steps based on user role
- [ ] Tutorial videos inline with steps

### Authentication
- [ ] User profiles/settings
- [ ] Role-based access control
- [ ] OAuth with other providers
- [ ] Two-factor authentication

### General
- [ ] Dark mode support (already in place)
- [ ] Accessibility improvements (WCAG 2.1 AAA)
- [ ] Internationalization (i18n)
- [ ] Analytics integration

---

## Debugging

### Check Auth State
```tsx
const { user, loading } = useAuth()
console.log('User:', user)
console.log('Loading:', loading)
```

### Check Notifications
```tsx
const { notifications } = useNotifications()
console.log('All notifications:', notifications)
```

### Check Tour Status
```tsx
const { isTourActive } = useTour()
console.log('Tour active:', isTourActive)
```

### Browser DevTools
- Check `localStorage.getItem('tour-seen')`
- Check Firebase Auth in Application tab
- Check Console for errors from providers

---

## References

- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [React Joyride Docs](https://docs.react-joyride.com)
- [React Context API](https://react.dev/reference/react/useContext)
- [Next.js App Router](https://nextjs.org/docs/app)
