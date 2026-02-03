/**
 * Example usage of notifications in your app
 * 
 * Import useNotifications from '@/components/notifications-provider'
 * then use it in any client component
 */

// Example 1: Basic notification
// const { addNotification } = useNotifications()
// addNotification({
//   title: 'Success!',
//   message: 'Your test has been submitted',
//   type: 'success'
// })

// Example 2: Error notification
// addNotification({
//   title: 'Error',
//   message: 'Failed to save progress. Please try again.',
//   type: 'error'
// })

// Example 3: Info notification
// addNotification({
//   title: 'Update Available',
//   message: 'Version 4.2.0 is now available with new features!',
//   type: 'info'
// })

// Example 4: Warning notification
// addNotification({
//   title: 'Warning',
//   message: 'Your session will expire in 5 minutes',
//   type: 'warning'
// })

export const notificationExamples = {
  success: {
    title: 'Success!',
    message: 'Operation completed successfully',
    type: 'success' as const
  },
  error: {
    title: 'Error',
    message: 'Something went wrong',
    type: 'error' as const
  },
  info: {
    title: 'Information',
    message: 'Here\'s some useful information',
    type: 'info' as const
  },
  warning: {
    title: 'Warning',
    message: 'Please note this important message',
    type: 'warning' as const
  }
}
