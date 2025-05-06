import React, { Component } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import HealthCheck from './HealthCheck';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI
      return (
        <Container className="mt-5">
          <Card className="shadow-sm">
            <Card.Header className="bg-danger text-white">
              <h3 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Something went wrong
              </h3>
            </Card.Header>
            <Card.Body>
              <Alert variant="danger">
                {this.state.error && this.state.error.toString()}
              </Alert>
              
              <h5 className="mt-4">API Connection Status</h5>
              <HealthCheck />
              
              <div className="mt-3">
                <h5>Technical Details:</h5>
                <details className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  <summary>Show Error Details</summary>
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </details>
              </div>
              
              <div className="mt-4">
                <h5>Troubleshooting Steps:</h5>
                <ol>
                  <li>Try refreshing the page</li>
                  <li>Verify your internet connection</li>
                  <li>Check if you're properly logged in (try logging out and back in)</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Contact support if the problem persists</li>
                </ol>
              </div>
              
              <div className="d-flex justify-content-center mt-4">
                <Button 
                  variant="primary" 
                  onClick={() => window.location.reload()}
                  className="me-2"
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Refresh Page
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => window.location.href = '/'}
                >
                  <i className="bi bi-house-door me-1"></i>
                  Go to Home
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    // If there's no error, render the children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 