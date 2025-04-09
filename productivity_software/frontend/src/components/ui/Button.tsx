'use client';

import React from 'react';
import { Button as BootstrapButton, ButtonProps as BSButtonProps } from 'react-bootstrap';
import Link from 'next/link';

interface ButtonProps extends Omit<BSButtonProps, 'href'> {
  href?: string;
  isLoading?: boolean;
  external?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  href,
  isLoading,
  external,
  disabled,
  ...rest
}) => {
  // If button is in loading state
  const content = isLoading ? (
    <>
      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      {children}
    </>
  ) : (
    children
  );

  // If disabled or loading, disable button
  const isDisabled = disabled || isLoading;

  // If it's a link button
  if (href) {
    if (external) {
      return (
        <BootstrapButton
          as="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          disabled={isDisabled}
          {...rest}
        >
          {content}
        </BootstrapButton>
      );
    }
    
    return (
      <Link href={href} passHref legacyBehavior>
        <BootstrapButton as="a" disabled={isDisabled} {...rest}>
          {content}
        </BootstrapButton>
      </Link>
    );
  }

  // Regular button
  return (
    <BootstrapButton disabled={isDisabled} {...rest}>
      {content}
    </BootstrapButton>
  );
};

export default Button; 