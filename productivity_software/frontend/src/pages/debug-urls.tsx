'use client';

import React, { useEffect, useState } from 'react';
import { Container, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';

// Import URLs from services
import {
  API_URL as ServiceApiUrl,
  AUTH_BASE_URL,
  REGISTER_URL as ServiceRegisterUrl,
  LOGIN_URL as ServiceLoginUrl
} from '../services/apiEndpoints';

export default function DebugUrls() {
  const [apiUrlStatus, setApiUrlStatus] = useState<{ url: string, status: string }[]>([]);
  
  // Define the Context API URLs manually since they're not exported
  const contextApiUrl = 'http://localhost:8000/api/';
  const contextAuthUrl = `${contextApiUrl}auth/`;
  const contextRegisterUrl = `${contextAuthUrl}register/`;
  const contextLoginUrl = `${contextAuthUrl}login/`;
  const contextLogoutUrl = `${contextAuthUrl}logout/`;
  const contextRefreshUrl = `${contextAuthUrl}token/refresh/`;
  const contextVerifyUrl = `${contextAuthUrl}verify-email/`;

  useEffect(() => {
    const checkUrls = async () => {
      // List of URLs to check
      const urlsToCheck = [
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/'}auth/register/`,
        contextRegisterUrl,
        ServiceRegisterUrl
      ];
      
      const results = [];
      
      for (const url of urlsToCheck) {
        try {
          // Only check if URL is reachable, use OPTIONS to avoid side effects
          await axios.options(url);
          results.push({ url, status: 'Reachable' });
        } catch (error: any) {
          const status = error.response 
            ? `Error: ${error.response.status} ${error.response.statusText}`
            : `Error: ${error.message}`;
          results.push({ url, status });
        }
      }
      
      setApiUrlStatus(results);
    };
    
    checkUrls();
  }, []);

  return (
    <Container className="py-5">
      <h1>API URL Debug</h1>
      
      <Card className="my-4">
        <Card.Header>Context API URLs (manually defined)</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>API_URL:</strong> {contextApiUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>REGISTER_URL:</strong> {contextRegisterUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>LOGIN_URL:</strong> {contextLoginUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>LOGOUT_URL:</strong> {contextLogoutUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>TOKEN_REFRESH_URL:</strong> {contextRefreshUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>VERIFY_EMAIL_URL:</strong> {contextVerifyUrl}
          </ListGroup.Item>
        </ListGroup>
      </Card>
      
      <Card className="my-4">
        <Card.Header>Service API URLs</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>API_URL:</strong> {ServiceApiUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>AUTH_BASE_URL:</strong> {AUTH_BASE_URL}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>REGISTER_URL:</strong> {ServiceRegisterUrl}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>LOGIN_URL:</strong> {ServiceLoginUrl}
          </ListGroup.Item>
        </ListGroup>
      </Card>
      
      <Card className="my-4">
        <Card.Header>URL Availability Check</Card.Header>
        <ListGroup variant="flush">
          {apiUrlStatus.map((item, index) => (
            <ListGroup.Item key={index}>
              <div><strong>URL:</strong> {item.url}</div>
              <div><strong>Status:</strong> {item.status}</div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
      
      <Card className="my-4">
        <Card.Header>Environment Variables</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'not set'}
          </ListGroup.Item>
        </ListGroup>
      </Card>
      
      <Card className="my-4">
        <Card.Header>Debug Special URL Constructions</Card.Header>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Direct concatenation:</strong> {'http://localhost:8000/api/' + 'auth/register/'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Template literal:</strong> {`http://localhost:8000/api/auth/register/`}
          </ListGroup.Item>
        </ListGroup>
      </Card>
    </Container>
  );
} 