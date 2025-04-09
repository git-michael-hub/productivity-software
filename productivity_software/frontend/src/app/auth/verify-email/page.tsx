'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { error, clearError } = useAuth();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4 text-center">
              <h2 className="mb-4">Verify Your Email</h2>
              
              {error && (
                <Alert variant="danger" onClose={clearError} dismissible>
                  {error}
                </Alert>
              )}
              
              <Alert variant="info">
                <p className="mb-0">
                  We've sent a verification link to your email address.
                  Please check your inbox and click the link to verify your account.
                </p>
              </Alert>

              <p className="mt-4 mb-0">
                Redirecting to login page in {countdown} seconds...
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 