# 🔔 Notification Integration Guide - v4.1.0

## Quick Start - Add a Notification in 2 Minutes

### Step 1: Import the hook
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
```

### Step 2: Call the function
```tsx
const { addNotification } = useNotifications()

addNotification({
  title: 'Success!',
  message: 'Your action completed successfully',
  type: 'success'
})
```

**That's it!** 🎉

---

## Real-World Examples

### Example 1: Test Submission Success
```tsx
'use client'

import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/notifications-provider'

export function SubmitTestButton() {
  const { addNotification } = useNotifications()

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/submit-test', { 
        method: 'POST',
        body: JSON.stringify({ testId: 123 })
      })

      if (res.ok) {
        addNotification({
          title: '✅ Test Submitted!',
          message: 'Your answers have been recorded. Results coming soon!',
          type: 'success'
        })
      } else {
        throw new Error('Failed to submit')
      }
    } catch (error) {
      addNotification({
        title: '❌ Submission Failed',
        message: 'Please check your connection and try again',
        type: 'error'
      })
    }
  }

  return (
    <Button onClick={handleSubmit} size="lg">
      Submit Test
    </Button>
  )
}
```

### Example 2: Feature Update Announcement
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { useEffect } from 'react'

export function AnnouncementNotification() {
  const { addNotification } = useNotifications()

  useEffect(() => {
    // Show announcement after 2 seconds
    const timer = setTimeout(() => {
      addNotification({
        title: '🎉 New Features Available!',
        message: 'v4.2.0 now includes dark mode and offline mode',
        type: 'info'
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [addNotification])

  return null
}
```

### Example 3: Progress Saved Notification
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { Button } from '@/components/ui/button'

