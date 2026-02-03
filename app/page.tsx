import CoachingList from '@/components/coaching-list'
import { ProtectedLayout } from '@/components/protected-layout'

export const metadata = {
  title: 'MCQ Test Series - Browse Questions',
  description: 'Browse MCQ questions from mock tests of various coaching institutes',
}

export default function Home() {
  return (
    <ProtectedLayout>
      <main className="min-h-screen bg-background">
        <CoachingList />
      </main>
    </ProtectedLayout>
  )
}
