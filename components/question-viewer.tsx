'use client'

import { TestTitle, CoachingInstitute, Question } from '@/lib/types'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Menu, X, Printer, Share2, Bookmark, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import SolutionModal from './solution-modal'
import HTMLRenderer from './html-renderer'
import SavedQuestionsModal from './saved-questions-modal'
import { getSectionName } from '@/lib/mock-data'
import { useState, useEffect, use } from 'react'
import * as htmlToImage from "html-to-image"
import { isBookmarked, addBookmark, removeBookmark, markTestComplete, unmarkTestComplete, isTestComplete as checkTestComplete } from '@/lib/bookmark-storage'
import { saveQuestion, isSavedQuestion, isSavedQuestionInCache, addToSavedQuestionsCache, removeFromSavedQuestionsCache } from '@/lib/firebase-saved-questions'
import { useToast } from '@/components/ui/use-toast'
// import { addBookmark, removeBookmark, isBookmarked, markTestComplete, unmarkTestComplete, isTestComplete as checkTestComplete } from '@/lib/bookmark-storage'
import { useExamKeyboard } from "@/hooks/useExamKeyboard"


interface Props {
  test: TestTitle
  coaching: CoachingInstitute
  preloadedQuestions?: Question[]
}

export default function QuestionViewer({ test, coaching, preloadedQuestions }: Props) {
  console.log('Preloaded Questions:', preloadedQuestions, coaching)
  const questions = preloadedQuestions || []
  const { toast } = useToast()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showSolution, setShowSolution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [printModalOpen, setPrintModalOpen] = useState(false)
  const [selectedSections, setSelectedSections] = useState<string[]>([])
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set())
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isTestComplete, setIsTestComplete] = useState(false)
  const [showSavedQuestionsModal, setShowSavedQuestionsModal] = useState(false)
  const [savedQuestionIds, setSavedQuestionIds] = useState<Set<string>>(new Set())
  const [savingQuestion, setSavingQuestion] = useState(false)

  const currentQuestion = questions[currentIndex]
  const currentSection = currentQuestion.section_id || 'general'

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setHeaderVisible(false)
      } else {
        // Scrolling up
        setHeaderVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Check if current question is bookmarked when navigating
  useEffect(() => {
    if (!currentQuestion) return

    const isCurrentBookmarked = isBookmarked(currentQuestion.id, coaching.id)
    setBookmarkedQuestions(prev => {
      const newSet = new Set(prev)
      if (isCurrentBookmarked) {
        newSet.add(currentQuestion.id)
      } else {
        newSet.delete(currentQuestion.id)
      }
      return newSet as any
    })
  }, [currentQuestion?.id, coaching.id])

  useEffect(() => {
    setIsTestComplete(checkTestComplete(coaching.id, test.id))
  }, [coaching.id, test.id])

  // Check if current question is saved when navigating
  useEffect(() => {
    let isMounted = true

    const checkCurrentQuestionSaved = async () => {
      if (!currentQuestion) return

      try {
        // Try cache first for performance
        const inCache = isSavedQuestionInCache(currentQuestion.id, coaching.id)
        if (inCache) {
          if (isMounted) {
            setSavedQuestionIds(prev => new Set(prev).add(currentQuestion.id))
          }
        } else {
          // Fall back to Firebase if not in cache
          const isSaved = await isSavedQuestion(currentQuestion.id, coaching.id)
          if (isMounted) {
            setSavedQuestionIds(prev => {
              const newSet = new Set(prev)
              if (isSaved) {
                newSet.add(currentQuestion.id)
              } else {
                newSet.delete(currentQuestion.id)
              }
              return newSet
            })
          }
        }
      } catch (error) {
        console.error('Error checking saved question:', error)
      }
    }

    checkCurrentQuestionSaved()

    return () => {
      isMounted = false
    }
  }, [currentQuestion?.id, coaching.id])


  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => {
        if (prev >= questions.length - 1) return prev
        return prev + 1
      })
      setSelectedOption(null)
      setShowSolution(false)
    }
  }

  const handlePrevQuestion = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
    setSelectedOption(null)
    setShowSolution(false)
  }

  const handleOptionClick = (optionNum: number) => {
    setSelectedOption(optionNum)
  }

  const handlePrint = () => {
    if (selectedSections.length === 0) {
      setSelectedSections(Array.from(groupedBySection.keys()))
    }
    setPrintModalOpen(true)
  }
  useExamKeyboard({
    onNext: handleNextQuestion,
    onPrev: handlePrevQuestion,
    onSelectOption: handleOptionClick,
    isOptionLocked: selectedOption !== null,
  })

  const handlePrintConfirm = () => {
    const printWindow = window.open('', '', 'width=800,height=600')
    if (!printWindow) return

    const questionsToPrint = questions.filter(q => {
      const sectionId = q.section_id || 'general'
      return selectedSections.includes(sectionId)
    })

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${test.title} - Questions</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: white; }
          .container { max-width: 900px; margin: 0 auto; padding: 20px; }
          .header { margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
          .header h1 { font-size: 28px; margin-bottom: 5px; }
          .header p { color: #666; font-size: 14px; }
          .section-title { font-size: 20px; font-weight: bold; margin-top: 30px; margin-bottom: 15px; padding: 10px; background: #f0f0f0; border-left: 4px solid #007bff; }
          .question-block { margin-bottom: 25px; page-break-inside: avoid; }
          .question-num { font-weight: bold; font-size: 16px; margin-bottom: 8px; }
          .question-text { margin-bottom: 12px; line-height: 1.5; }
          .options { margin-left: 20px; }
          .option { margin-bottom: 8px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
          .option-label { font-weight: bold; margin-right: 8px; }
          .marks { font-size: 12px; color: #666; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
          @media print {
            body { margin: 0; padding: 0; }
            .container { padding: 10px; }
            .question-block { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${test.title}</h1>
            <p>${coaching.name}</p>
            <p>Total Questions: ${questionsToPrint.length}</p>
          </div>
    `

    // Group questions by section in print output
    const printGroupedBySection = new Map<string, Question[]>()
    questionsToPrint.forEach((q) => {
      const sectionId = q.section_id || 'general'
      if (!printGroupedBySection.has(sectionId)) {
        printGroupedBySection.set(sectionId, [])
      }
      printGroupedBySection.get(sectionId)!.push(q)
    })

    Array.from(printGroupedBySection.entries()).forEach(([sectionId, sectionQuestions]) => {
      html += `<div class="section-title">${coaching.sectionMap[sectionId] || sectionId}</div>`

      sectionQuestions.forEach((q, idx) => {
        html += `
          <div class="question-block">
            <div class="question-num">Q${idx + 1}. ${q.question}</div>
            <div class="options">
              ${[1, 2, 3, 4].map((optNum) => {
          const optionKey = `option_${optNum}` as keyof Question
          const optionText = q[optionKey] as string
          const isCorrect = q.answer === String(optNum)
          return `<div class="option"><span class="option-label">${String.fromCharCode(64 + optNum)})</span> ${optionText} ${isCorrect ? '✓' : ''}</div>`
        }).join('')}
            </div>
            <div class="marks">Marks: +${q.positive_marks} / ${q.negative_marks}</div>
          </div>
        `
      })
    })

    html += `
        </div>
      </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
    setPrintModalOpen(false)
  }

  const toggleSection = (sectionId: string) => {
    setSelectedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  const handleBookmark = () => {
    const isCurrentlyBookmarked = bookmarkedQuestions.has(currentQuestion.id)

    if (isCurrentlyBookmarked) {
      removeBookmark(currentQuestion.id, coaching.id)
      setBookmarkedQuestions(prev => {
        const newSet = new Set(prev)
        newSet.delete(currentQuestion.id)
        return newSet
      })
    } else {
      addBookmark(currentQuestion, coaching.id, test.id)
      setBookmarkedQuestions(prev => new Set(prev).add(currentQuestion.id))
    }
  }



  // const handleShareHybrid = async () => {
  //   const element = document.getElementById("question-card")
  //   if (!element) return

  //   try {
  //     // Convert DOM → PNG
  //     const dataUrl = await htmlToImage.toPng(element, { quality: 1 })

  //     const response = await fetch(dataUrl)
  //     const blob = await response.blob()
  //     const file = new File([blob], "question.png", { type: "image/png" })

  //     const pageUrl = window.location.href

  //     // Extract plain text from HTML question
  //     const div = document.createElement("div")
  //     div.innerHTML = currentQuestion.question
  //     const cleanQuestion = div.innerText

  //     const fallbackText = `
  // ${cleanQuestion}

  // A) ${currentQuestion.option_1}
  // B) ${currentQuestion.option_2}
  // C) ${currentQuestion.option_3}
  // D) ${currentQuestion.option_4}

  // ${pageUrl}
  //     `.trim()

  //     // -----------------------------------------------------
  //     // 1️⃣ TRY DIRECT IMAGE SHARE (ANDROID ONLY)
  //     // -----------------------------------------------------
  //     if (
  //       navigator.share &&
  //       navigator.canShare &&
  //       navigator.canShare({ files: [file] })
  //     ) {
  //       try {
  //         await navigator.share({
  //           title: test.title,
  //           text: "Check this question:",
  //           files: [file],
  //         })
  //         return
  //       } catch (err) {
  //         console.warn("Direct image share failed, using fallback...")
  //       }
  //     }

  //     // -----------------------------------------------------
  //     // 2️⃣ OPEN WHATSAPP WITH TEXT + AUTOMATIC URL ENCODE
  //     // (Works on ALL Devices: Android, iOS, Desktop)
  //     // -----------------------------------------------------

  //     const whatsappMessage = encodeURIComponent(fallbackText)
  //     const waLink = `https://wa.me/?text=${whatsappMessage}`

  //     // Open whatsapp in new tab
  //     window.open(waLink, "_blank")

  //     // Also auto-download image so user can attach it manually
  //     const link = document.createElement("a")
  //     link.href = dataUrl
  //     link.download = "question.png"
  //     link.click()

  //     return

  //   } catch (error) {
  //     console.error("Hybrid share failed:", error)
  //     alert("Unable to generate share preview.")
  //   }
  // }
  const getTestName = (testId: string) => {
    if (!coaching || !coaching.tests) {
      return testId
    }
    const test = coaching.tests.find((t: any) => String(t.id) === String(testId))
    return test?.title || testId
  }

  const handleShareImage = async () => {
    const element = document.getElementById("question-card")
    if (!element) return

    try {
      // Convert DOM → PNG
      const dataUrl = await htmlToImage.toPng(element, { quality: 1 })

      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], "question.png", { type: "image/png" })

      // Check if Web Share API supports files
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: test.title,
          text: "Check this question:",
        })
      } else {
        // Fallback: Download image
        const link = document.createElement("a")
        link.href = dataUrl
        link.download = "question.png"
        link.click()
        alert("Image downloaded — share it on WhatsApp.")
      }

    } catch (error) {
      console.error("Error sharing image:", error)
      alert("Failed to generate image")
    }
  }

  const handleShareHybrid = async () => {
    const element = document.getElementById("question-card")
    if (!element) return

    const pageUrl = window.location.href

    // Convert HTML → text
    const div = document.createElement("div")
    div.innerHTML = currentQuestion.question
    const cleanQuestion = div.innerText.trim()

    const fallbackText = `
${cleanQuestion}

A) ${currentQuestion.option_1}
B) ${currentQuestion.option_2}
C) ${currentQuestion.option_3}
D) ${currentQuestion.option_4}

${pageUrl}
  `.trim()

    try {
      const dataUrl = await htmlToImage.toPng(element, { quality: 1 })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], "question.png", { type: "image/png" })

      // --------------------------------------------------
      // 1️⃣ **FORCE TRY IMAGE SHARE EVEN IF canShare() FAILS**
      // --------------------------------------------------
      if (navigator.share) {
        try {
          await navigator.share({
            title: test.title,
            text: "Check this question:",
            files: [file] // force try
          })
          return // SUCCESS → Image shared!
        } catch (err) {
          console.warn("Image share failed → fallback")
        }
      }

      // --------------------------------------------------
      // 2️⃣ OPEN WHATSAPP WITH TEXT ONLY (always works)
      // --------------------------------------------------
      const waLink = `https://wa.me/?text=${encodeURIComponent(fallbackText)}`
      window.open(waLink, "_blank")

      // --------------------------------------------------
      // 3️⃣ DOWNLOAD IMAGE so user can attach it
      // --------------------------------------------------
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = "question.png"
      link.click()

    } catch (e) {
      console.error("Share hybrid error", e)
      alert("Share failed.")
    }
  }

  const handleShare = () => {
    const pageUrl = window.location.href

    // Use the raw HTML (question may contain markup/rich text)
    const htmlContent = `
    <div>
      ${currentQuestion.question}
      <br/><br/>
      <strong>A)</strong> ${currentQuestion.option_1}<br/>
      <strong>B)</strong> ${currentQuestion.option_2}<br/>
      <strong>C)</strong> ${currentQuestion.option_3}<br/>
      <strong>D)</strong> ${currentQuestion.option_4}
      <br/><br/>
      Link: <a href="${pageUrl}">${pageUrl}</a>
    </div>
  `

    // Convert HTML → plain text fallback (clipboard sharing)
    const tempElement = document.createElement("div")
    tempElement.innerHTML = htmlContent
    const plainText = tempElement.innerText + "\n\n" + pageUrl

    if (navigator.share) {
      // Many browsers don't support HTML share yet, so we send text + URL
      navigator.share({
        title: test.title,
        text: plainText,
        url: pageUrl
      }).catch(() => { })
    } else {
      navigator.clipboard.writeText(plainText)
      alert('Question + URL copied to clipboard!')
    }

    setShowShareMenu(false)
  }


  const handleCompleteTest = () => {
    if (isTestComplete) {
      // Unmark complete
      unmarkTestComplete(coaching.id, test.id)
      setIsTestComplete(false)
      alert('Test marked as incomplete!')
    } else {
      // Mark complete
      markTestComplete(coaching.id, test.id)
      setIsTestComplete(true)
      alert('Test marked as complete!')
    }
  }

  const handleSaveQuestion = async () => {
    try {
      setSavingQuestion(true)
      const isSaved = savedQuestionIds.has(currentQuestion.id)

      if (isSaved) {
        // Remove from Firebase and cache
        setSavedQuestionIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentQuestion.id)
          return newSet
        })
        removeFromSavedQuestionsCache(currentQuestion.id, coaching.id)
        toast({
          title: 'Removed',
          description: 'Question removed from saved',
        })
      } else {
        // Save to Firebase
        await saveQuestion(currentQuestion, coaching.id, test.id)
        setSavedQuestionIds(prev => new Set(prev).add(currentQuestion.id))

        // Add to cache
        addToSavedQuestionsCache({
          id: currentQuestion.id,
          userId: '',
          questionId: currentQuestion.id,
          coachingId: coaching.id,
          testId: test.id,
          question: currentQuestion.question,
          option_1: currentQuestion.option_1,
          option_2: currentQuestion.option_2,
          option_3: currentQuestion.option_3,
          option_4: currentQuestion.option_4,
          answer: currentQuestion.answer,
          section_id: currentQuestion.section_id,
          positive_marks: +currentQuestion.positive_marks,
          negative_marks: +currentQuestion.negative_marks,
          savedAt: { toMillis: () => Date.now() } as any,
        })

        toast({
          title: 'Success',
          description: 'Question saved successfully',
        })
      }
    } catch (error) {
      console.error('Error saving question:', error)
      toast({
        title: 'Error',
        description: 'Failed to save question',
        variant: 'destructive',
      })
    } finally {
      setSavingQuestion(false)
    }
  }

  // Group questions by section
  const groupedBySection = new Map<string, Question[]>()
  questions.forEach((q: Question) => {
    const sectionId = q.section_id || 'general'
    if (!groupedBySection.has(sectionId)) {
      groupedBySection.set(sectionId, [])
    }
    groupedBySection.get(sectionId)!.push(q)
  })

  const sectionArray = Array.from(groupedBySection.keys())

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={`fixed md:static inset-0 z-50 md:z-auto w-full md:w-64 bg-card border-r transform transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

        <div className="h-full md:h-screen overflow-y-auto p-4 flex flex-col pt-20 md:pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">Questions ({questions.length})</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-1 hover:bg-muted rounded"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 mb-4 space-y-4 overflow-y-auto">
            {sectionArray.map((section) => {
              const sectionQuestions = groupedBySection.get(section) || []
              const sectionName = coaching.sectionMap[section] || section

              return (
                <div key={section}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 px-2">
                    {sectionName}
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    {sectionQuestions.map((q, idx) => {
                      const globalIdx = questions.indexOf(q)
                      const qNum = globalIdx + 1
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentIndex(globalIdx)
                            setSelectedOption(null)
                            setShowSolution(false)
                            setSidebarOpen(false)
                          }}
                          className={`min-h-10 min-w-10 rounded font-medium transition-all flex items-center justify-center text-xs md:text-sm px-2 py-1 ${currentIndex === globalIdx
                            ? 'bg-primary text-primary-foreground ring-2 ring-primary'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                            }`}
                          title={`Question ${qNum}`}
                        >
                          <span className="truncate">{qNum}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={handlePrint}
            className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden bg-black/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className={`sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300 ${headerVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
          }`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href={`/coaching/${coaching.id}`} className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
              <ChevronLeft className="w-4 h-4" />
              Back to Tests
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">
              {test.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {coaching.name} • {questions.length} Total Questions
            </p>
          </div>
        </div>

        <div className={`sticky z-40 border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 overflow-x-auto transition-all duration-300 ${headerVisible ? 'top-16' : 'top-0'
          }`}>
          <div className="max-w-4xl mx-auto px-4 flex gap-2">
            {sectionArray.map((section) => {
              const sectionQCount = groupedBySection.get(section)?.length || 0
              const sectionName = coaching.sectionMap[section] || section
              const isActive = section === currentSection
              return (
                <button
                  key={section}
                  onClick={() => {
                    // Find first question in this section and navigate to it
                    const sectionQuestions = groupedBySection.get(section) || []
                    if (sectionQuestions.length > 0) {
                      const firstQIndex = questions.indexOf(sectionQuestions[0])
                      setCurrentIndex(firstQIndex)
                      setSelectedOption(null)
                      setShowSolution(false)
                    }
                  }}
                  className={`px-4 py-3 font-medium whitespace-nowrap text-sm border-b-2 transition-colors cursor-pointer hover:text-foreground ${isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                    }`}
                >
                  {sectionName} ({sectionQCount})
                </button>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
            {/* Question Counter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-muted-foreground mb-6">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="font-medium text-foreground">
                {coaching.sectionMap[currentSection] || currentSection}
              </span>
              <div>
                <div className="hidden md:flex justify-between mt-4">
                  <div className="max-w-4xl mx-auto flex gap-3 justify-between">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentIndex === 0}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      disabled={currentIndex === questions.length - 1}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <Card id='question-card' className="p-6 md:p-8 mb-8">
              {/* Question Text */}
                        <div className="mb-6 flex gap-2 items-start flex-wrap">
                    {/* Question Number Badge */}
                    <div className="min-w-7 min-h-7 md:min-w-8 md:min-h-8 px-1.5 md:px-2 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                      {currentIndex + 1}
                    </div>

                    {/* Test ID Badge - Compact on Mobile */}
                    {currentQuestion && currentQuestion.test_id && (
                      <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground whitespace-nowrap max-w-28 sm:max-w-32 truncate flex-shrink-0" title={getTestName(currentQuestion.test_id)}>
                        {getTestName(currentQuestion.test_id)}
                      </span>
                    )}
                  </div>

              <div className="mb-8">
                <div className="flex gap-4">
        
                  <div className="flex-1 min-w-0">
                    <HTMLRenderer html={currentQuestion.question} />
                  </div>
                </div>
              </div>

              {/* Options - Only highlight correct answer after user clicks wrong option */}
              <div className="space-y-3 mb-8">
                {[1, 2, 3, 4].map((optionNum) => {
                  const optionKey = `option_${optionNum}` as keyof Question
                  const optionText = currentQuestion[optionKey] as string
                  const isCorrect = currentQuestion.answer === String(optionNum)
                  const isSelected = selectedOption === optionNum
                  const showCorrectAnswer = selectedOption !== null && selectedOption !== parseInt(currentQuestion.answer)

                  // Determine styling
                  let bgClass = 'border-border hover:border-primary'
                  let textClass = ''

                  if (selectedOption === null) {
                    // No interaction yet - normal state
                    bgClass = 'border-border hover:border-primary'
                  } else if (isSelected && !isCorrect) {
                    // User clicked this wrong option
                    bgClass = 'border-red-500 bg-red-50 dark:bg-red-950'
                    textClass = 'text-red-600'
                  } else if (showCorrectAnswer && isCorrect) {
                    // Show correct answer after wrong selection
                    bgClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                    textClass = 'text-green-600'
                  } else if (selectedOption !== null && isSelected && isCorrect) {
                    // User clicked correct answer
                    bgClass = 'border-green-500 bg-green-50 dark:bg-green-950'
                    textClass = 'text-green-600'
                  }

                  return (
                    <button
                      key={optionNum}
                      onClick={() => handleOptionClick(optionNum)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${bgClass}`}
                      disabled={selectedOption !== null}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center font-semibold ${selectedOption === null
                          ? 'border-border'
                          : isSelected && !isCorrect
                            ? 'border-red-500 text-red-600'
                            : showCorrectAnswer && isCorrect
                              ? 'border-green-500 text-green-600'
                              : isSelected && isCorrect
                                ? 'border-green-500 text-green-600'
                                : 'border-border'
                          }`}>
                          {String.fromCharCode(64 + optionNum)}
                        </div>
                        <div className={`flex-1 min-w-0 ${textClass}`}>
                          <HTMLRenderer html={optionText} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Solution Button */}
              <button
                onClick={() => setShowSolution(true)}
                className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                View Solution
              </button>
            </Card>
            <div className="fixed bottom-0 left-0 right-0 md:static border-t bg-card p-4 md:border-t-0 md:mb-8">
              <div className="max-w-4xl mx-auto flex gap-3 justify-between">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIndex === 0}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={currentIndex === questions.length - 1}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bookmark and Share Buttons */}
            <div className="flex justify-between items-start mb-6 gap-4">
              <button
                onClick={() => setShowSavedQuestionsModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors text-sm font-medium"
                title="View saved questions"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">View Saved</span>
              </button>
              <div className="flex-1" />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveQuestion}
                  disabled={savingQuestion}
                  className={`p-2 rounded-lg transition-colors ${savedQuestionIds.has(currentQuestion.id)
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  title="Save question to Firebase"
                >
                  <BookOpen className="w-5 h-5" fill={savedQuestionIds.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${bookmarkedQuestions.has(currentQuestion.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                    }`}
                  title="Bookmark question"
                >
                  <Bookmark className="w-5 h-5" fill={bookmarkedQuestions.has(currentQuestion.id) ? 'currentColor' : 'none'} />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                    title="Share question"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-card border rounded-lg shadow-lg z-50">
                      <button
                        onClick={handleShareImage}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors"
                      >
                        Share
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Complete Test Button - Toggle */}
            <button
              onClick={handleCompleteTest}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${isTestComplete
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/90'
                }`}
            >
              {isTestComplete ? 'Unmark Test as Complete' : 'Mark Test as Complete'}
            </button>
          </div>
        </div>
      </div>

      {/* Solution Modal */}
      <SolutionModal
        question={currentQuestion}
        isOpen={showSolution}
        onClose={() => setShowSolution(false)}
      />

      {/* Saved Questions Modal */}
      <SavedQuestionsModal
        isOpen={showSavedQuestionsModal}
        onClose={() => setShowSavedQuestionsModal(false)}
      />

      {/* Print Modal */}
      {printModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-foreground">Select Sections to Print</h2>
            </div>
            <div className="p-6 space-y-3 max-h-64 overflow-y-auto">
              {sectionArray.map((section) => (
                <label key={section} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-muted rounded">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section)}
                    onChange={() => toggleSection(section)}
                    className="w-4 h-4"
                  />
                  <span className="text-foreground">
                    {coaching.sectionMap[section] || section} ({groupedBySection.get(section)?.length || 0} questions)
                  </span>
                </label>
              ))}
            </div>
            <div className="border-t p-4 flex gap-3 justify-end">
              <button
                onClick={() => setPrintModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintConfirm}
                disabled={selectedSections.length === 0}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Print PDF
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
