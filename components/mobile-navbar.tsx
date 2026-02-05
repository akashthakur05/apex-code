'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useTour } from './tour-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HelpCircle, LogOut, TrendingUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

export function MobileNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const { startTour } = useTour();
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

  const userInitials = user?.email
    ?.substring(0, 2)
    .toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full w-10 h-10 p-0"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
            <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium truncate">{user?.displayName || user?.email}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <Link href="/saved-questions" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Saved Questions</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/progress" className="w-full">
          <DropdownMenuItem className="cursor-pointer">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span>Track Progress</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem 
          onClick={() => startTour()}
          className="cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          <span>Help & Guide</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          className="cursor-pointer text-red-600 dark:text-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span>{loading ? 'Signing out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
