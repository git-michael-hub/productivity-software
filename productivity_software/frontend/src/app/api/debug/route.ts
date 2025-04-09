import { NextResponse } from 'next/server';
import {
  API_URL,
  AUTH_BASE_URL,
  REGISTER_URL,
  LOGIN_URL
} from '../../../services/apiEndpoints';

export async function GET() {
  // Create context API URLs manually
  const contextApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/';
  const contextAuthUrl = `${contextApiUrl}auth/`;
  const contextRegisterUrl = `${contextAuthUrl}register/`;

  return NextResponse.json({
    message: 'API URL Debug Information',
    timestamp: new Date().toISOString(),
    serviceApiUrls: {
      API_URL,
      AUTH_BASE_URL,
      REGISTER_URL,
      LOGIN_URL
    },
    contextApiUrls: {
      contextApiUrl,
      contextAuthUrl,
      contextRegisterUrl
    },
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set'
    },
    debugUrls: {
      directConcatenation: contextApiUrl + 'auth/register/',
      templateLiteral: `${contextApiUrl}auth/register/`,
      normalizedUrl: `${contextApiUrl.replace(/\/$/, '')}/auth/register/`
    }
  });
} 