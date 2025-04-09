'use client';

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

// Validation schema for password reset
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  passwordConfirm: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match')
});

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [tokenValidationError, setTokenValidationError] = useState('');

  useEffect(() => {
    // Extract token and user_id from URL parameters
    const tokenParam = searchParams?.get('token');
    const userIdParam = searchParams?.get('user_id');
    
    if (tokenParam) {
      setToken(tokenParam);
      
      // Validate token when it's available
      validateToken(tokenParam, userIdParam || null);
    } else {
      setIsTokenValid(false);
      setTokenValidationError('No reset token found in URL. Please request a new password reset link.');
    }

    if (userIdParam) {
      setUserId(userIdParam);
    }
  }, [searchParams]);

  const validateToken = async (tokenValue: string, userIdValue: string | null) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      // This is a simplified approach - in a real app, you would have a dedicated endpoint to verify the token
      // For now, we'll assume the token is valid if it exists and has a reasonable format
      const tokenPattern = /^[a-zA-Z0-9\-_]+$/;
      if (!tokenPattern.test(tokenValue)) {
        setIsTokenValid(false);
        setTokenValidationError('Invalid token format. Please request a new password reset link.');
        return;
      }
      
      setIsTokenValid(true);
    } catch (err) {
      console.error('Token validation failed:', err);
      setIsTokenValid(false);
      setTokenValidationError('Could not validate reset token. Please request a new password reset link.');
    }
  };

  const handleSubmit = async (values: { password: string; passwordConfirm: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      
      const requestData: any = {
        token,
        password: values.password
      };
      
      // Include user_id in request if available
      if (userId) {
        requestData.user_id = userId;
      }
      
      await axios.post(`${apiUrl}/auth/password/reset/confirm/`, requestData);
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset failed:', err);
      
      if (err.response) {
        // Handle different error responses
        if (err.response.status === 400) {
          if (err.response.data.error === 'Invalid or expired token') {
            setError('Your password reset link has expired. Please request a new one.');
          } else if (err.response.data.password) {
            setError(err.response.data.password);
          } else {
            setError(err.response.data.detail || err.response.data.error || 'Failed to reset password. Please try again.');
          }
        } else if (err.response.status === 404) {
          setError('User not found. Please request a new password reset link.');
        } else if (err.response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else if (err.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false); // Important: ensure Formik knows submission is complete
    }
  };

  if (isTokenValid === null) {
    // Still validating token
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4 text-center">
                <h2 className="mb-4">Reset Password</h2>
                <p>Validating your reset token...</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isTokenValid === false) {
    // Token is invalid
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={5}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="text-center mb-4">Reset Password</h2>
                <Alert variant="danger">
                  {tokenValidationError || 'Invalid or expired password reset link.'}
                </Alert>
                <div className="text-center mt-3">
                  <Link href="/auth/forgot-password" className="btn btn-primary">
                    Request New Reset Link
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Reset Password</h2>
              
              {success ? (
                <Alert variant="success">
                  Your password has been successfully reset. You can now log in with your new password.
                  <div className="mt-3 text-center">
                    <Link href="/auth/login" className="btn btn-primary">
                      Go to Login
                    </Link>
                  </div>
                </Alert>
              ) : (
                <>
                  <p className="text-center mb-4">
                    Please enter your new password.
                  </p>
                  
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}
                  
                  <Formik
                    initialValues={{
                      password: '',
                      passwordConfirm: '',
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
                          <Form.Label>New Password</Form.Label>
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
                        
                        <Form.Group className="mb-4">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="passwordConfirm"
                            value={values.passwordConfirm}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.passwordConfirm && !!errors.passwordConfirm}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.passwordConfirm}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid mb-3">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="py-2"
                          >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 