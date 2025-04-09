import '@testing-library/jest-dom';
import React, { ReactNode } from 'react';

// Extend jest matchers with jest-dom matchers
import { expect } from '@jest/globals';
import type { MatcherFunction } from 'expect';

// Set up mock storage
class LocalStorageMock {
  private store: { [key: string]: string } = {};

  clear() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

// Set up mock session storage
Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

Object.defineProperty(window, 'sessionStorage', {
  value: new LocalStorageMock(),
});

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  const mockLink = ({ children, ...props }: { children: any; href: string }) => {
    const a = document.createElement('a');
    Object.assign(a, props);
    a.textContent = children?.toString() || '';
    return a;
  };
  return mockLink;
});

// Setup environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000/api'; 