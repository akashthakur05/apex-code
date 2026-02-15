import { ProtectedLayout } from '@/components/protected-layout';
import QuestionViewer from '@/components/question-viewer'
import { TestNotReadyUI } from '@/components/TestNotReady';
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ coachingId: string; testId: string }>
}

/* ======================================================
   LOAD MASTER DATA (STATIC SAFE)
====================================================== */

async function loadCoachingData() {
  const data = await import('@/lib/data.json')
  return data.default ?? data
}

/* ======================================================
   STATIC PARAMS
====================================================== */

export async function generateStaticParams() {
  const coachingInstitutes = await loadCoachingData() as any;

  return coachingInstitutes.flatMap((coaching: any) =>
    coaching.tests.map((test: any) => ({
      coachingId: coaching.id,
      testId: test.id,
    }))
  )
}

/* ======================================================
   METADATA
====================================================== */

export async function generateMetadata({ params }: Props) {
  const { coachingId, testId } = await params
  const coachingInstitutes = await loadCoachingData() as any;

  const coaching = coachingInstitutes.filter(
    (c: any) => c.id === coachingId
  )[0]
  const test = coaching?.tests.filter(
    (t: any) => t.id === testId
  )[0]

  return {
    title: `${test?.title ?? 'Test'} - Questions`,
    description: 'Browse MCQ questions from this test',
  }
}

/* ======================================================
   LOAD QUESTIONS JSON
====================================================== */

async function loadQuestions(folderName: string, testId: string) {
  try {
    const data = await import(`@/data/${folderName}/${testId}.json`)
    return data.default ?? data
  } catch {
    console.error('❌ Questions JSON not found:', folderName, testId)
    return null
  }
}

/* ======================================================
   PAGE
====================================================== */

export default async function TestPage({ params }: Props) {
  const { coachingId, testId } = await params
  const coachingInstitutes = await loadCoachingData() as any;

  const coaching = coachingInstitutes.filter(
    (c: any) => c.id === coachingId
  )[0]
  const test = coaching?.tests.filter(
    (t: any) => t.id === testId
  )[0]

  if (!coaching || !test) {
    notFound()
  }

  const questions = await loadQuestions(
    coaching.folder_name,
    testId
  )

  console.log('Loaded questions for', coaching.name, test.title, questions ? '✅' : '❌')

  return (

    <ProtectedLayout>
      <main className="min-h-screen bg-background">
        {/* <ErrorBoundary errorComponent={TestNotReady}> */}
        {questions ? (
          <QuestionViewer
            test={test}
            coaching={coaching}
            preloadedQuestions={questions}
          />
        ) : (
          <TestNotReadyUI />
        )}
        {/* </ErrorBoundary> */}

      </main>
    </ProtectedLayout >
  )
}


