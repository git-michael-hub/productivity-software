'use client';

import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Body>
              <h2 className="h4 mb-3">Welcome, {user?.email ? user.email.split('@')[0] : 'User'}!</h2>
              <p className="text-muted">
                Use this dashboard to manage your productivity tasks, view your calendar, 
                and access your documents.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <h2 className="h3 mb-3">Quick Access</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h3 className="h5">Recent Tasks</h3>
              <p className="text-muted">You have no tasks yet.</p>
            </Card.Body>
            <Card.Footer className="bg-white border-top-0">
              <a href="/dashboard/tasks" className="text-decoration-none">View all tasks →</a>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h3 className="h5">Upcoming Events</h3>
              <p className="text-muted">You have no upcoming events.</p>
            </Card.Body>
            <Card.Footer className="bg-white border-top-0">
              <a href="/dashboard/calendar" className="text-decoration-none">View calendar →</a>
            </Card.Footer>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h3 className="h5">Recent Documents</h3>
              <p className="text-muted">You have no recent documents.</p>
            </Card.Body>
            <Card.Footer className="bg-white border-top-0">
              <a href="/dashboard/documents" className="text-decoration-none">View all documents →</a>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-2">
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h3 className="h5">Productivity Stats</h3>
              <p className="text-muted">
                Task completion stats will appear here once you start using the system.
              </p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Body>
              <h3 className="h5">Team Activity</h3>
              <p className="text-muted">
                Recent team activity will appear here.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
} 