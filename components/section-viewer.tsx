'use client'

import Link from "next/link"
import { sectionNameMap, coachingInstitutes } from '@/lib/mock-data'
import { ChevronLeft, ChevronRight, Lightbulb, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import HTMLRenderer from './html-renderer'
import { Card } from './ui/card'
import SolutionModal from './solution-modal'
import { useExamKeyboard } from "@/hooks/useExamKeyboard"

interface Props {
  coachingId: string
  sectionId: string
  questionlist: any[]
}

interface QuickModeConfig {
  enabled: boolean
  autoNextEnabled: boolean
  autoNextDelay: number // in milliseconds
  soundEnabled: boolean
  vibrationEnabled: boolean
}

interface SessionScore {
  correct: number
  incorrect: number
}

const keyToOption = (key: string): number | null => {
  switch (key.toLowerCase()) {
    case 'a':
    case '1':
      return 1
    case 'b':
    case '2':
      return 2
    case 'c':
    case '3':
      return 3
    case 'd':
    case '4':
      return 4
    default:
      return null
  }
}

const playSound = (type: 'correct' | 'incorrect') => {
  // Create audio context for sound feedback
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  if (type === 'correct') {
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.15)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.15)
  } else {
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2)
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  }
}

const triggerVibration = (pattern: number | number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

export default function SectionViewer({ coachingId, sectionId, questionlist }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [quickModeConfig, setQuickModeConfig] = useState<QuickModeConfig>({
    enabled: false,
    autoNextEnabled: true,
    autoNextDelay: 1500,
    soundEnabled: true,
    vibrationEnabled: true,
  })
  const [sessionScore, setSessionScore] = useState<SessionScore>({
    correct: 0,
    incorrect: 0,
  })
  const [showQuickModeSettings, setShowQuickModeSettings] = useState(false)

  // Initialize question from query parameter on mount
  useEffect(() => {
    setMounted(true)
    const questionParam = searchParams.get('question')
    if (questionParam) {
      const questionIndex = parseInt(questionParam) - 1 // Convert 1-indexed to 0-indexed
      if (questionIndex >= 0 && questionIndex < questionlist.length) {
        setCurrentIndex(questionIndex)
      }
    }
  }, [searchParams, questionlist.length])

  const totalQuestions = questionlist.length
  const currentQuestion = questionlist[currentIndex]

  const sectionName = sectionNameMap[sectionId] || `Section ${sectionId}`
  const coaching = coachingInstitutes.find(c => c.id === coachingId)

  // Update URL when question index changes
  const updateUrl = (index: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('question', String(index + 1)) // Convert 0-indexed to 1-indexed
    router.push(`?${params.toString()}`)
  }

const handleNext = () => {
  setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1))
  setSelectedOption(null)
}

const handlePrev = () => {
  setCurrentIndex(prev => Math.max(prev - 1, 0))
  setSelectedOption(null)
}

useEffect(() => {
  updateUrl(currentIndex)
}, [currentIndex])

