'use client'

import { useTour } from './tour-provider'
import { Button } from '@/components/ui/button'
import { HelpCircle } from 'lucide-react'

export function HelpButton() {
  const { startTour } = useTour()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => startTour()}
      title="Start guided tour"
      className="gap-2"
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  )
}
