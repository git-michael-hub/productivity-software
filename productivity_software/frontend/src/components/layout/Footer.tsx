'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light py-5 mt-auto">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5 className="mb-3">Productivity Software</h5>
            <p className="text-muted">
              A comprehensive productivity solution for individuals and teams to 
              manage tasks, schedules, and documents efficiently.
            </p>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Product</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/features" className="text-decoration-none text-muted">
                  Features
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/pricing" className="text-decoration-none text-muted">
                  Pricing
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/roadmap" className="text-decoration-none text-muted">
                  Roadmap
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/about" className="text-decoration-none text-muted">
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/team" className="text-decoration-none text-muted">
                  Team
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/contact" className="text-decoration-none text-muted">
                  Contact
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/blog" className="text-decoration-none text-muted">
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/help" className="text-decoration-none text-muted">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/docs" className="text-decoration-none text-muted">
                  Documentation
                </Link>
              </li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-4 mb-md-0">
            <h6 className="mb-3">Legal</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/terms" className="text-decoration-none text-muted">
                  Terms
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/privacy" className="text-decoration-none text-muted">
                  Privacy
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/cookie-policy" className="text-decoration-none text-muted">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </Col>
        </Row>
        
        <hr className="my-4" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
          <p className="text-muted mb-3 mb-md-0">
            &copy; {currentYear} Productivity Software. All rights reserved.
          </p>
          <div className="d-flex">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
              <i className="bi bi-twitter"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
              <i className="bi bi-linkedin"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted me-3">
              <i className="bi bi-github"></i>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 