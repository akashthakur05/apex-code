import fs from 'fs'
import path from 'path'
import TestProgressTracker from '@/components/test-progress-tracker'
import { CoachingInstitute } from '@/lib/types'
import { Suspense } from 'react'
import { ProtectedLayout } from '@/components/protected-layout'

export const metadata = {
  title: 'Test Completion Tracker - Apex Code',
  description: 'Track your test completion progress by section for each coaching institute',
}

async function loadCoachingData(): Promise<CoachingInstitute[]> {
  const filePath = path.join(process.cwd(), 'lib/data.json')
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return data
  } catch {
    return []
  }
}

export default async function ProgressPage() {
  const coachingInstitutes = await loadCoachingData()

  return (
    <ProtectedLayout>
    <main className="min-h-screen bg-background">
      <TestProgressTracker coachingInstitutes={coachingInstitutes} />
    </main>
    </ProtectedLayout>
  )
}
