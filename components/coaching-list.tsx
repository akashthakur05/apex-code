'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, HelpCircle, BookOpen } from "lucide-react"
import { HelpButton } from "./help-button"
import { LogoutButton } from "./logout-button"
import { MobileNavbar } from "./mobile-navbar"

type Institute = {
  id: string
  name: string
  logo?: string
  tests: any[]
}

export default function CoachingList() {
  const [data, setData] = useState<Institute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('data.json')
        if (!response.ok) throw new Error('Failed to load data')
        const jsonData = await response.json()
        console.log('Loaded coaching data:', jsonData)
        setData(jsonData)
      } catch (err) {
        console.error('Error loading coaching data:', err)
        setError('Failed to load coaching institutes')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold">Mock Test Series</h1>
            <div className="hidden md:flex items-center gap-2">
              <HelpButton />
              <Link href="/saved-questions">
                <Button variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Saved Questions
                </Button>
              </Link>
              <Link href="/progress">
                <Button variant="outline" className="gap-2" data-tour="track-progress">
                  <CheckCircle2 className="w-4 h-4" />
                  Track Progress
                </Button>
              </Link>
              <LogoutButton />
            </div>
            <div className="md:hidden">
              <MobileNavbar />
            </div>
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse MCQ questions from various coaching institutes
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading coaching institutes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((institute) => (
              <Link key={institute.id} href={`/coaching/${institute.id}`}>
                <Card className="h-full hover:scale-105 transition">
                  <div className="p-6 flex flex-col items-center gap-4 text-center">
                    <div className="relative w-24 h-24 bg-muted rounded-lg">
                      <Image
                        src={institute.logo || "/placeholder.svg"}
                        alt={institute.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h2 className="text-2xl font-bold">
                      {institute.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {institute.tests.length}  Test Series Available
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
