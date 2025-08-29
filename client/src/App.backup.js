import './styles/byterox-inspired-theme.css';
import './styles/global-byterox-overrides.css';
import './styles/hybrid-cybersecurity-theme.css';
import './styles/professional-ui.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Toaster } from 'react-hot-toast';


// Components
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

// Pages
import ProfessionalLogin from './pages/Auth/ProfessionalLogin';
import MainDashboard from './pages/Dashboard/ByteroxDashboard';
import ProfessionalLayout from './components/Professional/ProfessionalLayout';
import Targets from './pages/Targets/Targets';
import TargetDetail from './pages/Targets/TargetDetail';
import Scans from './pages/Scans/Scans';
import ScanDetail from './pages/Scans/ScanDetail';
import Web2Scans from './pages/Scans/Web2Scans';
import Workflows from './pages/Workflows/Workflows';
import WorkflowDetail from './pages/Workflows/WorkflowDetail';
import Reports from './pages/Reports/Reports';
import AdvancedReports from './pages/Reports/AdvancedReports';
import Settings from './pages/Settings/Settings';
import Reconnaissance from './pages/Reconnaissance/Reconnaissance';
import Web3Analysis from './pages/Web3/Web3Analysis';
import PerformanceMonitoring from './pages/Performance/PerformanceMonitoring';
import AIAnalysis from './pages/AI/AIAnalysis';
import EliteAILiveDemonstration from './pages/AI/EliteAILiveDemonstration';
import AICapabilitiesShowcase from './pages/AI/AICapabilitiesShowcase';
import InteractiveAITesting from './pages/AI/InteractiveAITesting';
import CompleteEliteAI from './pages/AI/CompleteEliteAI';
import SecurityTools from './pages/Tools/SecurityTools';
import ComprehensiveSecurityTools from './pages/Tools/ComprehensiveSecurityTools';

// Bug Bounty Components
import BugBountyDashboard from './pages/BugBounty/BugBountyDashboard';

// Workflow Components
import WorkflowOrchestrator from './pages/Workflows/WorkflowOrchestrator';

// Web3 Components
import SimplifiedWeb3Dashboard from './pages/Web3/SimplifiedWeb3Dashboard';
import EnhancedWeb3Dashboard from './pages/Web3/EnhancedWeb3Dashboard';

// Advanced Reporting Components
import AdvancedReportingDashboard from './pages/Reports/AdvancedReportingDashboard';

// Enhanced Sudomy Components
import EnhancedSudomyDashboard from './pages/Reconnaissance/EnhancedSudomyDashboard';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create Bug Bounty Platform Dark Theme
const bugBountyTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8b5cf6',
      dark: '#7c3aed',
      light: '#a855f7',
    },
    secondary: {
      main: '#06b6d4',
      dark: '#0891b2',
      light: '#22d3ee',
    },
    background: {
      default: '#1a1b2e',
      paper: 'rgba(26, 27, 46, 0.95)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
    },
    success: {
      main: '#28a745',
      dark: '#1e7e34',
      light: '#34d399',
    },
    warning: {
      main: '#fd7e14',
      dark: '#e8650e',
      light: '#fbbf24',
    },
    error: {
      main: '#dc3545',
      dark: '#c82333',
      light: '#f87171',
    },
    info: {
      main: '#06b6d4',
      dark: '#0891b2',
      light: '#22d3ee',
    },
  },
  typography: {
    fontFamily: ''Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.4,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#ffffff',
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#cbd5e1',
      lineHeight: 1.4,
    },
    body1: {
      color: '#cbd5e1',
      lineHeight: 1.6,
    },
    body2: {
      color: '#94a3b8',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#8b5cf6 #1a1b2e',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#1a1b2e',
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#8b5cf6',
            minHeight: 24,
            border: '2px solid #2d1b69',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a855f7',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          padding: '10px 20px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
          color: '#ffffff',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
            boxShadow: '0 0 25px rgba(139, 92, 246, 0.4)',
          },
        },
        outlined: {
          borderColor: '#e2e8f0',
          color: '#475569',
          '&:hover': {
            borderColor: '#0ea5e9',
            backgroundColor: 'rgba(14, 165, 233, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          color: '#0ea5e9',
        },
        colorSecondary: {
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          color: '#8b5cf6',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#0ea5e9',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#0066cc',
              boxShadow: '0 0 0 3px rgba(0, 102, 204, 0.1)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 27, 46, 0.95)',
          color: '#ffffff !important',
          boxShadow: '0 4px 16px rgba(139, 92, 246, 0.2)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          backdropFilter: 'blur(20px)',
        },
      },
    },
  },
});

