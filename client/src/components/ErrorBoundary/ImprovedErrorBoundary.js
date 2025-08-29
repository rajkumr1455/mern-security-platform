import React from 'react';
import logger from '../../utils/improvedLogger';
import { Alert, Button, Box, Typography, Collapse } from '@mui/material';
import { ExpandMore, ExpandLess, Refresh, BugReport } from '@mui/icons-material';


/**;
 * Improved Error Boundary Component
 * Provides comprehensive error handling with user-friendly interface
 */;

class ImprovedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      props: this.props.errorMetadata || {}
    };

    logger.error('React Error Boundary caught an error', errorDetails);

    this.setState({
      errorInfo,
      error
    });

    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorDetails);
    }
  }

  reportError = async (errorDetails) => {
    try {
      await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorDetails)
      });
    } catch (reportingError) {
      logger.error('Failed to report error to server', { reportingError });
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prevState => ({
      showDetails: !prevState.showDetails
    })
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails, errorId } = this.state
      const { fallback: CustomFallback, level = 'component' } = this.props

      // Use custom fallback if provided
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
            errorId={errorId}
          />
        );
      }

      // Default error UI
      return (
        <Box
          sx={{
            p: 3,
            m: 2,
            border: '1px solid',
            borderColor: 'error.main',
            borderRadius: 2,
            backgroundColor: 'error.light',
            color: 'error.contrastText'
          }}
        >
          <Alert
            severity='error'
            icon={<BugReport />}
            sx={{ mb: 2 }}
          >
            <Typography variant='h6' gutterBottom>
              {level === 'app' ? 'Application Error' : 'Component Error'}
            </Typography>
            <Typography variant='body2' gutterBottom>
              {error?.message || 'An unexpected error occurred'}
            </Typography>
            {errorId && (
              <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                Error ID: {errorId}
              </Typography>
            )}
          </Alert>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant='contained'
              color='primary'
              startIcon={<Refresh />}
              onClick={this.handleRetry}
              size='small'
            >
              Try Again
            </Button>
            {level === 'app' && (
              <Button
                variant='outlined'
                onClick={this.handleReload}
                size='small'
              >
                Reload Page
              </Button>
            )}

            <Button
              variant='text'
              startIcon={showDetails ? <ExpandLess /> : <ExpandMore />}
              onClick={this.toggleDetails}
              size='small'
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </Button>
          </Box>
          <Collapse in={showDetails}>
            <Box
              sx={{
                p: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              <Typography variant='subtitle2' gutterBottom>
                Error Stack:
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                {error?.stack}
              </pre>
              {errorInfo?.componentStack && (
                <>
                  <Typography variant='subtitle2' gutterBottom sx={{ mt: 2 }}>
                    Component Stack:
                  </Typography>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {errorInfo.componentStack}
                  </pre>
                </>
              )}
            </Box>
          </Collapse>
          {process.env.NODE_ENV === 'development' && (
            <Typography variant='caption' display='block' sx={{ mt: 2 }}>
              💡 This error boundary is only shown in development.
              In production, users would see a more user-friendly message.
            </Typography>
          )}
        </Box>
      );
    }

    return this.props.children
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ImprovedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ImprovedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent
};

// Hook for error reporting
export const useErrorReporting = () => {
  const reportError = (error, context = {}) => {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    logger.error('Manual error report', errorDetails);
  };

  return { reportError };
};

export default ImprovedErrorBoundary;