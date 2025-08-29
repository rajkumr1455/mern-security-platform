import './styles/professional-ui.css';
import './styles/global-byterox-overrides.css';
import './styles/byterox-inspired-theme.css';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';


// Components (keep these as regular imports for critical path)
import ProtectedRoute from './components/Auth/ProtectedRoute';
import EnhancedErrorBoundary from './components/ErrorBoundary/EnhancedErrorBoundary';
import ProfessionalLayout from './components/Professional/ProfessionalLayout';

// Lazy load pages for better performance
const ProfessionalLogin = lazy(() => import('./pages/Auth/ProfessionalLogin'));
const MainDashboard = lazy(() => import('./pages/Dashboard/ByteroxDashboard'));
const Targets = lazy(() => import('./pages/Targets/Targets'));
const TargetDetail = lazy(() => import('./pages/Targets/TargetDetail'));
const Scans = lazy(() => import('./pages/Scans/Scans'));
const ScanDetail = lazy(() => import('./pages/Scans/ScanDetail'));
const Web2Scans = lazy(() => import('./pages/Scans/Web2Scans'));
const Workflows = lazy(() => import('./pages/Workflows/Workflows'));
const WorkflowDetail = lazy(() => import('./pages/Workflows/WorkflowDetail'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const AdvancedReports = lazy(() => import('./pages/Reports/AdvancedReports'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Reconnaissance = lazy(() => import('./pages/Reconnaissance/Reconnaissance'));
const Web3Analysis = lazy(() => import('./pages/Web3/Web3Analysis'));
const PerformanceMonitoring = lazy(() => import('./pages/Performance/PerformanceMonitoring'));
const AIAnalysis = lazy(() => import('./pages/AI/AIAnalysis'));
const EliteAILiveDemonstration = lazy(() => import('./pages/AI/EliteAILiveDemonstration'));
const AICapabilitiesShowcase = lazy(() => import('./pages/AI/AICapabilitiesShowcase'));
const InteractiveAITesting = lazy(() => import('./pages/AI/InteractiveAITesting'));
const CompleteEliteAI = lazy(() => import('./pages/AI/CompleteEliteAI'));
const SecurityTools = lazy(() => import('./pages/Tools/SecurityTools'));
const ComprehensiveSecurityTools = lazy(() => import('./pages/Tools/ComprehensiveSecurityTools'));

// Bug Bounty Components (lazy loaded)
const BugBountyDashboard = lazy(() => import('./pages/BugBounty/BugBountyDashboard'));

// Workflow Components (lazy loaded)
const WorkflowOrchestrator = lazy(() => import('./pages/Workflows/WorkflowOrchestrator'));

// Web3 Components (lazy loaded)
const SimplifiedWeb3Dashboard = lazy(() => import('./pages/Web3/SimplifiedWeb3Dashboard'));
const EnhancedWeb3Dashboard = lazy(() => import('./pages/Web3/EnhancedWeb3Dashboard'));

// Advanced Reporting Components (lazy loaded)
const AdvancedReportingDashboard = lazy(() => import('./pages/Reports/AdvancedReportingDashboard'));

// Enhanced Reconnaissance Components (lazy loaded)
const EnhancedSudomyRecon = lazy(() => import('./pages/Reconnaissance/EnhancedSudomyRecon'));

// Loading component
const LoadingFallback = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='400px'
    flexDirection='column'
    gap={2}
  >
    <CircularProgress size={40} />
    <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
  </Box>
);

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create theme
const bugBountyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      dark: '#0099cc',
      light: '#33ddff',
    },
    secondary: {
      main: '#ff6b35',
      dark: '#cc5529',
      light: '#ff8c66',
    },
    background: {
      default: '#0a0e1a',
      paper: '#1a1f2e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
    success: {
      main: '#4caf50',
      dark: '#388e3c',
      light: '#81c784',
    },
    warning: {
      main: '#ff9800',
      dark: '#f57c00',
      light: '#fbb734',
    },
    error: {
      main: '#f44336',
      dark: '#d32f2f',
      light: '#e57373',
    },
    info: {
      main: '#2196f3',
      dark: '#1976d2',
      light: '#64b5f6',
    },
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#ffffff',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#ffffff',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#ffffff',
    },
    body1: {
      fontSize: '1rem',
      color: '#ffffff',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#b0bec5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          background: 'linear-gradient(145deg, #1a1f2e 0%, #252a3a 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

// Import AuthProvider from separate file
import { AuthProvider } from './contexts/AuthContext';

// Main App Content
const AppContent = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path='/login' element={<ProfessionalLogin />} />
        <Route path='/' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <MainDashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <MainDashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/targets' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Targets />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/targets/:id' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <TargetDetail />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/scans' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Scans />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/scans/web2' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Web2Scans />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/scans/:id' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <ScanDetail />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/workflows' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Workflows />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/workflows/orchestrator' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <WorkflowOrchestrator />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/workflows/:id' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <WorkflowDetail />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/reports' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Reports />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/reports/advanced' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AdvancedReports />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/reports/dashboard' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AdvancedReportingDashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/advanced-reports' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AdvancedReportingDashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/reconnaissance' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Reconnaissance />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/reconnaissance/enhanced' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <EnhancedSudomyRecon />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/web3' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <SimplifiedWeb3Dashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/web3/enhanced' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <EnhancedWeb3Dashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/web3/analysis' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Web3Analysis />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <CompleteEliteAI />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai/analysis' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AIAnalysis />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai/demo' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <EliteAILiveDemonstration />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai/capabilities' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AICapabilitiesShowcase />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai/testing' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <InteractiveAITesting />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai/complete' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <CompleteEliteAI />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/ai-analysis' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <AIAnalysis />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/bugbounty' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <BugBountyDashboard />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/tools' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <SecurityTools />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/tools/comprehensive' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <ComprehensiveSecurityTools />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/performance' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <PerformanceMonitoring />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
        <Route path='/settings' element={
          <ProtectedRoute>
            <ProfessionalLayout>
              <Settings />
            </ProfessionalLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

// Main App Component
function App() {
  // Force Byterox theme on body
  React.useEffect(() => {
    document.body.className = 'byterox-theme';
    document.documentElement.setAttribute('data-theme', 'byterox');
    document.body.style.background = 'linear-gradient(135deg, #1a1b2e 0%, #2d1b69 50%, #1a1b2e 100%)';
    document.body.style.backgroundColor = '#1a1b2e';
    document.body.style.color = '#ffffff';
  }, []);

  return (
    <div className="byterox-app">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={bugBountyTheme}>
          <CssBaseline />
          <EnhancedErrorBoundary level="critical" componentName="App">
            <AuthProvider>
              <Router>
                <EnhancedErrorBoundary level="error" componentName="AppContent">
                  <AppContent />
                </EnhancedErrorBoundary>
              <Toaster
                position='top-right'
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#ffffff',
                    color: '#0f172a !important',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                    fontWeight: '600',
                  },
                  success: {
                    style: {
                      background: '#ffffff',
                      color: '#28a745',
                      border: '1px solid #28a745',
                    },
                  },
                  error: {
                    style: {
                      background: '#ffffff',
                      color: '#dc3545',
                      border: '1px solid #dc3545',
                    },
                  },
                }}
              />
              </Router>
            </AuthProvider>
          </EnhancedErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </div>
  );
}

export default App;