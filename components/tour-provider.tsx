'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS } from 'react-joyride'
import type { Step } from 'react-joyride'

interface TourContextType {
  startTour: (tourName?: string) => void
  endTour: () => void
  isTourActive: boolean
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error('useTour must be used within TourProvider')
  }
  return context
}

const tourSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Mock Test Series! 🎯 Let me show you around the new features.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '[data-tour="notification-bell"]',
    content: 'NEW: Check notifications here! See version updates, feature announcements, and important messages.',
    placement: 'left',
    disableBeacon: false,
  },
  {
    target: '[data-tour="track-progress"]',
    content: 'Track your test progress and performance metrics in one place.',
    placement: 'bottom',
    disableBeacon: false,
  },
  {
    target: 'body',
    content: 'You\'re all set! Start exploring and happy learning! 📚',
    placement: 'center',
    disableBeacon: true,
  },
]

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
  }, [])

  const startTour = (tourName?: string) => {
    setIsTourActive(true)
  }

  const endTour = () => {
    setIsTourActive(false)
    localStorage.setItem('tour-seen', 'true')
  }

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data

    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      endTour()
    }
  }

  return (
    <TourContext.Provider value={{ startTour, endTour, isTourActive }}>
      <Joyride
        steps={tourSteps}
        run={isTourActive}
        continuous
        scrollToFirstStep
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            arrowColor: '#fff',
            backgroundColor: '#fff',
            overlayColor: 'rgba(0, 0, 0, 0.5)',
            primaryColor: '#3b82f6',
            textColor: '#1f2937',
            width: 320,
            zIndex: 10000,
          },
        }}
      />
      {children}
    </TourContext.Provider>
  )
}
