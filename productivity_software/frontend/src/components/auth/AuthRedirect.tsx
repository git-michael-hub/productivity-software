'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

// Define the auth paths that should redirect to dashboard if user is already logged in
const AUTH_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password'
];

/**
 * Redirects authenticated users away from auth pages to the dashboard
 * This component should be included in the layout of auth-related pages
 */
export default function AuthRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect after auth state is loaded and if user is authenticated
    if (!loading && isAuthenticated) {
      // Check if the current path should redirect to dashboard
      const shouldRedirect = AUTH_PATHS.some(path => pathname === path || pathname === path + '/');
      
      if (shouldRedirect) {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  // This component doesn't render anything, it just handles redirection
  return null;
} 