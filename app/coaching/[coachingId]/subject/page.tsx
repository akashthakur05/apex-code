import { ProtectedLayout } from '@/components/protected-layout'
import SubjectSelection from '@/components/subject-selection'
import { notFound, redirect } from 'next/navigation'
import { isMiniMockSource, getSubjectSources } from '@/lib/source-utils'

interface Props {
  params: Promise<{ coachingId: string }>
}

async function loadCoachingData() {
  const data = await import('@/lib/data.json')
  return data.default ?? data
}

export async function generateStaticParams() {
  const data = await loadCoachingData() as any
  
  // Generate params for minimock sources only
  return data
    .filter((coaching: any) => coaching.type === 'minimock' && coaching.subjectSources)
    .map((coaching: any) => ({
      coachingId: coaching.id,
    }))
}

export async function generateMetadata({ params }: Props) {
  const { coachingId } = await params
  const coachingInstitutes = await loadCoachingData() as any
  const coaching = coachingInstitutes.find((c: any) => c.id === coachingId)

  return {
    title: `${coaching?.name ?? 'Coaching'} - Select Subject`,
    description: `Choose a subject to view MiniMock tests from ${coaching?.name ?? 'coaching institute'}`,
  }
}

export default async function SubjectIndexPage({ params }: Props) {
  const { coachingId } = await params
  const coachingInstitutes = await loadCoachingData() as any
  const coaching = coachingInstitutes.find((c: any) => c.id === coachingId)

  if (!coaching || !coachingId) {
    redirect('/')
  }

  // Only allow access if this is a minimock source
  if (!isMiniMockSource(coaching)) {
    redirect(`/coaching/${coachingId}`)
  }

  const subjects = getSubjectSources(coaching)

  return (
    <ProtectedLayout>
      <SubjectSelection coaching={coaching} subjects={subjects} coachingId={coachingId} />
    </ProtectedLayout>
  )
}
