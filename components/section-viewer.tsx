

'use client'
import Link from "next/link";
import {  sectionNameMap, coachingInstitutes } from '@/lib/mock-data'
import {  ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import HTMLRenderer from './html-renderer'
import { Card } from './ui/card'

interface Props {
    coachingId: string;
    sectionId: string
    questionlist:any[]
}
const QUESTIONS_PER_PAGE = 5
export default function  SectionViewer(props: Props) {
    const [coachingId, sectionId,questionlist] = [(props as any).coachingId, (props as any).sectionId, (props as any).questionlist]
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const [paginatedQuestions, setPaginatedQuestions] = useState([])

    useEffect(() => {
        setIsLoading(true)
        // Simulate async loading for better performance
        const timer = setTimeout(() => {
            const start = currentPage * QUESTIONS_PER_PAGE
            const end = start + QUESTIONS_PER_PAGE
            setPaginatedQuestions(questionlist.slice(start, end))
            setIsLoading(false)
        }, 100)

        return () => clearTimeout(timer)
    }, [currentPage, questionlist])

    const totalPages = Math.ceil(questionlist.length / QUESTIONS_PER_PAGE)
    const sectionName = sectionNameMap[sectionId] || `Section ${sectionId}`
    const coaching = coachingInstitutes.find((c) => c.id === coachingId)

    return (
        <main className="min-h-screen bg-background">
            <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <Link
                        href={`/coaching/${coachingId}`}
                        className="inline-flex items-center gap-2 text-primary hover:underline mb-4"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to {coaching?.name} Tests
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{sectionName}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {questionlist.length} Total Questions • Page {currentPage + 1} of {totalPages}
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="space-y-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-muted-foreground">Loading questions...</div>
                        </div>
                    ) : paginatedQuestions.length > 0 ? (
                        paginatedQuestions.map((q:any, idx) => (
                            <Card key={q.id} className="p-6">
                                <div className="mb-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                            {currentPage * QUESTIONS_PER_PAGE + idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <HTMLRenderer html={q.question} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map((optNum) => {
                                        const optionKey = `option_${optNum}` as keyof typeof q
                                        const optionText = q[optionKey] as string
                                        const isCorrect = q.answer === String(optNum)

                                        return (
                                            <div
                                                key={optNum}
                                                className={`p-4 rounded-lg border-2 flex gap-3 ${isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-border"
                                                    }`}
                                            >
                                                <div
                                                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center font-semibold ${isCorrect ? "border-green-500 text-green-600" : "border-border"
                                                        }`}
                                                >
                                                    {String.fromCharCode(64 + optNum)}
                                                </div>
                                                <div className={isCorrect ? "text-green-600" : ""}>
                                                    <HTMLRenderer html={optionText} />
                                                </div>
                                                {isCorrect && <span className="ml-auto text-green-600 font-semibold">✓</span>}
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                                    Marks: +{q.positive_marks} / {q.negative_marks}
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card className="p-8 text-center text-muted-foreground">
                            No questions found in this section for {coaching?.name}
                        </Card>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-8 pt-8 border-t">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <div className="text-sm text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
                        </div>

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
    return
}
