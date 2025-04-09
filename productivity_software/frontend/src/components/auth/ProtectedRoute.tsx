'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects routes that require authentication
 * Redirects unauthenticated users to the login page
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect after auth state has been loaded
    if (!loading && !isAuthenticated) {
      // Store the current path to redirect back after login
      if (pathname) {
        sessionStorage.setItem('redirectAfterLogin', pathname);
      }
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  // Show nothing while loading authentication state
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
} 