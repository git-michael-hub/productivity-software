'use client';

import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Link from 'next/link';

export default function Home() {
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} className="text-center">
          <h1 className="display-4 mb-4">Welcome to Productivity Software</h1>
          <p className="lead mb-4">
            Boost your productivity with our comprehensive suite of tools designed to help you manage tasks, 
            collaborate with your team, and stay organized.
          </p>
          <Card className="shadow-sm mb-4">
            <Card.Body className="p-5">
              <h2 className="mb-3">Get Started Today</h2>
              <p className="mb-4">
                Sign up for an account to access all features of our productivity platform.
              </p>
              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link href="/auth/register" passHref>
                  <Button variant="primary" size="lg" className="me-md-2">Register</Button>
                </Link>
                <Link href="/auth/login" passHref>
                  <Button variant="outline-secondary" size="lg">Log In</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
          <div className="mt-5">
            <h3>Key Features</h3>
            <Row className="mt-4">
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <h4>Task Management</h4>
                    <p>Create, organize, and prioritize your tasks efficiently.</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <h4>Team Collaboration</h4>
                    <p>Work together seamlessly with real-time updates and sharing.</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <h4>Analytics</h4>
                    <p>Gain insights into your productivity patterns and team performance.</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </Container>
  );
} 