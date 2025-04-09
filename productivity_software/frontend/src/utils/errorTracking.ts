// Error tracking utility for centralized error logging and reporting

interface ErrorDetails {
  message: string;
  stack?: string;
  name?: string;
  componentStack?: string;
  timestamp: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

// Generate a unique session ID for tracking errors across page reloads
const generateSessionId = (): string => {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('error_tracking_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      sessionStorage.setItem('error_tracking_session_id', sessionId);
    }
    return sessionId;
  }
  return 'server_side';
};

// Get current user ID if available
const getCurrentUserId = (): string | undefined => {
  if (typeof window !== 'undefined') {
    try {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        const user = JSON.parse(userData);
        return user.id;
      }
    } catch (e) {
      console.error('Error getting user ID for error tracking:', e);
    }
  }
  return undefined;
};

// Track an error with context
export const trackError = (error: Error | string, context?: Record<string, any>): void => {
  const errorDetails: ErrorDetails = {
    message: typeof error === 'string' ? error : error.message,
    stack: error instanceof Error ? error.stack : undefined,
    name: error instanceof Error ? error.name : 'StringError',
    timestamp: new Date().toISOString(),
    context,
    userId: getCurrentUserId(),
    sessionId: generateSessionId()
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error tracked:', errorDetails);
  }

  // In a real application, you would send this to an error tracking service
  // like Sentry, LogRocket, or a custom backend endpoint
  if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true') {
    // Example: Send to backend API
    try {
      if (typeof window !== 'undefined') {
        // Use sendBeacon for reliable delivery even during page unload
        const data = JSON.stringify(errorDetails);
        navigator.sendBeacon('/api/error-tracking', data);
      }
    } catch (e) {
      console.error('Failed to send error to tracking service:', e);
    }
  }
};

// Track API errors with request/response details
export const trackApiError = (
  error: any, 
  endpoint: string, 
  requestData?: any, 
  responseData?: any
): void => {
  const context = {
    endpoint,
    requestData,
    responseData,
    status: error.response?.status,
    statusText: error.response?.statusText,
    isNetworkError: !error.response,
    isTimeout: error.code === 'ECONNABORTED'
  };

  trackError(error, context);
};

// Track form validation errors
export const trackFormError = (
  formName: string,
  errors: Record<string, any>,
  values: Record<string, any>
): void => {
  // Sanitize values to remove sensitive data
  const sanitizedValues = { ...values };
  if (sanitizedValues.password) sanitizedValues.password = '[REDACTED]';
  if (sanitizedValues.password_confirm) sanitizedValues.password_confirm = '[REDACTED]';

  trackError(
    new Error(`Form validation error in ${formName}`),
    {
      formName,
      validationErrors: errors,
      formValues: sanitizedValues
    }
  );
};

// Track React component errors
export const trackComponentError = (
  error: Error,
  errorInfo: React.ErrorInfo,
  componentName: string
): void => {
  trackError(error, {
    componentName,
    componentStack: errorInfo.componentStack
  });
}; 