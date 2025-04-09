#!/usr/bin/env python
"""
Simple SMTP test script to verify Gmail credentials.
"""
import smtplib
import sys
import getpass
from email.mime.text import MIMEText

def test_smtp_connection(host, port, username, password=None, use_tls=True):
    """Test SMTP connection with the given credentials."""
    print(f"Testing SMTP connection to {host}:{port} with username: {username}")
    
    # If password is not provided, prompt for it securely
    if password is None:
        password = getpass.getpass(f"Enter password for {username}: ")
    
    try:
        # Create server object
        server = smtplib.SMTP(host, port)
        server.set_debuglevel(1)  # Enable verbose debug output
        
        # Identify ourselves to the SMTP server
        server.ehlo()
        
        if use_tls:
            # Start TLS encryption
            print("Starting TLS...")
            server.starttls()
            server.ehlo()  # Re-identify after TLS
        
        # Attempt authentication
        print("Attempting login...")
        server.login(username, password)
        
        print("Authentication successful! Credentials are working correctly.")
        
        # Optional: Try sending a test email
        answer = input("Would you like to send a test email? (y/n): ")
        if answer.lower() == 'y':
            recipient = input("Enter recipient email address: ")
            
            msg = MIMEText("This is a test email sent from the SMTP verification script.")
            msg['Subject'] = 'SMTP Test Email'
            msg['From'] = username
            msg['To'] = recipient
            
            print(f"Sending test email to {recipient}...")
            server.sendmail(username, [recipient], msg.as_string())
            print("Test email sent successfully!")
        
        # Quit server
        server.quit()
        return True
    except Exception as e:
        print(f"Error: {e}")
        print("\nAuthentication failed. Please check your credentials and settings.")
        
        # Print additional help for common error codes
        if "534" in str(e):
            print("\nNote: Error 534 typically means you need to use an App Password.")
            print("Generate one at: https://myaccount.google.com/apppasswords")
        elif "535" in str(e):
            print("\nNote: Error 535 means your username/password was rejected.")
            print("If you're using Gmail:")
            print("1. Make sure 2-Step Verification is enabled")
            print("2. Generate an App Password at: https://myaccount.google.com/apppasswords")
            print("3. Use that App Password instead of your regular Gmail password")
            print("4. Ensure you're using the correct email address")
        
        return False

if __name__ == "__main__":
    # Gmail SMTP settings
    host = "smtp.gmail.com"
    port = 587
    
    # Ask for credentials
    username = input("Enter Gmail address: ") or "productivitysoftwareapp@gmail.com"
    password = getpass.getpass(f"Enter App Password for {username}: ")
    
    # Run the test
    success = test_smtp_connection(host, port, username, password)
    sys.exit(0 if success else 1) 