// Auto-next effect for quick mode
useEffect(() => {
  if (!quickModeConfig.enabled || !quickModeConfig.autoNextEnabled || selectedOption === null) {
    return
  }

  const timer = setTimeout(() => {
    handleNext()
  }, quickModeConfig.autoNextDelay)

  return () => clearTimeout(timer)
}, [selectedOption, quickModeConfig.enabled, quickModeConfig.autoNextEnabled, quickModeConfig.autoNextDelay, currentIndex, totalQuestions])



  const handleOptionClick = (opt: number) => {
    if (selectedOption === null) {
      setSelectedOption(opt)
      
      // Update score in quick mode
      if (quickModeConfig.enabled) {
        const isCorrect = currentQuestion.answer === String(opt)
        setSessionScore(prev => ({
          correct: prev.correct + (isCorrect ? 1 : 0),
          incorrect: prev.incorrect + (isCorrect ? 0 : 1),
        }))

        // Provide feedback
        if (quickModeConfig.soundEnabled) {
          playSound(isCorrect ? 'correct' : 'incorrect')
        }
        if (quickModeConfig.vibrationEnabled) {
          triggerVibration(isCorrect ? 100 : [100, 50, 100])
        }
      }
    }
  }
  useExamKeyboard({
  onNext: handleNext,
  onPrev: handlePrev,
  onSelectOption: handleOptionClick,
  isOptionLocked: selectedOption !== null,
})

  return (
    <main className="min-h-screen bg-background">
      {/* HEADER */}
      <div className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href={`/coaching/${coachingId}`}
            className="inline-flex items-center gap-2 text-primary hover:underline mb-3"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to {coaching?.name} Tests
          </Link>

          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold">{sectionName}</h1>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>
                  Question {currentIndex + 1} / {totalQuestions}
                </span>
                <span>{coaching?.name}</span>
              </div>
            </div>
            
            {/* Quick Mode Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuickModeConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  quickModeConfig.enabled ? 'bg-primary' : 'bg-muted'
                }`}
                aria-label="Toggle quick mode"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    quickModeConfig.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm font-medium whitespace-nowrap">Quick Mode</span>
              {quickModeConfig.enabled && (
                <button
                  type="button"
                  onClick={() => setShowQuickModeSettings(!showQuickModeSettings)}
                  className="p-1.5 rounded-lg bg-muted hover:bg-muted/80"
                  aria-label="Quick mode settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Mode Settings Panel */}
          {quickModeConfig.enabled && showQuickModeSettings && (
            <div className="mt-4 p-4 rounded-lg bg-muted border border-border space-y-4">
              <h3 className="font-semibold text-sm">Quick Mode Settings</h3>
              
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickModeConfig.autoNextEnabled}
                    onChange={(e) => setQuickModeConfig(prev => ({
                      ...prev,
                      autoNextEnabled: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Auto-next after selection</span>
                </label>

                {quickModeConfig.autoNextEnabled && (
                  <div className="ml-7 flex items-center gap-3">
                    <label className="text-sm text-muted-foreground">Delay:</label>
                    <input
                      type="range"
                      min="500"
                      max="3000"
                      step="250"
                      value={quickModeConfig.autoNextDelay}
                      onChange={(e) => setQuickModeConfig(prev => ({
                        ...prev,
                        autoNextDelay: parseInt(e.target.value)
                      }))}
                      className="flex-1 max-w-xs"
                    />
                    <span className="text-sm text-muted-foreground min-w-fit">
                      {quickModeConfig.autoNextDelay}ms
                    </span>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickModeConfig.soundEnabled}
                    onChange={(e) => setQuickModeConfig(prev => ({
                      ...prev,
                      soundEnabled: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">🔊 Sound feedback</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quickModeConfig.vibrationEnabled}
                    onChange={(e) => setQuickModeConfig(prev => ({
                      ...prev,
                      vibrationEnabled: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">📳 Vibration feedback</span>
                </label>
              </div>
            </div>
          )}

          {/* Score Display in Quick Mode */}
          {quickModeConfig.enabled && (
            <div className="mt-4 flex gap-4 text-sm">
              <div className="px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-medium">
                ✓ Correct: {sessionScore.correct}
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 font-medium">
                ✗ Incorrect: {sessionScore.incorrect}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QUESTION */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-28 md:pb-8">
        <Card className="p-6 md:p-8">
          {/* QUESTION HEADER WITH SOLUTION BUTTON */}
          <div className="mb-8 flex gap-4 items-start justify-between">
            <div className="flex gap-4 flex-1">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                {currentIndex + 1}
              </div>
              <div className="flex-1">
                <HTMLRenderer html={currentQuestion.question} />
              </div>
            </div>
            {mounted && currentQuestion.solution_text && (
              <button
                onClick={() => setShowSolution(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition whitespace-nowrap ml-4"
              >
                <Lightbulb className="w-4 h-4" />
                Solution
              </button>
            )}
          </div>

          {/* OPTIONS */}
          <div className="space-y-3">
            {[1, 2, 3, 4].map((opt) => {
              const optionKey = `option_${opt}`
              const optionText = currentQuestion[optionKey]
              const isCorrect = currentQuestion.answer === String(opt)
              const isSelected = selectedOption === opt
              const revealCorrect =
                selectedOption !== null && selectedOption !== Number(currentQuestion.answer)

              let borderClass = 'border-border'
              let textClass = ''

              if (selectedOption !== null) {
                if (isSelected && !isCorrect) {
                  borderClass = 'border-red-500 bg-red-50 dark:bg-red-950'
                  textClass = 'text-red-600'
                } else if ((isCorrect && revealCorrect) || (isCorrect && isSelected)) {
                  borderClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                  textClass = 'text-green-600'
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  disabled={selectedOption !== null}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${borderClass}`}
                >
                  <div className="flex gap-3">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center font-semibold ${textClass}`}>
                      {String.fromCharCode(64 + opt)}
                    </div>
                    <div className={`flex-1 ${textClass}`}>
                      <HTMLRenderer html={optionText} />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t text-sm text-muted-foreground">
            Marks: +{currentQuestion.positive_marks} / {currentQuestion.negative_marks}
          </div>
        </Card>

        {/* BOTTOM NAV (MOBILE + DESKTOP) */}
        <div className="fixed md:static bottom-0 left-0 right-0 bg-card border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-3 justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === totalQuestions - 1}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border hover:bg-muted disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SOLUTION MODAL */}
      {mounted && (
        <SolutionModal
          question={currentQuestion}
          isOpen={showSolution}
          onClose={() => setShowSolution(false)}
        />
      )}
    </main>
  )
}
