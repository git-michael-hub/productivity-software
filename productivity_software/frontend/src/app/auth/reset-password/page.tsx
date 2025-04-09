"use client";

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useDevTools } from '@/hooks/useDevTools';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  useDevTools();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (!tokenParam) {
      setErrorMessage('Invalid or missing reset token. Please request a new password reset link.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (values: { password: string; confirmPassword: string }, { setSubmitting, setErrors }: any) => {
    if (!token) {
      setErrorMessage('Invalid or missing reset token. Please request a new password reset link.');
      setSubmitting(false);
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');
    
    try {
      console.log('Making request to:', `${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset/confirm/`);
      console.log('Token:', token);
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset/confirm/`,
        {
          token: token,
          password: values.password,
          password_confirm: values.confirmPassword
        }
      );
      
      console.log('Password reset response:', response);
      setSubmitStatus('success');
    } catch (error: any) {
      console.error('Password reset error:', error);
      setSubmitStatus('error');
      
      if (error.response) {
        console.log('Error response:', error.response);
        // Handle different HTTP status codes
        if (error.response.status === 400) {
          // Field validation errors
          if (error.response.data && typeof error.response.data === 'object') {
            const fieldErrors: Record<string, string> = {};
            
            // Check if there are field-specific errors
            if (error.response.data.password) {
              fieldErrors.password = Array.isArray(error.response.data.password) 
                ? error.response.data.password[0] 
                : error.response.data.password;
            }
            
            if (error.response.data.token) {
              setErrorMessage(Array.isArray(error.response.data.token) 
                ? error.response.data.token[0] 
                : error.response.data.token);
            }
            
            // If we have field-specific errors, set them
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(fieldErrors);
            } else if (!error.response.data.token) {
              // Generic error message
              setErrorMessage('Unable to reset password. Please check your information and try again.');
            }
          } else {
            setErrorMessage('Invalid password reset attempt.');
          }
        } else if (error.response.status === 404) {
          setErrorMessage('Invalid or expired token. Please request a new password reset link.');
        } else if (error.response.status >= 500) {
          setErrorMessage('Server error. Please try again later.');
        } else {
          setErrorMessage('An error occurred. Please try again later.');
        }
      } else if (error.request) {
        setErrorMessage('No response from server. Please check your internet connection and try again.');
      } else {
        setErrorMessage('Request failed. Please try again later.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/auth/login');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Reset your password</h2>
              
              <p className="text-center text-muted mb-4">
                Enter your new password
              </p>

              {submitStatus === 'success' ? (
                <Alert variant="success">
                  <Alert.Heading>Password Reset Complete!</Alert.Heading>
                  <p>
                    Your password has been reset successfully!
                  </p>
                  <div className="d-flex justify-content-center mt-3">
                    <button 
                      className="btn btn-primary"
                      onClick={handleLoginClick}
                    >
                      Go to login
                    </button>
                  </div>
                </Alert>
              ) : token ? (
                <Formik
                  initialValues={{ password: '', confirmPassword: '' }}
                  validationSchema={validationSchema}
                  onSubmit={handleSubmit}
                >
                  {({
                    isSubmitting,
                    touched,
                    errors
                  }) => (
                    <Form>
                      {errorMessage && (
                        <Alert variant="danger" className="mb-4">
                          {errorMessage}
                        </Alert>
                      )}

                      <div className="mb-4">
                        <label htmlFor="password" className="form-label">New Password</label>
                        <Field
                          type="password"
                          name="password"
                          id="password"
                          className={`form-control ${touched.password && errors.password ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage 
                          name="password" 
                          component="div" 
                          className="invalid-feedback" 
                        />
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                        <Field
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className={`form-control ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                        />
                        <ErrorMessage 
                          name="confirmPassword" 
                          component="div" 
                          className="invalid-feedback" 
                        />
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn-primary py-2"
                        >
                          {submitStatus === 'submitting' ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </div>
                      
                      <div className="text-center mt-4">
                        <Link href="/auth/forgot-password" className="text-decoration-none">
                          Request a new reset link
                        </Link>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <Alert variant="danger">
                  <Alert.Heading>Invalid Reset Link</Alert.Heading>
                  <p>
                    {errorMessage || 'Invalid or missing reset token. Please request a new password reset link.'}
                  </p>
                  <div className="d-flex justify-content-center mt-3">
                    <Link href="/auth/forgot-password" className="btn btn-outline-primary">
                      Request a new reset link
                    </Link>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword; 