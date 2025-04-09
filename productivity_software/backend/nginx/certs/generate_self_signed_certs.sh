#!/bin/bash

# Create a self-signed SSL certificate for local development
# This should NOT be used in production environments

# Set variables
CERT_DIR="$(dirname "$0")"
DAYS_VALID=365
DOMAIN="localhost"

echo "Generating self-signed SSL certificate for $DOMAIN"
echo "Certificate will be valid for $DAYS_VALID days"

# Generate a private key
openssl genrsa -out "$CERT_DIR/server.key" 2048

# Generate a CSR (Certificate Signing Request)
openssl req -new -key "$CERT_DIR/server.key" -out "$CERT_DIR/server.csr" -subj "/CN=$DOMAIN/O=Productivity Software/C=US"

# Generate a self-signed certificate
openssl x509 -req -days $DAYS_VALID -in "$CERT_DIR/server.csr" -signkey "$CERT_DIR/server.key" -out "$CERT_DIR/server.crt"

# Remove the CSR as it's no longer needed
rm "$CERT_DIR/server.csr"

echo "Self-signed SSL certificate created successfully!"
echo "Files generated:"
echo "  - $CERT_DIR/server.key (private key)"
echo "  - $CERT_DIR/server.crt (certificate)"
echo ""
echo "NOTE: Since this is a self-signed certificate, browsers will show a security warning."
echo "      This is normal and can be bypassed for development purposes." 