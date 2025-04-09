import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';

interface MFAVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required('Verification code is required')
    .matches(/^\d{6}$/, 'Must be exactly 6 digits')
});

export const MFAVerification: React.FC<MFAVerificationProps> = ({
  onSuccess,
  onCancel
}) => {
  const [error, setError] = useState<string | null>(null);
  const { verifyMFA } = useAuth();

  const formik = useFormik({
    initialValues: {
      code: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        await verifyMFA(values.code);
        onSuccess?.();
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to verify code');
      }
    }
  });

  return (
    <Container>
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="bg-white p-4 rounded shadow">
            <h3 className="text-center mb-4">Two-Factor Authentication</h3>
            {error && (
              <Alert variant="danger" onClose={() => setError(null)} dismissible>
                {error}
              </Alert>
            )}
            <Form onSubmit={formik.handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Enter 6-digit verification code</Form.Label>
                <Form.Control
                  type="text"
                  id="code"
                  name="code"
                  placeholder="000000"
                  value={formik.values.code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.code && !!formik.errors.code}
                  maxLength={6}
                  autoComplete="one-time-code"
                />
                {formik.touched.code && formik.errors.code && (
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.code}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
              <div className="d-grid gap-2">
                <Button variant="primary" type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? 'Verifying...' : 'Verify Code'}
                </Button>
                {onCancel && (
                  <Button variant="outline-secondary" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}; 