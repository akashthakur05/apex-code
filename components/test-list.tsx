'use client'

import { useState, useEffect } from 'react'
import { CoachingInstitute } from '@/lib/types'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import SectionFilter from './section-filter'
import { isTestComplete } from '@/lib/bookmark-storage'

interface Props {
  coaching: CoachingInstitute
}

export default function TestList({ coaching }: Props) {
  const [completedTests, setCompletedTests] = useState<Set<string>>(new Set())

  useEffect(() => {
    const completed = new Set<string>()
    coaching.tests.forEach(test => {
      if (isTestComplete(coaching.id, test.id)) {
        completed.add(test.id)
      }
    })
    setCompletedTests(completed)
  }, [coaching.id, coaching.tests])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Coaching
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {coaching.name}
          </h1>
          <p className="text-muted-foreground mt-2">
            {coaching.tests.length} test series available
          </p>
        </div>
      </div>

      {/* Section Filter */}
      <SectionFilter coachingId={coaching.id} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coaching.tests.map((test) => (
            <Link
              key={test.id}
              href={`/coaching/${coaching.id}/test/${test.id}`}
            >
              <Card className={`h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105 p-6 relative ${
                completedTests.has(test.id) 
                  ? 'border-2 border-green-500 bg-green-50/50 dark:bg-green-950/20' 
                  : ''
              }`}>
                {/* Completed indicator */}
                {completedTests.has(test.id) && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
                <h2 className="text-xl font-bold text-foreground mb-4">
                  {test.title}
                </h2>
                <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Questions
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {test.questions}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Marks
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {test.marks}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-wide">
                      Time
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {test.time} min
                    </p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  View Questions
                </button>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
