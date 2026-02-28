'use client'

import { CoachingInstitute, SubjectSource } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronLeft, Book } from 'lucide-react'

interface SubjectSelectionProps {
  coaching: CoachingInstitute
  subjects: SubjectSource[]
  coachingId: string
}

export default function SubjectSelection({
  coaching,
  subjects,
  coachingId,
}: SubjectSelectionProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">{coaching.name}</h1>
          <p className="text-sm text-muted-foreground">
            Select a subject to explore MiniMock tests
          </p>
        </div>
      </div>

      {/* Subject Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {subjects.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No subjects available</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Link
                key={subject.subject}
                href={`/coaching/${coachingId}/subject/${encodeURIComponent(subject.subject)}`}
              >
                <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Book className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg line-clamp-2">{subject.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 flex-grow">
                    {subject.count && subject.count > 0
                      ? `${subject.count} test${subject.count !== 1 ? 's' : ''} available`
                      : 'No tests available'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      // The parent Link already handles navigation
                      e.preventDefault()
                    }}
                  >
                    Explore Tests
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
