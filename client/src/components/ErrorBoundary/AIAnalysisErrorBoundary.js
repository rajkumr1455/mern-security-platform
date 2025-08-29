import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button, Box, Typography, Card, CardContent, Chip } from '@mui/material';
import { RefreshCw, AlertTriangle, Brain, Bug, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * AI Analysis-specific Error Boundary
 * Handles errors in AI processing, model loading, and analysis workflows
 */
class AIAnalysisErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      analysisState: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorId: `ai_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
      analysisState: this.props.analysisState || null
    });

    this.logAIError(error, errorInfo);
  }

  logAIError = (error, errorInfo) => {
    const errorData = {
      component: 'AIAnalysis',
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      aiModel: this.props.aiModel || 'unknown',
      analysisType: this.props.analysisType || 'general',
      analysisState: this.state.analysisState,
      retryCount: this.state.retryCount,
      modelLoadingState: this.props.modelLoadingState || 'unknown'
    };

    // Send to AI-specific error monitoring
    if (window.errorReporting) {
      window.errorReporting.captureAIError(errorData);
    }

    console.error('AI Analysis Error:', errorData);
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

  handleResetAI = () => {
    // Reset AI state if callback provided
    if (this.props.onResetAI) {
      this.props.onResetAI();
    }
    this.handleRetry();
  };

  render() {
    if (this.state.hasError) {
      return (
        <AIErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.state.retryCount}
          aiModel={this.props.aiModel}
          analysisType={this.props.analysisType}
          analysisState={this.state.analysisState}
          onRetry={this.handleRetry}
          onResetAI={this.handleResetAI}
          showErrorDetails={this.props.showErrorDetails}
        />
      );
    }

    return this.props.children
  }
}

/**
 * AI Error Fallback UI
 */
const AIErrorFallback = ({
  error,
  errorId,
  retryCount,
  aiModel,
  analysisType,
  analysisState,
  onRetry,
  onResetAI,
  showErrorDetails
}) => {
  const navigate = useNavigate();

  const getErrorType = () => {
    const errorMessage = error?.message?.toLowerCase() || '';
    
    if (errorMessage.includes('model') || errorMessage.includes('loading')) {
      return 'model_loading';
    }
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      return 'network';
    }
    if (errorMessage.includes('memory') || errorMessage.includes('out of memory')) {
      return 'memory';
    }
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    return 'analysis';
  };

  const getErrorTitle = () => {
    const errorType = getErrorType();
    const titles = {
      model_loading: 'AI Model Loading Error',
      network: 'Network Connection Error',
      memory: 'Memory Allocation Error',
      timeout: 'Analysis Timeout Error',
      analysis: 'AI Analysis Error'
    };
    return titles[errorType] || 'AI Processing Error';
  };

  const getErrorMessage = () => {
    const errorType = getErrorType();
    
    if (retryCount > 2) {
      return 'The AI analysis is experiencing persistent issues. This might require manual intervention or model reset.';
    }

    const messages = {
      model_loading: 'Failed to load the AI model. This might be due to network issues or model availability.',
      network: 'Cannot connect to AI services. Please check your internet connection.',
      memory: 'Insufficient memory for AI processing. Try reducing the analysis scope.',
      timeout: 'AI analysis took too long to complete. The target might be too complex.',
      analysis: 'An error occurred during AI analysis. The input data might be incompatible.'
    };

    return messages[errorType] || 'An unexpected error occurred during AI processing.';
  };

  const getRecommendedActions = () => {
    const errorType = getErrorType();
    
    const actions = {
      model_loading: [
        'Check internet connection',
        'Try a different AI model',
        'Wait and retry in a few minutes'
      ],
      network: [
        'Check internet connection',
        'Try again in a few moments',
        'Use offline analysis if available'
      ],
      memory: [
        'Reduce analysis scope',
        'Close other applications',
        'Try simpler AI model'
      ],
      timeout: [
        'Reduce target complexity',
        'Use faster AI model',
        'Break analysis into smaller parts'
      ],
      analysis: [
        'Verify input data format',
        'Try different analysis parameters',
        'Check target compatibility'
      ]
    };

    return actions[errorType] || ['Retry the analysis', 'Check system resources', 'Contact support']
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
      <Card sx={{ maxWidth: 700, width: '100%', mb: 3 }}>
        <CardContent>
          <Alert 
            severity="error"
            sx={{ mb: 3 }}
            icon={<Brain />}
          >
            <Typography variant="h6" gutterBottom>
              {getErrorTitle()}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {showErrorDetails && error ? error.message : getErrorMessage()}
            </Typography>
            
            {/* AI Context Information */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {aiModel && (
                <Chip 
                  label={`Model: ${aiModel}`} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                />
              )}
              {analysisType && (
                <Chip 
                  label={`Type: ${analysisType}`} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                />
              )}
              {analysisState && (
                <Chip 
                  label={`State: ${analysisState}`} 
                  size="small" 
                  color="info" 
                  variant="outlined" 
                />
              )}
            </Box>

            {errorId && (
              <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>
                Error ID: {errorId}
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', mb: 3 }}>
            {retryCount < 3 && (
              <Button
                variant="contained"
                startIcon={<RefreshCw />}
                onClick={onRetry}
                color="primary"
              >
                Retry Analysis
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<Brain />}
              onClick={onResetAI}
              color="secondary"
            >
              Reset AI Model
            </Button>

            <Button
              variant="text"
              startIcon={<Settings />}
              onClick={() => navigate('/ai/settings')}
              color="primary"
            >
              AI Settings
            </Button>
          </Box>

          {/* Recommended Actions */}
          <Card variant="outlined" sx={{ textAlign: 'left' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Bug size={20} />
                Recommended Actions
              </Typography>
              <Box component="ul" sx={{ pl: 2, m: 0 }}>
                {getRecommendedActions().map((action, index) => (
                  <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                    {action}
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Alternative AI Options */}
      <Card sx={{ maxWidth: 700, width: '100%' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Alternative Options
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Button
              variant="text"
              onClick={() => navigate('/ai/basic')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • Try Basic AI Analysis
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/ai/models')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • Switch AI Model
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/scans')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • Use Traditional Scanning
            </Button>
            <Button
              variant="text"
              onClick={() => navigate('/reports')}
              sx={{ justifyContent: 'flex-start' }}
            >
              • View Previous Results
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

AIAnalysisErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  aiModel: PropTypes.string,
  analysisType: PropTypes.string,
  analysisState: PropTypes.string,
  modelLoadingState: PropTypes.string,
  onResetAI: PropTypes.func,
  showErrorDetails: PropTypes.bool
};

AIAnalysisErrorBoundary.defaultProps = {
  aiModel: null,
  analysisType: null,
  analysisState: null,
  modelLoadingState: null,
  onResetAI: null,
  showErrorDetails: process.env.NODE_ENV === 'development'
};

export default AIAnalysisErrorBoundary;