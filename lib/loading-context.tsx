'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isLoading: boolean
  message: string
  setLoading: (loading: boolean, message?: string) => void
  withLoading: <T,>(fn: () => Promise<T>, message?: string) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoadingState] = useState(false)
  const [message, setMessage] = useState('Loading...')

  const setLoading = useCallback((loading: boolean, message: string = 'Loading...') => {
    setIsLoadingState(loading)
    setMessage(message)
  }, [])

  const withLoading = useCallback(async <T,>(
    fn: () => Promise<T>,
    message: string = 'Loading...'
  ): Promise<T> => {
    try {
      setLoading(true, message)
      const result = await fn()
      return result
    } finally {
      setLoading(false)
    }
  }, [setLoading])

  return (
    <LoadingContext.Provider value={{ isLoading, message, setLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider')
  }
  return context
}
