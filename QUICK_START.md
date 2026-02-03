# Quick Start Guide - New Features

## 🚀 Get Started in 3 Minutes

### 1. Authentication is Already Working ✅
Your app now requires Google login. Users will see the login page at `/login`.

### 2. Add Notifications Anywhere

In any **client component** (with `'use client'` at the top):

```tsx
'use client'
import { useNotifications } from '@/components/notifications-provider'

export function MyComponent() {
  const { addNotification } = useNotifications()
  
  return (
    <button onClick={() => {
      addNotification({
        title: 'Great!',
        message: 'Something awesome happened',
        type: 'success'
      })
    }}>
      Trigger Notification
    </button>
  )
}
```

**Notification Types**:
- `'success'` - ✅ Green (successful operations)
- `'error'` - ❌ Red (errors/failures)
- `'info'` - ℹ️ Blue (information/updates)
- `'warning'` - ⚠️ Yellow (cautions)

### 3. Add Tour to Features

**Step 1**: Mark your UI element with `data-tour`:
```tsx
<button data-tour="my-cool-feature">
  My Cool Feature
</button>
```

**Step 2**: Add the tour step in `/components/tour-provider.tsx`:
```tsx
const tourSteps: Step[] = [
  // ... existing steps ...
  {
    target: '[data-tour="my-cool-feature"]',
    content: 'This is my awesome new feature!',
    placement: 'bottom',
  },
]
```

**Step 3**: Users can start the tour by:
- Clicking the Help button (?) in the header
- Programmatically: `const { startTour } = useTour(); startTour()`

### 4. Check if User is Logged In

```tsx
'use client'
import { useAuth } from '@/components/auth-provider'

export function MyComponent() {
  const { user, loading } = useAuth()
  
  if (loading) return <p>Loading...</p>
  if (!user) return <p>Not logged in</p>
  
  return <p>Welcome, {user.displayName}!</p>
}
```

---

## 🎨 Customize Appearance

### Change Notification Colors
Edit `/components/notifications-provider.tsx`:
```tsx
const getTypeColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200' // Change this
    // ... more cases
  }
}
```

### Change Bell Icon Position
The bell is in the **bottom-right** corner. To move it, edit `/components/notifications-provider.tsx`:
```tsx
<div className="fixed bottom-6 right-6 z-50"> {/* Change bottom/right values */}
```

### Customize Tour Styling
Edit `/components/tour-provider.tsx`:
```tsx
styles={{
  options: {
    primaryColor: '#3b82f6', // Change button color
    backgroundColor: '#fff', // Change tooltip background
    // ... more options
  },
}}
```

---

## 📝 Common Tasks

### Add Logout Button to Header
```tsx
import { LogoutButton } from '@/components/logout-button'

export function Header() {
  return (
    <header>
      <h1>My App</h1>
      <LogoutButton />
    </header>
  )
}
```

### Show Notification After Saving
```tsx
'use client'
import { useNotifications } from '@/components/notifications-provider'

export function SaveButton() {
  const { addNotification } = useNotifications()
  
  const handleSave = async () => {
    try {
      await fetch('/api/save', { method: 'POST' })
      addNotification({
        title: 'Saved!',
        message: 'Your changes have been saved',
        type: 'success'
      })
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to save. Try again.',
        type: 'error'
      })
    }
  }
  
  return <button onClick={handleSave}>Save</button>
}
```

### Disable Tour Auto-Start
The tour is **NOT** auto-starting by default. If you want to enable it for first-time visitors, uncomment this in `/components/tour-provider.tsx`:

```tsx
// useEffect(() => {
//   if (!hasSeenTour && typeof window !== 'undefined') {
//     setTimeout(() => startTour(), 1000)
//   }
// }, [hasSeenTour])
```

### Skip Tour for Specific Users
```tsx
'use client'
import { useAuth } from '@/components/auth-provider'

export function TourCheck() {
  const { user } = useAuth()
  
  // Don't show tour to admins
  if (user?.email?.endsWith('@admin.com')) {
    return null
  }
  
  // Show tour
  const { startTour } = useTour()
  return <button onClick={() => startTour()}>Help</button>
}
```

---

## ⚡ Quick Code Examples

### Example 1: Test Submission with Notification
```tsx
'use client'
import { useNotifications } from '@/components/notifications-provider'

export function TestSubmit() {
  const { addNotification } = useNotifications()
  
  const submit = async () => {
    addNotification({
      title: 'Submitting...',
      message: 'Please wait',
      type: 'info'
    })
    
    try {
      const res = await fetch('/api/submit-test', { method: 'POST' })
      if (res.ok) {
        addNotification({
          title: 'Submitted!',
          message: 'Your test has been submitted successfully',
          type: 'success'
        })
      } else {
        throw new Error()
      }
    } catch {
      addNotification({
        title: 'Failed',
        message: 'Could not submit test',
        type: 'error'
      })
    }
  }
  
  return <button onClick={submit}>Submit Test</button>
}
```

### Example 2: Feature Highlight in Tour
```tsx
// In your component
<div data-tour="leaderboard">
  <h2>Leaderboard</h2>
  {/* Your leaderboard content */}
</div>

// In tour-provider.tsx, add step:
{
  target: '[data-tour="leaderboard"]',
  content: 'Check your ranking against other students!',
  placement: 'bottom',
}
```

### Example 3: Redirect Unauthenticated Users
```tsx
'use client'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])
  
  if (loading) return <p>Loading...</p>
  if (!user) return null
  
  return <p>Protected content here</p>
}
```

---

## 🐛 Troubleshooting

### Notifications not appearing?
- Make sure you're in a **client component** (use `'use client'` at the top)
- Check browser console for errors
- Verify `NotificationsProvider` is in component hierarchy

### Tour not working?
- Verify the `data-tour` attribute matches in tour step target
- Check that tour steps are in `/components/tour-provider.tsx`
- Try browser reload to clear cache
- Open DevTools and search for the element with `data-tour` attribute

### Login not working?
- Verify Firebase environment variables are set correctly
- Check Firebase console - is Google Sign-In enabled?
- Clear browser cookies and try again

### Not seeing logout button?
- Remember to import: `import { LogoutButton } from '@/components/logout-button'`
- Add it to your header/navbar component

---

## 📚 More Details

For complete documentation, see:
- **Features Guide**: `/FEATURES_GUIDE.md`
- **Implementation Summary**: `/IMPLEMENTATION_SUMMARY.md`
- **Notification Examples**: `/lib/notification-examples.ts`
- **Demo Component**: `/components/features-demo.tsx`

---

## ✨ You're All Set!

Your app now has:
- ✅ Google authentication
- ✅ Notification system with bell icon
- ✅ Interactive onboarding tour
- ✅ All integrated and ready to use

Start adding notifications and tour steps to guide your users! 🚀
