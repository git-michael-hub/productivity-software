'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={LoginSchema}
      onSubmit={async (values, { setSubmitting }) => {
        setError(null);
        try {
          await login(values.email, values.password);
          if (onSuccess) {
            onSuccess();
          }
        } catch (err: any) {
          setError(err.message || 'Failed to login. Please try again.');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, errors, touched }) => (
        <Form className="login-form">
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <Field
              type="email"
              name="email"
              className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
              id="email"
            />
            <ErrorMessage name="email" component="div" className="invalid-feedback" />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <Field
              type="password"
              name="password"
              className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
              id="password"
            />
            <ErrorMessage name="password" component="div" className="invalid-feedback" />
          </div>

          <div className="d-grid gap-2">
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Spinner animation="border" size="sm" /> : 'Login'}
            </Button>
          </div>
          
          <div className="mt-3 text-center">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register">
                Register
              </Link>
            </p>
            <p>
              <Link href="/auth/forgot-password">
                Forgot password?
              </Link>
            </p>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default LoginForm; 