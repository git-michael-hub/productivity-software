'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Validation schema for login
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

export default function Login() {
  const router = useRouter();
  const { login, error, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Log In</h2>

              {error && (
                <Alert 
                  variant="danger" 
                  onClose={clearError} 
                  dismissible
                >
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={{
                  email: '',
                  password: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && !!errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-flex justify-content-end mb-4">
                      <Link href="/auth/forgot-password" className="text-decoration-none">
                        Forgot password?
                      </Link>
                    </div>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isSubmitting}
                        className="py-2"
                      >
                        {isSubmitting ? 'Logging in...' : 'Log In'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>

              <div className="text-center mt-4">
                Don't have an account? <Link href="/auth/register">Register</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 