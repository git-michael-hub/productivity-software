'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

// Organization type definition
interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string;
  contact_email: string;
  max_users: number;
  max_storage_gb: number;
  created_at: string;
  updated_at: string;
}

// Validation schema for the registration form
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  password_confirm: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  first_name: Yup.string()
    .required('First name is required'),
  last_name: Yup.string()
    .required('Last name is required'),
  phone_number: Yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number must be valid (E.164 format)')
});

export default function Register() {
  const router = useRouter();
  const { register, error, clearError } = useAuth();
  const [apiErrors, setApiErrors] = useState<string | null>(null);

  const handleSubmit = async (values: {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name: string;
    last_name: string;
    phone_number?: string;
  }) => {
    try {
      console.log('Form values before submission:', values);
      await register(values);
      router.push('/auth/verify-email');
    } catch (err: any) {
      // Error is handled by the auth context
      console.error('Registration failed:', err);
      if (err.response?.data) {
        const errorData = err.response.data;
        const errorMessage = Object.keys(errorData)
          .map(key => `${key}: ${Array.isArray(errorData[key]) ? errorData[key].join(', ') : errorData[key]}`)
          .join('; ');
        setApiErrors(errorMessage);
      }
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Create Your Account</h2>

              {(error || apiErrors) && (
                <Alert variant="danger" onClose={() => {
                  clearError();
                  setApiErrors(null);
                }} dismissible>
                  {error || apiErrors}
                </Alert>
              )}

              <Formik
                initialValues={{
                  email: '',
                  username: '',
                  password: '',
                  password_confirm: '',
                  first_name: '',
                  last_name: '',
                  phone_number: '',
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
                  isSubmitting,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={values.first_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.first_name && !!errors.first_name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.first_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={values.last_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.last_name && !!errors.last_name}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.last_name}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={values.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.username && !!errors.username}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.username}
                      </Form.Control.Feedback>
                    </Form.Group>

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
                      <Form.Label>Phone Number (optional)</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone_number"
                        value={values.phone_number}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.phone_number && !!errors.phone_number}
                        placeholder="+1234567890"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone_number}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Enter phone number in E.164 format (e.g., +1234567890)
                      </Form.Text>
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
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password_confirm"
                        value={values.password_confirm}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password_confirm && !!errors.password_confirm}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password_confirm}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={isSubmitting}
                        className="py-2"
                      >
                        {isSubmitting ? 'Registering...' : 'Register'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
              
              <div className="text-center mt-4">
                Already have an account? <Link href="/auth/login">Log in</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 