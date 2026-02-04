'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth-provider';

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Sign-in error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md p-8 shadow-lg">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access MCQ test series and track your progress
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-base"
            size="lg"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Demo credentials: any email/password combination works
        </p>
      </div>
    </Card>
  );
}
