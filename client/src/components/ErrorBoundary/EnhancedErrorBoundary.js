import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Box, Typography } from '@mui/material';
import { RefreshCw, AlertTriangle, Bug, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Enhanced Error Boundary Component
 * Provides comprehensive error handling and user experience
 */
class EnhancedErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      retryCount: this.state.retryCount,
      componentName: this.props.componentName || 'Unknown'
    };

    // Send to error monitoring service
    if (window.errorReporting) {
      window.errorReporting.captureException(error, errorData);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error Data:', errorData);
      console.groupEnd();
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.state.errorId);
      }

      // Default fallback UI
      return (
        <ErrorFallbackUI
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          onRetry={this.handleRetry}
          onReload={this.handleReload}
          showErrorDetails={this.props.showErrorDetails}
          level={this.props.level}
        />
      );
    }

    return this.props.children
  }
}

/**
 * Error Fallback UI Component
 */
const ErrorFallbackUI = ({ 
  error, 
  errorId, 
  retryCount, 
  onRetry, 
  onReload, 
  showErrorDetails, 
  level 
}) => {
  const navigate = useNavigate();

  const getErrorSeverity = () => {
    if (level === 'critical') return 'error';
    if (level === 'warning') return 'warning';
    return 'error';
  };

  const getErrorIcon = () => {
    if (level === 'critical') return <Bug size={24} />
    return <AlertTriangle size={24} />
  };

  const getErrorTitle = () => {
    if (level === 'critical') return 'Critical Error Occurred';
    if (level === 'warning') return 'Something Went Wrong';
    return 'Oops! An Error Occurred';
  };

  const getErrorMessage = () => {
    if (retryCount > 2) {
      return 'This error persists after multiple attempts. Please reload the page or contact support.';
    }
    return 'An unexpected error occurred. Please try again or reload the page.';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: level === 'critical' ? '100vh' : '400px',
        padding: 3,
        textAlign: 'center',
        background: level === 'critical' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
      }}
    >
      <Alert 
        severity={getErrorSeverity()}
        sx={{ 
          width: '100%', 
          maxWidth: 600, 
          mb: 3,
          backgroundColor: level === 'critical' ? 'rgba(255,255,255,0.95)' : undefined
        }}
        icon={getErrorIcon()}
      >
        <Typography variant="h6" gutterBottom>
          {getErrorTitle()}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showErrorDetails && error ? error.message : getErrorMessage()}
        </Typography>
        {errorId && (
          <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
            Error ID: {errorId}
          </Typography>
        )}
        {retryCount > 0 && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            Retry attempts: {retryCount}
          </Typography>
        )}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {retryCount < 3 && (
          <Button
            variant="contained"
            startIcon={<RefreshCw />}
            onClick={onRetry}
            color="primary"
          >
            Try Again
          </Button>
        )}
        
        <Button
          variant="outlined"
          onClick={onReload}
          color="secondary"
        >
          Reload Page
        </Button>

        {level !== 'critical' && (
          <Button
            variant="text"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            color="primary"
          >
            Go Home
          </Button>
        )}
      </Box>

      {showErrorDetails && process.env.NODE_ENV === 'development' && error && (
        <Box sx={{ mt: 3, textAlign: 'left', maxWidth: 800, width: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Error Details (Development Only)
          </Typography>
          <Box sx={{ 
            background: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxHeight: '300px'
          }}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Error Stack:
            </Typography>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {error.stack}
            </pre>
          </Box>
        </Box>
      )}
    </Box>
  );
};

EnhancedErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  showErrorDetails: PropTypes.bool,
  level: PropTypes.oneOf(['warning', 'error', 'critical']),
  componentName: PropTypes.string,
  userId: PropTypes.string
};

EnhancedErrorBoundary.defaultProps = {
  fallback: null,
  showErrorDetails: process.env.NODE_ENV === 'development',
  level: 'error',
  componentName: null,
  userId: null
};

export default EnhancedErrorBoundary;