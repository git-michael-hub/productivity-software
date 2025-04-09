"use client";

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import Link from 'next/link';

// Validation schema for forgot password
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values: { email: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      await axios.post(`${apiUrl.replace(/\/+$/, '')}/auth/password/reset/`, {
        email: values.email
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Password reset request failed:', err);
      
      if (err.response) {
        // Handle different error responses
        if (err.response.status === 404) {
          setError('No user found with this email address.');
        } else if (err.response.status === 429) {
          setError('Too many requests. Please try again later.');
        } else if (err.response.status >= 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.response.data.detail || 'Failed to send password reset email. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
      setSubmitting(false); // Important: ensure Formik knows submission is complete
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={5}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Forgot Password</h2>
              
              {success ? (
                <Alert variant="success">
                  Password reset email sent. Please check your inbox and follow the instructions to reset your password.
                  <div className="mt-3 text-center">
                    <Link href="/auth/login" className="btn btn-primary">
                      Return to Login
                    </Link>
                  </div>
                </Alert>
              ) : (
                <>
                  <p className="text-center mb-4">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                  
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}
                  
                  <Formik
                    initialValues={{
                      email: '',
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
                        <Form.Group className="mb-4">
                          <Form.Label>Email</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && !!errors.email}
                            placeholder="Enter your email address"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                        
                        <div className="d-grid mb-3">
                          <Button
                            variant="primary"
                            type="submit"
                            disabled={isSubmitting}
                            className="py-2"
                          >
                            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                          </Button>
                        </div>
                        
                        <div className="text-center">
                          <Link href="/auth/login" className="text-decoration-none">
                            Back to Login
                          </Link>
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