import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalledWith(...args: any[]): R;
    }
    
    interface Expect {
      stringContaining(expected: string): any;
    }
  }
}

export {}; 