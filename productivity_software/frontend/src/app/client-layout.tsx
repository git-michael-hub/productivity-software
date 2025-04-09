'use client';

import React, { useState, useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

// Loading UI component
const LoadingScreen = () => (
  <div className="d-flex justify-content-center align-items-center min-vh-100">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
    <div className="ms-3">Checking authentication...</div>
  </div>
);

// Define the auth paths that should redirect to dashboard if user is already logged in
const AUTH_PATHS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/forgot-password/reset'
];

// Define protected paths that require authentication
const PROTECTED_PATHS = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/settings',
  '/dashboard/tasks',
  '/dashboard/calendar',
  '/dashboard/documents'
];

// Client component that uses the auth hook properly (inside AuthProvider context)
const ClientContent = ({ children }: { children: React.ReactNode }) => {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [shouldRender, setShouldRender] = useState(false);
  
  // Handle redirects based on authentication status after loading completes
  useEffect(() => {
    if (!loading) {
      // If authenticated and on auth pages, redirect to dashboard
      if (isAuthenticated) {
        const shouldRedirectToDashboard = AUTH_PATHS.some(path => 
          pathname === path || pathname === path + '/'
        );
        
        if (shouldRedirectToDashboard) {
          router.replace('/dashboard');
          return;
        }
      } 
      // If not authenticated and on protected pages, redirect to login
      else {
        const isProtectedPath = PROTECTED_PATHS.some(path => 
          pathname?.startsWith(path)
        );
        
        if (isProtectedPath) {
          // Store the current path to redirect back after login
          if (pathname) {
            sessionStorage.setItem('redirectAfterLogin', pathname);
          }
          router.replace('/auth/login');
          return;
        }
      }
      
      // If we get here, no redirect is needed and auth check is complete
      setShouldRender(true);
    }
  }, [loading, isAuthenticated, pathname, router]);
  
  // Always show loading screen during authentication check
  if (loading || !shouldRender) {
    return <LoadingScreen />;
  }
  
  // Show content only after authentication check is complete
  return <>{children}</>;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ClientContent>
        {children}
      </ClientContent>
    </AuthProvider>
  );
} 