export function SaveProgressButton() {
  const { addNotification } = useNotifications()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    setIsSaving(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      addNotification({
        title: '💾 Progress Saved',
        message: 'Your progress has been saved to your account',
        type: 'success'
      })
    } catch (error) {
      addNotification({
        title: '⚠️ Save Failed',
        message: 'Could not save progress. Please try again.',
        type: 'warning'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button onClick={handleSave} disabled={isSaving}>
      {isSaving ? 'Saving...' : 'Save Progress'}
    </Button>
  )
}
```

### Example 4: Session Timeout Warning
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { useAuth } from '@/components/auth-provider'
import { useEffect } from 'react'

export function SessionWarning() {
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Show warning 5 minutes before session expires
    const timer = setTimeout(() => {
      addNotification({
        title: '⏰ Session Expiring Soon',
        message: 'Your session will expire in 5 minutes. Save your work!',
        type: 'warning'
      })
    }, 55 * 60 * 1000) // 55 minutes

    return () => clearTimeout(timer)
  }, [user, addNotification])

  return null
}
```

### Example 5: Error Recovery with Retry
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function RetryableAction() {
  const { addNotification } = useNotifications()
  const [retryCount, setRetryCount] = useState(0)

  const handleAction = async (retry = false) => {
    if (retry) {
      setRetryCount(prev => prev + 1)
    }

    try {
      const res = await fetch('/api/action')
      if (!res.ok) throw new Error('Failed')

      addNotification({
        title: '✓ Success',
        message: 'Action completed successfully',
        type: 'success'
      })
      setRetryCount(0)
    } catch (error) {
      if (retryCount < 3) {
        addNotification({
          title: '❌ Error - Retrying...',
          message: `Attempt ${retryCount + 1} of 3. Will retry in 2 seconds.`,
          type: 'error'
        })
        setTimeout(() => handleAction(true), 2000)
      } else {
        addNotification({
          title: '❌ Failed After 3 Attempts',
          message: 'Please contact support if the issue persists',
          type: 'error'
        })
        setRetryCount(0)
      }
    }
  }

  return (
    <Button onClick={() => handleAction()}>
      Perform Action
    </Button>
  )
}
```

---

## Notification Types & Colors

### Info Notification (Blue)
```tsx
addNotification({
  title: 'ℹ️ Information',
  message: 'Here is some helpful information',
  type: 'info'
})
```
**Use for**: Updates, announcements, general info

### Success Notification (Green)
```tsx
addNotification({
  title: '✓ Success',
  message: 'Operation completed successfully',
  type: 'success'
})
```
**Use for**: Successful actions, completed tasks, confirmations

### Warning Notification (Yellow)
```tsx
addNotification({
  title: '⚠️ Warning',
  message: 'Please be aware of this',
  type: 'warning'
})
```
**Use for**: Cautions, reminders, important notices

### Error Notification (Red)
```tsx
addNotification({
  title: '❌ Error',
  message: 'Something went wrong',
  type: 'error'
})
```
**Use for**: Errors, failures, critical issues

---

## Advanced Usage

### Using with useCallback for Performance
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { useCallback } from 'react'

export function OptimizedComponent() {
  const { addNotification } = useNotifications()

  const notifySuccess = useCallback(() => {
    addNotification({
      title: 'Success!',
      message: 'Operation completed',
      type: 'success'
    })
  }, [addNotification])

  return <button onClick={notifySuccess}>Action</button>
}
```

### Creating a Notification Helper
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'

export function useNotificationHelper() {
  const { addNotification } = useNotifications()

  return {
    success: (title: string, message: string) => {
      addNotification({ title, message, type: 'success' })
    },
    error: (title: string, message: string) => {
      addNotification({ title, message, type: 'error' })
    },
    info: (title: string, message: string) => {
      addNotification({ title, message, type: 'info' })
    },
    warning: (title: string, message: string) => {
      addNotification({ title, message, type: 'warning' })
    },
  }
}

// Usage
export function MyComponent() {
  const notification = useNotificationHelper()

  return (
    <button onClick={() => notification.success('Done!', 'Your action succeeded')}>
      Action
    </button>
  )
}
```

### Conditional Notifications Based on User Role
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { useAuth } from '@/components/auth-provider'

export function RoleBasedNotification() {
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  const handleAction = () => {
    // Different messages based on user role
    const isAdmin = user?.email?.endsWith('@admin.com')

    addNotification({
      title: isAdmin ? 'Admin Action' : 'User Action',
      message: isAdmin 
        ? 'Admin access granted' 
        : 'Your action has been recorded',
      type: 'info'
    })
  }

  return <button onClick={handleAction}>Take Action</button>
}
```

### Notifications with Dynamic Content
```tsx
'use client'

import { useNotifications } from '@/components/notifications-provider'
import { useState } from 'react'

export function DynamicNotification() {
  const { addNotification } = useNotifications()
  const [count, setCount] = useState(0)

  const handleIncrement = () => {
    const newCount = count + 1
    setCount(newCount)

    addNotification({
      title: `Count: ${newCount}`,
      message: `You've clicked ${newCount} times`,
      type: newCount % 2 === 0 ? 'success' : 'info'
    })
  }

  return <button onClick={handleIncrement}>Count Up</button>
}
```

---

## Best Practices

### ✅ DO

```tsx
// Good: Clear, concise message
addNotification({
  title: 'Saved',
  message: 'Your progress has been saved',
  type: 'success'
})

// Good: Specific error message
addNotification({
  title: 'Connection Error',
  message: 'Failed to connect to server. Check your internet.',
  type: 'error'
})

// Good: Use in client components
'use client'
import { useNotifications } from '@/components/notifications-provider'

// Good: Handle errors gracefully
try {
  // action
  addNotification({ title: 'Success', message: '...', type: 'success' })
} catch (error) {
  addNotification({ title: 'Error', message: '...', type: 'error' })
}
```

### ❌ DON'T

```tsx
// Bad: Using in server component
// This will error! Notifications only work in client components

// Bad: Vague message
addNotification({
  title: 'Error',
  message: 'Something went wrong', // Too vague!
  type: 'error'
})

// Bad: Too much text
addNotification({
  title: 'Very Long Title That Exceeds Recommended Length',
  message: 'This is a very long message that contains way too much information and will be hard to read in the notification center. Please keep messages concise.',
  type: 'info'
})

// Bad: Showing too many notifications
for (let i = 0; i < 100; i++) {
  addNotification({
    title: `Message ${i}`,
    message: 'Too many at once!',
    type: 'info'
  })
}
```

---

## Troubleshooting

### Issue: "useNotifications must be used within NotificationsProvider"
**Cause**: Using the hook outside of the provider scope

**Solution**:
```tsx
// ❌ Wrong - using in a page/component NOT inside AuthProvider
export default function Page() {
  const { addNotification } = useNotifications() // Error!
}

