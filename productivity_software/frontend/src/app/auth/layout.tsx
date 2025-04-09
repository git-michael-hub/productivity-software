import React from 'react';
import { Container } from 'react-bootstrap';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <Container>
        <div className="text-center mb-4 mt-5">
          <Link href="/" className="d-inline-block">
            <h3 className="fw-bold">Productivity Software</h3>
          </Link>
        </div>
        {children}
      </Container>
    </div>
  );
} 