'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { getFirebaseAuth } = await import('@/lib/firebase')
      const { signOut } = await import('firebase/auth')
      const auth = await getFirebaseAuth()
      
      if (auth) {
        await signOut(auth);
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
