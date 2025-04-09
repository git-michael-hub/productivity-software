'use client';

import React from 'react';
import { Navbar, Container, Nav } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Navbar 
      bg={transparent ? 'transparent' : 'primary'} 
      variant={transparent ? 'light' : 'dark'} 
      expand="lg" 
      className={transparent ? 'position-absolute w-100' : ''}
      style={transparent ? { zIndex: 1000 } : {}}
    >
      <Container>
        <Link href="/" passHref legacyBehavior>
          <Navbar.Brand>Productivity Software</Navbar.Brand>
        </Link>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Link href="/features" passHref legacyBehavior>
              <Nav.Link>Features</Nav.Link>
            </Link>
            <Link href="/pricing" passHref legacyBehavior>
              <Nav.Link>Pricing</Nav.Link>
            </Link>
            <Link href="/about" passHref legacyBehavior>
              <Nav.Link>About</Nav.Link>
            </Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" passHref legacyBehavior>
                  <Nav.Link>Dashboard</Nav.Link>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" passHref legacyBehavior>
                  <Nav.Link>Login</Nav.Link>
                </Link>
                <Link href="/auth/register" passHref legacyBehavior>
                  <Nav.Link className="btn btn-light text-primary ms-2 px-3">Register</Nav.Link>
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 