// ✅ Correct - component is inside AuthProvider
// (All your pages are wrapped by AuthProvider in layout.tsx)
'use client'
export function MyComponent() {
  const { addNotification } = useNotifications() // Works!
}
```

### Issue: Notifications appear but don't persist
**Cause**: Notifications are stored in memory, not database

**Solution**: This is by design. If you need persistence:
1. Save to database on notification creation
2. Load on page load
3. Or use a toast notification library for temporary messages

### Issue: "add notifications" is a server component
**Cause**: Notifications only work in client components

**Solution**:
```tsx
// ❌ Wrong - server component
export default async function Page() {
  const { addNotification } = useNotifications()
}

// ✅ Correct - client component
'use client'
export function PageContent() {
  const { addNotification } = useNotifications()
}
```

### Issue: Notifications not showing up
**Cause**: NotificationsProvider might not be in the component tree

**Solution**:
1. Check `/components/auth-provider.tsx`
2. Verify NotificationsProvider wraps children
3. Check console for errors
4. Verify you're using `'use client'` directive

---

## Integration with Other Features

### With Authentication
```tsx
'use client'

import { useAuth } from '@/components/auth-provider'
import { useNotifications } from '@/components/notifications-provider'
import { useEffect } from 'react'

export function WelcomeNotification() {
  const { user } = useAuth()
  const { addNotification } = useNotifications()

  useEffect(() => {
    if (user) {
      addNotification({
        title: `Welcome, ${user.displayName}!`,
        message: 'You are now signed in',
        type: 'success'
      })
    }
  }, [user, addNotification])

  return null
}
```

### With Tour
```tsx
'use client'

import { useTour } from '@/components/tour-provider'
import { useNotifications } from '@/components/notifications-provider'

export function TourNotifier() {
  const { startTour } = useTour()
  const { addNotification } = useNotifications()

  const handleStartTour = () => {
    addNotification({
      title: 'Starting guided tour...',
      message: 'You can skip at any time',
      type: 'info'
    })
    startTour()
  }

  return <button onClick={handleStartTour}>Take Tour</button>
}
```

---

## Performance Tips

### Avoid Too Many Notifications
```tsx
// ❌ Don't spam notifications
for (let i = 0; i < 50; i++) {
  addNotification({ /* ... */ })
}

// ✅ Do batch or use intervals
setTimeout(() => {
  addNotification({ title: 'Status', message: 'Processing complete', type: 'success' })
}, 2000)
```

### Use useCallback for Optimization
```tsx
'use client'

import { useCallback } from 'react'
import { useNotifications } from '@/components/notifications-provider'

export function OptimizedList() {
  const { addNotification } = useNotifications()

  const handleItemClick = useCallback((item: Item) => {
    addNotification({
      title: item.name,
      message: 'Item selected',
      type: 'info'
    })
  }, [addNotification])

  return <ItemList onItemClick={handleItemClick} />
}
```

---

## Testing Notifications

### Manual Testing
1. Click bell icon to verify it appears
2. Trigger a notification from your code
3. Verify it shows in dropdown
4. Click to mark as read
5. Click X to dismiss
6. Refresh page (should be cleared)

### Automated Testing Example
```tsx
import { render, screen } from '@testing-library/react'
import { NotificationsProvider } from '@/components/notifications-provider'
import { TestComponent } from './test-component'

test('notification appears when triggered', () => {
  render(
    <NotificationsProvider>
      <TestComponent />
    </NotificationsProvider>
  )

  // Trigger notification
  const button = screen.getByRole('button')
  button.click()

  // Verify notification appears
  expect(screen.getByText('Success!')).toBeInTheDocument()
})
```

---

## Summary

**Notifications are easy to use:**
1. Import the hook
2. Call `addNotification()`
3. Done!

They work with authentication, tours, and all your other features seamlessly.

For more help, check:
- QUICK_START.md
- FEATURES_GUIDE.md
- Code examples in `/lib/notification-examples.ts`

---

**Happy notifying! 🚀**
