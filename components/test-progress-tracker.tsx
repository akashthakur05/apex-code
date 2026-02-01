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
import { ChevronLeft, RotateCcw, CheckSquare } from 'lucide-react'
import Link from 'next/link'

interface Props {
  coachingInstitutes: CoachingInstitute[]
}

export default function TestProgressTracker({ coachingInstitutes }: Props) {
  const [selectedCoachingId, setSelectedCoachingId] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  useEffect(() => {
    if (coachingInstitutes.length > 0) {
      setSelectedCoachingId(coachingInstitutes[0].id)
    }
  }, [coachingInstitutes])

  const selectedCoaching = coachingInstitutes.find(
    c => c.id === selectedCoachingId
  )

  const handleSectionToggle = (testId: string, sectionId: string) => {
    if (selectedCoaching) {
      toggleSectionCompletion(selectedCoaching.id, testId, sectionId)
      setRefreshKey(prev => prev + 1)
    }
  }

  const handleMarkTestComplete = (testId: string) => {
    if (selectedCoaching) {
      const test = selectedCoaching.tests.find(t => t.id === testId)
      if (test && test.sections) {
        test.sections.forEach(section => {
          if (!isSectionCompleted(selectedCoaching.id, testId, section.id)) {
            toggleSectionCompletion(selectedCoaching.id, testId, section.id)
          }
        })
        setRefreshKey(prev => prev + 1)
      }
    }
  }

  const handleResetTest = (testId: string) => {
    if (selectedCoaching) {
      const test = selectedCoaching.tests.find(t => t.id === testId)
      if (test && test.sections) {
        test.sections.forEach(section => {
          if (isSectionCompleted(selectedCoaching.id, testId, section.id)) {
            toggleSectionCompletion(selectedCoaching.id, testId, section.id)
          }
        })
        setRefreshKey(prev => prev + 1)
      }
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
        <div className="max-w-6xl mx-auto">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Get all unique sections across all tests
  const allSections = Array.from(
    new Set(
      selectedCoaching.tests.flatMap(test =>
        (test.sections || []).map(s => s.id)
      )
    )
  ).sort()

  // Calculate overall progress
  const totalCells = selectedCoaching.tests.length * allSections.length
  let completedCells = 0
  selectedCoaching.tests.forEach(test => {
    allSections.forEach(section => {
      if (isSectionCompleted(selectedCoaching.id, test.id, section)) {
        completedCells++
      }
    })
  })
  const overallPercentage = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back Home
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Test Completion Tracker</h1>
              <p className="text-sm text-muted-foreground">Click cells to mark sections complete</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{overallPercentage}%</div>
              <p className="text-xs text-muted-foreground">Overall Progress</p>
            </div>
          </div>

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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Grid Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-10 w-48">
                    Test Name
                  </th>
                  {allSections.map(sectionId => (
                    <th key={sectionId} className="px-2 py-3 text-center font-semibold text-xs min-w-12">
                      <div className="font-medium">{getSectionName(sectionId).substring(0, 3)}</div>
                      <div className="text-xs text-muted-foreground">{getSectionName(sectionId).substring(0, 15)}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-sm sticky right-0 bg-muted/50 z-10 w-32">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm sticky right-0 bg-muted/50 z-10 w-24" style={{ right: '128px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedCoaching.tests.map((test, idx) => {
                  const progress = getTestSectionProgress(
                    selectedCoaching.id,
                    test.id,
                    allSections.length
                  )
                  return (
                    <tr
                      key={test.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-background hover:bg-muted/30 z-10 text-foreground">
                        <div className="truncate">{test.name}</div>
                        <div className="text-xs text-muted-foreground">{test.questions} Q</div>
                      </td>

                      {allSections.map(sectionId => {
                        const isCompleted = isSectionCompleted(selectedCoaching.id, test.id, sectionId)
                        const cellKey = `${test.id}-${sectionId}`

                        return (
                          <td
                            key={sectionId}
                            className="px-2 py-3 text-center"
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <button
                              onClick={() => handleSectionToggle(test.id, sectionId)}
                              className={`mx-auto p-2 rounded transition-all ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100'
                                  : hoveredCell === cellKey
                                    ? 'bg-muted text-muted-foreground'
                                    : 'bg-transparent text-muted-foreground'
                              } hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary`}
                              aria-label={`Toggle section ${sectionId} for ${test.name}`}
                            >
                              {isCompleted ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <div className="w-5 h-5 border-2 border-muted-foreground rounded"></div>
                              )}
                            </button>
                          </td>
                        )
                      })}

                      <td className="px-4 py-3 text-center sticky right-0 bg-background z-10">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-primary">{progress.percentage}%</div>
                          <Progress value={progress.percentage} className="h-1" />
                          <div className="text-xs text-muted-foreground">
                            {progress.completed}/{progress.total}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center sticky right-0 bg-background z-10" style={{ right: '128px' }}>
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleMarkTestComplete(test.id)}
                            disabled={progress.percentage === 100}
                            className="p-1 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Mark all sections complete"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetTest(test.id)}
                            disabled={progress.percentage === 0}
                            className="p-1 text-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Reset all sections"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Tests</div>
            <div className="text-2xl font-bold">{selectedCoaching.tests.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Sections</div>
            <div className="text-2xl font-bold">{allSections.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Completed Cells</div>
            <div className="text-2xl font-bold">{completedCells}/{totalCells}</div>
          </Card>
          <Card className="p-4 bg-primary/10">
            <div className="text-sm text-muted-foreground mb-1">Overall Progress</div>
            <div className="text-2xl font-bold text-primary">{overallPercentage}%</div>
          </Card>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">💡 Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>• Click any cell to toggle completion</li>
            <li>• Use the ✓ button to mark entire test as complete</li>
            <li>• Use the ↻ button to reset all sections in a test</li>
            <li>• Progress saves automatically to your browser</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
