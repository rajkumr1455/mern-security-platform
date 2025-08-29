import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Box, Typography, Card, CardContent } from '@mui/material';
import { RefreshCw, AlertTriangle, Home, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard-specific Error Boundary
 * Provides dashboard-focused error handling and recovery options
 */
class DashboardErrorBoundary extends React.Component {
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
      errorId: `dashboard_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log dashboard-specific error
    this.logDashboardError(error, errorInfo);
  }

  logDashboardError = (error, errorInfo) => {
    const errorData = {
      component: 'Dashboard',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      dashboardType: this.props.dashboardType || 'main',
      userActions: this.props.userActions || [],
      retryCount: this.state.retryCount
    };

    // Send to error monitoring
    if (window.errorReporting) {
      window.errorReporting.captureDashboardError(errorData);
    }

    console.error('Dashboard Error:', errorData);
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

  handleRefreshData = () => {
    // Trigger data refresh if callback provided
    if (this.props.onRefreshData) {
      this.props.onRefreshData();
    }
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <DashboardErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          dashboardType={this.props.dashboardType}
          onRetry={this.handleRetry}
          onRefreshData={this.handleRefreshData}
          onNavigateHome={this.props.onNavigateHome}
          showErrorDetails={this.props.showErrorDetails}
        />
      );
    }

    return this.props.children
  }
}

/**
 * Dashboard Error Fallback UI
 */
const DashboardErrorFallback = ({
  error,
  errorId,
  retryCount,
  dashboardType,
  onRetry,
  onRefreshData,
  onNavigateHome,
  showErrorDetails
}) => {
  const navigate = useNavigate();

  const getDashboardTitle = () => {
    const titles = {
      main: 'Main Dashboard',
      web3: 'Web3 Dashboard',
      bugbounty: 'Bug Bounty Dashboard',
      ai: 'AI Analysis Dashboard'
    };
    return titles[dashboardType] || 'Dashboard';
  };

  const getErrorMessage = () => {
    if (retryCount > 2) {
      return 'The dashboard is experiencing persistent issues. Try refreshing your data or contact support.';
    }
    return 'There was an issue loading the dashboard. This might be due to network connectivity or data loading problems.';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 3,
        textAlign: 'center'
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', mb: 3 }}>
        <CardContent>
          <Alert 
            severity="error"
            sx={{ mb: 3 }}
            icon={<AlertTriangle />}
          >
            <Typography variant="h6" gutterBottom>
              {getDashboardTitle()} Error
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {showErrorDetails && error ? error.message : getErrorMessage()}
            </Typography>
            {errorId && (
              <Typography variant="caption" display="block" sx={{ mt: 1, fontFamily: 'monospace' }}>
                Error ID: {errorId}
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
                Retry Dashboard
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<RefreshCw />}
              onClick={onRefreshData}
              color="secondary"
            >
              Refresh Data
            </Button>

            <Button
              variant="text"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              color="primary"
            >
              Go Home
            </Button>

            <Button
              variant="text"
              startIcon={<Settings />}
              onClick={() => navigate('/settings')}
              color="secondary"
            >
              Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions for Dashboard Recovery */}
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Recovery Options
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate('/dashboard')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • Try Main Dashboard
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/targets')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • View Targets
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/scans')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • View Recent Scans
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/reports')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • View Reports
            </Button>
          </Box>
        </CardContent>
      </Card>

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
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {error.stack}
            </pre>
          </Box>
        </Box>
      )}
    </Box>
  );
};

DashboardErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  dashboardType: PropTypes.oneOf(['main', 'web3', 'bugbounty', 'ai']),
  onRefreshData: PropTypes.func,
  onNavigateHome: PropTypes.func,
  showErrorDetails: PropTypes.bool,
  userActions: PropTypes.array
};

DashboardErrorBoundary.defaultProps = {
  dashboardType: 'main',
  onRefreshData: null,
  onNavigateHome: null,
  showErrorDetails: process.env.NODE_ENV === 'development',
  userActions: []
};

export default DashboardErrorBoundary;