'use client'

/**
 * This is a demo component showing how to use the new features:
 * 1. Notifications
 * 2. Joyride Tour
 * 3. Firebase Authentication
 * 
 * Feel free to use this as a reference in your app!
 */

import { useNotifications } from '@/components/notifications-provider'
import { useTour } from '@/components/tour-provider'
import { useAuth } from '@/components/auth-provider'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Bell, HelpCircle, LogOut } from 'lucide-react'

export function FeaturesDemo() {
  const { addNotification } = useNotifications()
  const { startTour } = useTour()
  const { user } = useAuth()

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Feature Demo</h2>

      {/* Auth Info */}
      <div className="mb-6 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-900">
          Logged in as: <span className="font-semibold">{user?.displayName || user?.email}</span>
        </p>
      </div>

      {/* Notification Examples */}
      <div className="space-y-2 mb-6">
        <p className="font-semibold text-sm mb-2 flex items-center gap-2">
          <Bell className="w-4 h-4" /> Try Notifications:
        </p>
        <Button
          size="sm"
          className="w-full"
          onClick={() =>
            addNotification({
              title: 'Success!',
              message: 'This is a success notification',
              type: 'success',
            })
          }
        >
          Success
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() =>
            addNotification({
              title: 'Information',
              message: 'This is an info notification',
              type: 'info',
            })
          }
        >
          Info
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={() =>
            addNotification({
              title: 'Error',
              message: 'This is an error notification',
              type: 'error',
            })
          }
        >
          Error
        </Button>
      </div>

      {/* Tour */}
      <Button
        className="w-full mb-2"
        onClick={() => startTour()}
        variant="outline"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Start Tour
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        This demo shows the three main features: authentication, notifications, and guided tours.
      </p>
    </Card>
  )
}
