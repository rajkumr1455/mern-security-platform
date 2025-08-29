import React from 'react';
import { Alert, Button, Card, CardContent, Typography, Box } from '@mui/material';
import { RefreshCw, AlertTriangle } from 'lucide-react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      // logger.error('ErrorBoundary caught an error:', error, errorInfo); // TODO: Implement client-side logging
    }

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error, errorInfo) => {
    // Send error to monitoring service
    try {
      fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          errorId: this.state.errorId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch (e) {
      // Silently fail if error reporting fails
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props

      // Use custom fallback if provided
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      // Default error UI
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='400px'
          p={3}
        >
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Box display='flex' alignItems='center' mb={2}>
                <AlertTriangle color='#f44336' size={24} />
                <Typography variant='h6' sx={{ ml: 1, color: '#f44336' }}>
                  Something went wrong
                </Typography>
              </Box>
              <Alert severity='error' sx={{ mb: 2 }}>
                An unexpected error occurred. Our team has been notified.
              </Alert>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                  <Typography variant='subtitle2' gutterBottom>
                    Error Details (Development Only):
                  </Typography>
                  <Typography variant='body2' component='pre' sx={{
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: '200px'
                  }}>
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}

              <Box display='flex' gap={2} mt={3}>
                <Button
                  variant='contained'
                  startIcon={<RefreshCw size={16} />}
                  onClick={this.handleRetry}
                  color='primary'
                >
                  Try Again
                </Button>
                <Button
                  variant='outlined'
                  onClick={this.handleReload}
                  color='secondary'
                >
                  Reload Page
                </Button>
              </Box>
              {this.state.errorId && (
                <Typography variant='caption' display='block' sx={{ mt: 2, color: 'text.secondary' }}>
                  Error ID: {this.state.errorId}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children
  }
}

export default ErrorBoundary;