import { Metadata } from 'next';
import LoginForm from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Login - MCQ Test Series',
  description: 'Sign in to access MCQ questions and track your progress',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginForm />
    </main>
  );
}
