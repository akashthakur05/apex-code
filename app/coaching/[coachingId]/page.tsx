import TestList from '@/components/test-list'
import { coachingInstitutes } from '@/lib/mock-data'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ coachingId: string }>
}

export async function generateStaticParams() {
  return coachingInstitutes.map((coaching) => ({
    coachingId: coaching.id,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { coachingId } = await params
  const coaching = coachingInstitutes.find(c => c.id === coachingId)
  
  return {
    title: `${coaching?.name || 'Coaching'} - Test Series`,
    description: `Browse tests from ${coaching?.name || 'coaching institute'}`,
  }
}

export default async function CoachingPage({ params }: Props) {
  const { coachingId } = await params
  const coaching = coachingInstitutes.find(c => +c.id === +coachingId)

  if (!coaching||!coachingId) {
    console.log(coaching,coachingId)
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-background">
      <TestList coaching={coaching} />
    </main>
  )
}