function AppContent() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!user) {
    return (
      <Routes>
        <Route path='/login' element={<ProfessionalLogin />} />
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    );
  }

  return (
    <WebSocketProvider>
      <ProfessionalLayout>
        <div className='main-layout'>
          <div className='content-area'>
            <Routes>
            <Route path='/' element={<Navigate to='/dashboard' replace />} />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <MainDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/targets'
              element={
                <ProtectedRoute>
                  <Targets />
                </ProtectedRoute>
              }
            />
            <Route
              path='/targets/:id'
              element={
                <ProtectedRoute>
                  <TargetDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/scans'
              element={
                <ProtectedRoute>
                  <Scans />
                </ProtectedRoute>
              }
            />
            <Route
              path='/scans/web2'
              element={
                <ProtectedRoute>
                  <Web2Scans />
                </ProtectedRoute>
              }
            />
            <Route
              path='/scans/:id'
              element={
                <ProtectedRoute>
                  <ScanDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/workflows'
              element={
                <ProtectedRoute>
                  <Workflows />
                </ProtectedRoute>
              }
            />
            <Route
              path='/workflows/:id'
              element={
                <ProtectedRoute>
                  <WorkflowDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reports'
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reconnaissance'
              element={
                <ProtectedRoute>
                  <Reconnaissance />
                </ProtectedRoute>
              }
            />
            <Route
              path='/web3'
              element={
                <ProtectedRoute>
                  <SimplifiedWeb3Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/web3/dashboard'
              element={
                <ProtectedRoute>
                  <SimplifiedWeb3Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/web3/comprehensive'
              element={
                <ProtectedRoute>
                  <SimplifiedWeb3Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/web3/enhanced'
              element={
                <ProtectedRoute>
                  <EnhancedWeb3Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ai-analysis'
              element={
                <ProtectedRoute>
                  <AIAnalysis />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ai/live-demo'
              element={
                <ProtectedRoute>
                  <EliteAILiveDemonstration />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ai/capabilities'
              element={
                <ProtectedRoute>
                  <AICapabilitiesShowcase />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ai/testing'
              element={
                <ProtectedRoute>
                  <InteractiveAITesting />
                </ProtectedRoute>
              }
            />
            <Route
              path='/ai/complete'
              element={
                <ProtectedRoute>
                  <CompleteEliteAI />
                </ProtectedRoute>
              }
            />
            <Route
              path='/bugbounty'
              element={
                <ProtectedRoute>
                  <BugBountyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/workflows/orchestrator'
              element={
                <ProtectedRoute>
                  <WorkflowOrchestrator />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reports/advanced'
              element={
                <ProtectedRoute>
                  <AdvancedReportingDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/reconnaissance/enhanced'
              element={
                <ProtectedRoute>
                  <EnhancedSudomyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path='/advanced-reports'
              element={
                <ProtectedRoute>
                  <AdvancedReports />
                </ProtectedRoute>
              }
            />
            <Route
              path='/performance'
              element={
                <ProtectedRoute>
                  <PerformanceMonitoring />
                </ProtectedRoute>
              }
            />
            <Route
              path='/tools'
              element={
                <ProtectedRoute>
                  <ComprehensiveSecurityTools />
                </ProtectedRoute>
              }
            />
            <Route
              path='/tools/legacy'
              element={
                <ProtectedRoute>
                  <SecurityTools />
                </ProtectedRoute>
              }
            />
            <Route
              path='/settings'
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path='*' element={<Navigate to='/dashboard' replace />} />
            </Routes>
          </div>
        </div>
      </ProfessionalLayout>
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={bugBountyTheme}>
        <CssBaseline />
        <ErrorBoundary>
          <AuthProvider>
            <Router>
              <AppContent />
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
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;