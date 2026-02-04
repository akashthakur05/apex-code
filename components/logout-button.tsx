'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
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
