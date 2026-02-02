'use client'

import { useState, useMemo } from 'react'
import { CoachingInstitute } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
import { ChevronLeft, RotateCcw, CheckSquare, Check } from 'lucide-react'
import Link from 'next/link'

interface Props {
  coachingInstitutes: CoachingInstitute[]
}

interface Section {
  id: string
  name: string
}

export default function TestProgressTracker({ coachingInstitutes }: Props) {
  const [selectedCoachingId, setSelectedCoachingId] = useState<string>(
    coachingInstitutes[0]?.id || ''
  )
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)

  const selectedCoaching = coachingInstitutes.find(
    c => c.id === selectedCoachingId
  )

  // Build sections array from sectionMap
  const sections: Section[] = useMemo(() => {
    if (!selectedCoaching?.sectionMap) return []
    return Object.entries(selectedCoaching.sectionMap).map(([id, name]) => ({
      id,
      name,
    }))
  }, [selectedCoaching])

  const handleSectionToggle = (testId: string, sectionId: string) => {
    if (selectedCoachingId) {
      toggleSectionCompletion(selectedCoachingId, testId, sectionId)
    }
  }

  const handleMarkTestComplete = (testId: string) => {
    if (selectedCoachingId) {
      sections.forEach(section => {
        if (!isSectionCompleted(selectedCoachingId, testId, section.id)) {
          toggleSectionCompletion(selectedCoachingId, testId, section.id)
        }
      })
    }
  }

  const handleResetTest = (testId: string) => {
    if (selectedCoachingId) {
      sections.forEach(section => {
        if (isSectionCompleted(selectedCoachingId, testId, section.id)) {
          toggleSectionCompletion(selectedCoachingId, testId, section.id)
        }
      })
    }
  }

  // Calculate overall stats
  const stats = useMemo(() => {
    if (!selectedCoaching) {
      return { totalCells: 0, completedCells: 0, overallPercentage: 0, completedTests: 0 }
    }

    let completedCells = 0
    let completedTests = 0
    const totalCells = selectedCoaching.tests.length * sections.length

    selectedCoaching.tests.forEach(test => {
      let testCompleted = 0
      sections.forEach(section => {
        if (isSectionCompleted(selectedCoachingId, test.id, section.id)) {
          completedCells++
          testCompleted++
        }
      })
      if (testCompleted === sections.length && sections.length > 0) {
        completedTests++
      }
    })

    const overallPercentage = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0

    return { totalCells, completedCells, overallPercentage, completedTests }
  }, [selectedCoaching, selectedCoachingId, sections])

  if (!selectedCoaching || sections.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back Home
            </Link>
            <h1 className="text-3xl font-bold mb-4">Test Progress Tracker</h1>
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
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-muted-foreground text-center">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back Home
          </Link>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Test Progress Tracker</h1>
              <p className="text-sm text-muted-foreground">Click any cell to mark complete</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{stats.overallPercentage}%</div>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Grid Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-left font-semibold text-sm sticky left-0 bg-muted/50 z-20 min-w-48">
                    Test Name
                  </th>
                  {sections.map(section => (
                    <th key={section.id} className="px-3 py-3 text-center font-semibold text-xs min-w-24">
                      <div className="truncate">{section.name.substring(0, 12)}</div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center font-semibold text-sm sticky right-16 bg-muted/50 z-20 w-20">
                    %
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-sm sticky right-0 bg-muted/50 z-20 w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedCoaching.tests.map(test => {
                  const progress = getTestSectionProgress(
                    selectedCoachingId,
                    test.id,
                    sections.length
                  )
                  return (
                    <tr
                      key={test.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium sticky left-0 bg-background hover:bg-muted/30 z-10 text-foreground">
                        <div className="truncate max-w-xs">{test.title}</div>
                        <div className="text-xs text-muted-foreground">{test.questions} Q</div>
                      </td>

                      {sections.map(section => {
                        const isCompleted = isSectionCompleted(
                          selectedCoachingId,
                          test.id,
                          section.id
                        )
                        const cellKey = `${test.id}-${section.id}`

                        return (
                          <td
                            key={`${test.id}-${section.id}`}
                            className="px-3 py-3 text-center"
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            <button
                              onClick={() => handleSectionToggle(test.id, section.id)}
                              className={`mx-auto w-8 h-8 rounded border-2 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary ${
                                isCompleted
                                  ? 'bg-green-500 border-green-600'
                                  : hoveredCell === cellKey
                                    ? 'border-green-400 bg-green-50 dark:bg-green-950'
                                    : 'border-gray-300 dark:border-gray-600'
                              }`}
                              aria-label={`Toggle ${section.name} for ${test.title}`}
                            >
                              {isCompleted && <Check className="w-4 h-4 text-white" />}
                            </button>
                          </td>
                        )
                      })}

                      <td className="px-4 py-3 text-center sticky right-16 bg-background z-10">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          <span className="font-bold text-sm">{progress.percentage}%</span>
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center sticky right-0 bg-background z-10">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handleMarkTestComplete(test.id)}
                            disabled={progress.percentage === 100}
                            className="p-1.5 text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Mark all"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResetTest(test.id)}
                            disabled={progress.percentage === 0}
                            className="p-1.5 text-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Reset"
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Tests</div>
            <div className="text-2xl font-bold">{selectedCoaching.tests.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Sections per Test</div>
            <div className="text-2xl font-bold">{sections.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-xs text-muted-foreground mb-1">Completed</div>
            <div className="text-2xl font-bold">{stats.completedCells}/{stats.totalCells}</div>
          </Card>
          <Card className="p-4 bg-primary/10">
            <div className="text-xs text-muted-foreground mb-1">Overall Progress</div>
            <div className="text-2xl font-bold text-primary">{stats.overallPercentage}%</div>
          </Card>
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">Quick Tips:</p>
          <ul className="space-y-1 text-xs">
            <li>Click any cell to toggle completion instantly</li>
            <li>Use Mark All button to complete entire test at once</li>
            <li>Progress saves automatically to local storage</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
