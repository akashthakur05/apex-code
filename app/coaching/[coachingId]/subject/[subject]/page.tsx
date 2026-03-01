import { ProtectedLayout } from '@/components/protected-layout'
import TestList from '@/components/test-list'
import { notFound, redirect } from 'next/navigation'
import { isMiniMockSource, getSubjectSources, getTestsBySubject } from '@/lib/source-utils'

interface Props {
  params: Promise<{ coachingId: string; subject: string }>
}

async function loadCoachingData() {
  const data = await import('@/lib/data.json')
  return data.default ?? data
}

export async function generateStaticParams() {
  const data = await loadCoachingData() as any

  const params: Array<{ coachingId: string; subject: string }> = []

  data.forEach((coaching: any) => {
    if (isMiniMockSource(coaching)) {
      const subjects = getSubjectSources(coaching)
      subjects.forEach((subject: any) => {
        params.push({
          coachingId: String(coaching.id),
          subject: encodeURIComponent(subject.subject_id || subject.subject), // Ensure Next.js static engine pre-builds the encoded URI directly.
        })
      })
    }
  })

  // Next.js static export fails if a dynamic route returns an empty array.
  // We return a dummy fallback that will just 404 naturally.
  if (params.length === 0) {
    return [{ coachingId: "empty", subject: "empty" }]
  }

  return params
}

export async function generateMetadata({ params }: Props) {
  const { coachingId, subject } = await params
  const coachingInstitutes = await loadCoachingData() as any
  const coaching = coachingInstitutes.find((c: any) => c.id === coachingId)
  const decodedSubjectId = decodeURIComponent(subject)

  const subjects = getSubjectSources(coaching)
  const subjectObj = subjects.find(s => s.subject_id === decodedSubjectId || s.subject === decodedSubjectId)
  const displaySubjectName = subjectObj?.subject || decodedSubjectId

  return {
    title: `${coaching?.name ?? 'Coaching'} - ${displaySubjectName}`,
    description: `View MiniMock tests for ${displaySubjectName} from ${coaching?.name ?? 'coaching institute'}`,
  }
}

export default async function SubjectTestPage({ params }: Props) {
  const { coachingId, subject } = await params
  const coachingInstitutes = await loadCoachingData() as any
  const coaching = coachingInstitutes.find((c: any) => c.id === coachingId)
  const decodedSubjectId = decodeURIComponent(subject)

  if (!coaching || !coachingId) {
    redirect('/')
  }

  // Only allow access if this is a minimock source
  if (!isMiniMockSource(coaching)) {
    redirect(`/coaching/${coachingId}`)
  }

  // Verify the subject exists
  const subjects = getSubjectSources(coaching)
  const subjectObj = subjects.find(s => s.subject_id === decodedSubjectId || s.subject === decodedSubjectId)

  if (!subjectObj) {
    notFound()
  }

  const displaySubjectName = subjectObj.subject

  // Filter tests for this subject
  const testsForSubject = getTestsBySubject(coaching, decodedSubjectId)

  // Create a modified coaching object with only the relevant tests
  const coachingWithSubjectTests = {
    ...coaching,
    tests: testsForSubject,
  }

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-background">
        <TestList
          coaching={coachingWithSubjectTests}
          subject={displaySubjectName}
        />
      </main>
    </ProtectedLayout>
  )
}
