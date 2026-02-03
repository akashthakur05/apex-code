import { ProtectedLayout } from '@/components/protected-layout'
import TestList from '@/components/test-list'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: Promise<{ coachingId: string }>
}

/* ======================================================
   LOAD MASTER DATA (STATIC SAFE)
====================================================== */

async function loadCoachingData() {
  const data = await import('@/lib/data.json')
  // console.log(data,"---------------Akash")
  return data.default ?? data
}

/* ======================================================
   STATIC PARAMS
====================================================== */

export async function generateStaticParams() {
  const data = await loadCoachingData() as any;
  // console.log("----=========",data)

  return data.map((coaching: any) => ({

    coachingId: coaching.id,
  }))
}

/* ======================================================
   METADATA
====================================================== */

export async function generateMetadata({ params }: Props) {
  const { coachingId } = await params
  const coachingInstitutes = await loadCoachingData() as any;
  // console.log("----",coachingInstitutes.filter)
  const coaching = coachingInstitutes.filter(
    (c: any) => c.id === coachingId
  )[0]



  return {
    title: `${coaching?.name ?? 'Coaching'} - Test Series`,
    description: `Browse tests from ${coaching?.name ?? 'coaching institute'}`,
  }
}

/* ======================================================
   PAGE
====================================================== */

export default async function CoachingPage({ params }: Props) {
  const { coachingId } = await params
  const coachingInstitutes = await loadCoachingData() as any;

  const coaching = coachingInstitutes.find(
    (c: any) => c.id === coachingId
  )

  if (!coaching || !coachingId) {
    redirect('/')
  }

  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-background">
        <TestList coaching={coaching} />
      </main>
    </ProtectedLayout>
  )
}
