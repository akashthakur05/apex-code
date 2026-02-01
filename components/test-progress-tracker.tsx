'use client'

import { useState, useEffect } from 'react'
import { CoachingInstitute, TestTitle } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  toggleSectionCompletion,
  isSectionCompleted,
  getTestSectionProgress,
} from '@/lib/bookmark-storage'
import { ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface Props {
  coachingInstitutes: CoachingInstitute[]
}

export default function TestProgressTracker({ coachingInstitutes }: Props) {
  const [selectedCoachingId, setSelectedCoachingId] = useState<string>('')
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set())
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (coachingInstitutes.length > 0) {
      setSelectedCoachingId(coachingInstitutes[0].id)
    }
  }, [coachingInstitutes])

  const selectedCoaching = coachingInstitutes.find(
    c => c.id === selectedCoachingId
  )

  const toggleTestExpand = (testId: string) => {
    setExpandedTests(prev => {
      const next = new Set(prev)
      if (next.has(testId)) {
        next.delete(testId)
      } else {
        next.add(testId)
      }
      return next
    })
  }

  const handleSectionToggle = (testId: string, sectionId: string) => {
    if (selectedCoaching) {
      toggleSectionCompletion(selectedCoaching.id, testId, sectionId)
      setRefreshKey(prev => prev + 1)
    }
  }

  const getSectionName = (sectionId: string): string => {
    if (selectedCoaching?.sectionMap) {
      return selectedCoaching.sectionMap[sectionId] || `Section ${sectionId}`
    }
    return `Section ${sectionId}`
  }

  if (!selectedCoaching) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back Home
          </Link>
          <h1 className="text-3xl font-bold mb-4">Test Completion Tracker</h1>
          
          {/* Coaching Selection */}
          <div className="flex items-center gap-3">
            <label className="font-medium text-foreground">Select Coaching:</label>
            <Select value={selectedCoachingId} onValueChange={setSelectedCoachingId}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {coachingInstitutes.map(coaching => (
                  <SelectItem key={coaching.id} value={coaching.id}>
                    {coaching.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {selectedCoaching.tests.map((test: TestTitle) => {
            const progress = getTestSectionProgress(
              selectedCoaching.id,
              test.id,
              Object.keys(selectedCoaching.sectionMap).length
            )
            const isExpanded = expandedTests.has(test.id)

            return (
              <Card key={test.id} className="overflow-hidden">
                {/* Test Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => toggleTestExpand(test.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {test.questions} Questions • {test.time} mins • {test.marks} marks
                        </p>
                      </div>
                    </div>
                    
                    {/* Completion Badge */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {progress.percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {progress.completed}/{progress.total}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress value={progress.percentage} className="h-2" />
                </div>

                {/* Sections List */}
                {isExpanded && (
                  <div className="border-t px-6 py-4 bg-muted/30">
                    <div className="space-y-3">
                      {Object.entries(selectedCoaching.sectionMap).map(
                        ([sectionId, sectionName]) => {
                          const isCompleted = isSectionCompleted(
                            selectedCoaching.id,
                            test.id,
                            sectionId
                          )

                          return (
                            <div
                              key={sectionId}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <Checkbox
                                id={`${test.id}-${sectionId}`}
                                checked={isCompleted}
                                onCheckedChange={() =>
                                  handleSectionToggle(test.id, sectionId)
                                }
                              />
                              <label
                                htmlFor={`${test.id}-${sectionId}`}
                                className={`flex-1 cursor-pointer font-medium ${
                                  isCompleted
                                    ? 'text-muted-foreground line-through'
                                    : 'text-foreground'
                                }`}
                              >
                                {sectionName}
                              </label>
                              {isCompleted && (
                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded">
                                  Done
                                </span>
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Summary */}
        <Card className="mt-8 p-6 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-4">Overall Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            {selectedCoaching.tests.map((test: TestTitle) => {
              const progress = getTestSectionProgress(
                selectedCoaching.id,
                test.id,
                Object.keys(selectedCoaching.sectionMap).length
              )
              return (
                <div key={test.id} className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {progress.percentage}%
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {test.title.split('(')[0].trim()}
                  </p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
