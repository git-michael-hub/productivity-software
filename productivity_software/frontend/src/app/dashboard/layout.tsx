'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <ProtectedRoute>
      <div className="dashboard-layout d-flex flex-column min-vh-100">
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
          <Container>
            <Navbar.Brand href="/dashboard">Productivity Software</Navbar.Brand>
            <Navbar.Toggle aria-controls="main-navbar" />
            <Navbar.Collapse id="main-navbar">
              <Nav className="me-auto">
                <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                <Nav.Link href="/dashboard/tasks">Tasks</Nav.Link>
                <Nav.Link href="/dashboard/calendar">Calendar</Nav.Link>
                <Nav.Link href="/dashboard/documents">Documents</Nav.Link>
              </Nav>
              <Nav>
                <NavDropdown title={user?.email || 'User'} id="user-dropdown" align="end">
                  <NavDropdown.Item href="/dashboard/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Item href="/dashboard/settings">Settings</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Container className="flex-grow-1 mb-4">
          {children}
        </Container>

        <footer className="bg-light py-3 mt-auto">
          <Container className="text-center text-muted">
            <p className="mb-0">&copy; 2024 Productivity Software. All rights reserved.</p>
          </Container>
        </footer>
      </div>
    </ProtectedRoute>
  );
} 