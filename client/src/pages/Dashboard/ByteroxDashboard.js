import React, { useState, useEffect } from 'react';
import {
  Grid,
  Container,
  Typography,
  Box,
  Paper,
  LinearProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent

} from '@mui/material';
import DashboardErrorBoundary from '../../components/ErrorBoundary/DashboardErrorBoundary';
import {
  Warning,
  CheckCircle,
  Refresh,
  Shield,
  BugReport,
  Speed,
  NetworkCheck,
  TrendingUp,
  TrendingDown,
  Visibility,
  PlayArrow,
  Stop,
  RestartAlt,
  Security

} from '@mui/icons-material';
import SecurityBadge from '../../components/Enhanced/SecurityBadge';
import { enhancedWeb3API } from '../../services/api';
import logger from '../../utils/logger';

const BugBountyDashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 2847,
    activeThreats: 5,
    vulnerabilities: 18,
    secureAssets: 234,
    lastScanTime: '3 minutes ago',
    systemHealth: 96.8
  });

  const [recentScans, setRecentScans] = useState([
    {
      id: 1,
      target: 'api.production.com',
      type: 'Web2 Security Scan',
      status: 'completed',
      severity: 'high',
      vulnerabilities: 5,
      timestamp: '8 minutes ago',
      progress: 100
    },
    {
      id: 2,
      target: '0x742d35Cc6634C0532925a3b8D',
      type: 'Smart Contract Audit',
      status: 'scanning',
      severity: 'critical',
      vulnerabilities: 2,
      timestamp: '15 minutes ago',
      progress: 45,
      currentStep: 'Static Analysis',
      steps: ['Contract Validation', 'Static Analysis', 'Dynamic Testing', 'Gas Optimization', 'Security Report']
    },
    {
      id: 3,
      target: 'webapp.enterprise.com',
      type: 'Full Stack Assessment',
      status: 'completed',
      severity: 'medium',
      vulnerabilities: 3,
      timestamp: '1 hour ago',
      progress: 100
    },
    {
      id: 4,
      target: 'mobile.app.security',
      type: 'Mobile Security',
      status: 'completed',
      severity: 'low',
      vulnerabilities: 1,
      timestamp: '2 hours ago',
      progress: 100
    }
  ]);

  // Workflow progression for scanning contracts
  useEffect(() => {
    const interval = setInterval(() => {
      setRecentScans(prevScans =>
        prevScans.map(scan => {
          if (scan.status === 'scanning' && scan.progress < 100) {
            const newProgress = Math.min(scan.progress + Math.random() * 5 + 2, 100);
            const stepIndex = Math.floor((newProgress / 100) * scan.steps.length);
            const currentStep = scan.steps[stepIndex] || scan.steps[scan.steps.length - 1];

            // Complete the scan when it reaches 100%
            if (newProgress >= 100) {
              return {
                ...scan,
                progress: 100,
                status: 'completed',
                currentStep: 'Completed',
                vulnerabilities: scan.vulnerabilities + Math.floor(Math.random() * 3)
              };
            }

            return {
              ...scan,
              progress: newProgress,
              currentStep: currentStep
            };
          }
          return scan
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshData = (event) => {
    // Prevent any event bubbling or unintended triggers
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    logger.info('Refresh button clicked'); // Debug log
    setStats(prev => ({
      ...prev,
      lastScanTime: 'Just now',
      systemHealth: Math.min(100, prev.systemHealth + Math.random() * 3 - 1)
    }));
  };

  const restartStuckScan = (scanId) => {
    setRecentScans(prevScans =>
      prevScans.map(scan => {
        if (scan.id === scanId && scan.status === 'scanning') {
          return {
            ...scan,
            progress: 0,
            currentStep: scan.steps[0],
            status: 'scanning',
            timestamp: 'Just now'
          };
        }
        return scan
      })
    );
  };

  const completeScan = (scanId) => {
    setRecentScans(prevScans =>
      prevScans.map(scan => {
        if (scan.id === scanId) {
          return {
            ...scan,
            progress: 100,
            status: 'completed',
            currentStep: 'Completed',
            vulnerabilities: scan.vulnerabilities + Math.floor(Math.random() * 3)
          };
        }
        return scan
      })
    );
  };

  const startWeb3Analysis = async (contractAddress) => {
    try {
      logger.info('Starting Web3 analysis for:', contractAddress);
      const response = await enhancedWeb3API.analyzeContract({
        address: contractAddress,
        network: 'ethereum'
      });

      if (response.data.success) {
        // Update the scan with real analysis data
        setRecentScans(prevScans =>
          prevScans.map(scan => {
            if (scan.target === contractAddress) {
              return {
                ...scan,
                progress: 100,
                status: 'completed',
                currentStep: 'Analysis Complete',
                vulnerabilities: response.data.data.summary?.totalVulnerabilities || scan.vulnerabilities
              };
            }
            return scan
          })
        );
      }
    } catch (error) {
      logger.error('Error in Web3 analysis:', error);
    }
  };

  return (
    <DashboardErrorBoundary>
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* Bug Bounty Platform Header */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={5}>
        <Box>
          <Typography
            variant='h3'
            component='h1'
            className='text-gradient'
            sx={{
              fontWeight: 900,
              mb: 1,
              textShadow: '0 0 30px rgba(139, 92, 246, 0.5)'
            }}
          >
            🛡️ BYTEROX SECURITY COMMAND
          </Typography>
          <Typography variant='h6' sx={{
            color: 'var(--text-secondary)',
            fontWeight: 500,
            opacity: 0.9
          }}>
            Advanced Cybersecurity Monitoring & Threat Intelligence Platform
          </Typography>
        </Box>
        <Tooltip title='Refresh Security Data'>
          <IconButton
            onClick={refreshData}
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            sx={{
              width: 60,
              height: 60,
              background: 'var(--gradient-primary)',
              borderRadius: '12px',
              '&:hover': {
                transform: 'scale(1.1) rotate(180deg)',
                transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                background: 'var(--gradient-primary)'
              }
            }}
          >
            <Refresh sx={{ fontSize: '1.5rem', color: 'white' }} />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Main Security Stats Grid */}
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='byterox-card'>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box className='pricing-icon' sx={{ mb: 2 }}>
                <NetworkCheck sx={{ fontSize: '1.8rem', color: 'white' }} />
              </Box>
              <Typography variant='h4' className='pricing-price' sx={{ mb: 1 }}>
                {stats.totalScans.toLocaleString()}
              </Typography>
              <Typography variant='h6' sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.875rem',
                mb: 1
              }}>
                Total Security Scans
              </Typography>
              <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
                <TrendingUp sx={{ color: 'var(--success-color)', fontSize: '1rem' }} />
                <Typography variant='body2' sx={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  +24% this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='byterox-card'>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box className='pricing-icon' sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                boxShadow: '0 0 25px rgba(239, 68, 68, 0.4)'
              }}>
                <Warning sx={{ fontSize: '1.8rem', color: 'white' }} />
              </Box>
              <Typography variant='h4' className='pricing-price' sx={{
                mb: 1,
                color: '#ff6b6b !important',
                textShadow: '0 0 20px rgba(255, 107, 107, 0.5)'
              }}>
                {stats.activeThreats}
              </Typography>
              <Typography variant='h6' sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.875rem',
                mb: 1
              }}>
                Active Threats
              </Typography>
              <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
                <TrendingDown sx={{ color: 'var(--success-color)', fontSize: '1rem' }} />
                <Typography variant='body2' sx={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  -12% from last week
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='byterox-card'>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box className='pricing-icon' sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                boxShadow: '0 0 25px rgba(245, 158, 11, 0.4)'
              }}>
                <BugReport sx={{ fontSize: '1.8rem', color: 'white' }} />
              </Box>
              <Typography variant='h4' className='pricing-price' sx={{
                mb: 1,
                color: '#ffa726 !important',
                textShadow: '0 0 20px rgba(255, 167, 38, 0.5)'
              }}>
                {stats.vulnerabilities}
              </Typography>
              <Typography variant='h6' sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.875rem',
                mb: 1
              }}>
                Vulnerabilities
              </Typography>
              <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
                <TrendingDown sx={{ color: 'var(--success-color)', fontSize: '1rem' }} />
                <Typography variant='body2' sx={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  -31% resolved
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='byterox-card'>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box className='pricing-icon' sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
              }}>
                <Shield sx={{ fontSize: '1.8rem', color: 'white' }} />
              </Box>
              <Typography variant='h4' className='pricing-price' sx={{
                mb: 1,
                color: '#4ade80 !important',
                textShadow: '0 0 20px rgba(74, 222, 128, 0.5)'
              }}>
                {stats.secureAssets}
              </Typography>
              <Typography variant='h6' sx={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.875rem',
                mb: 1
              }}>
                Secure Assets
              </Typography>
              <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
                <TrendingUp sx={{ color: 'var(--success-color)', fontSize: '1rem' }} />
                <Typography variant='body2' sx={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  +18% protected
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Recent Scans and System Health */}
      <Grid container spacing={4} mb={5}>
        <Grid item xs={12} md={8}>
          <Paper className='byterox-card' sx={{ p: 4, height: '100%' }}>
            <Typography variant='h5' sx={{
              fontWeight: 800,
              color: 'var(--text-primary)',
              mb: 3,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              🔍 Recent Security Operations
            </Typography>
            <Box className='byterox-table'>
              {recentScans.map((scan) => (
                <Box
                  key={scan.id}
                  sx={{
                    p: 3,
                    borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(139, 92, 246, 0.05)',
                      transform: 'translateX(8px)'
                    }
                  }}
                >
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Box flex={1}>
                      <Typography variant='body1' sx={{
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.95rem',
                        mb: 0.5
                      }}>
                        {scan.target}
                      </Typography>
                      <Typography variant='body2' sx={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem'
                      }}>
                        {scan.type} • {scan.timestamp}
                        {scan.status === 'scanning' && scan.currentStep && (
                          <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                            {' • '}{scan.currentStep}
                          </span>
                        )}
                      </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                      <SecurityBadge severity={scan.severity} />
                      {scan.status === 'scanning' && (
                        <Box sx={{ width: 120, textAlign: 'center' }}>
                          <Typography variant='caption' sx={{
                            color: 'var(--primary-color)',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            mb: 0.5,
                            display: 'block'
                          }}>
                            {Math.round(scan.progress)}%
                          </Typography>
                          <LinearProgress
                            variant='determinate'
                            value={scan.progress}
                            className='byterox-progress'
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              '& .MuiLinearProgress-bar': {
                                background: 'var(--gradient-primary)',
                                transition: 'transform 0.5s ease'
                              }
                            }}
                          />
                        </Box>
                      )}
                      {scan.status === 'completed' && (
                        <CheckCircle sx={{
                          color: 'var(--success-color)',
                          fontSize: '1.5rem',
                          filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))'
                        }} />
                      )}
                      {scan.status === 'scanning' && (
                        <Box display='flex' gap={1}>
                          <Tooltip title='Complete Scan'>
                            <IconButton
                              size='small'
                              onClick={() => completeScan(scan.id)}
                              sx={{
                                color: 'var(--success-color)',
                                '&:hover': { background: 'rgba(16, 185, 129, 0.1)' }
                              }}
                            >
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                          {scan.type === 'Smart Contract Audit' && (
                            <Tooltip title='Run Web3 Analysis'>
                              <IconButton
                                size='small'
                                onClick={() => startWeb3Analysis(scan.target)}
                                sx={{
                                  color: 'var(--primary-color)',
                                  '&:hover': { background: 'rgba(139, 92, 246, 0.1)' }
                                }}
                              >
                                <Security />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title='Restart Scan'>
                            <IconButton
                              size='small'
                              onClick={() => restartStuckScan(scan.id)}
                              sx={{
                                color: 'var(--warning-color)',
                                '&:hover': { background: 'rgba(245, 158, 11, 0.1)' }
                              }}
                            >
                              <RestartAlt />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper className='byterox-card' sx={{ p: 4, height: '100%' }}>
            <Typography variant='h5' sx={{
              fontWeight: 800,
              color: 'var(--text-primary)',
              mb: 3,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ⚡ System Health Monitor
            </Typography>
            <Box mb={4}>
              <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                <Typography variant='body1' sx={{
                  color: 'var(--text-secondary)',
                  fontWeight: 600
                }}>
                  Overall Security Health
                </Typography>
                <Typography variant='h4' sx={{
                  color: 'var(--success-color)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  textShadow: '0 0 15px rgba(16, 185, 129, 0.5)'
                }}>
                  {stats.systemHealth.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={stats.systemHealth}
                className='byterox-progress'
                sx={{
                  height: 12,
                  borderRadius: 6,
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)'
                  }
                }}
              />
            </Box>
            <Box mb={4}>
              <Typography variant='body2' sx={{
                color: 'var(--text-muted)',
                mb: 2,
                fontSize: '0.875rem'
              }}>
                Last comprehensive scan: {stats.lastScanTime}
              </Typography>
              <button
                className='platform-btn platform-btn-primary'
                style={{ width: '100%', marginBottom: '1rem' }}
                onClick={refreshData}
              >
                <Speed sx={{ fontSize: '1.2rem' }} />
                Run Deep Security Scan
              </button>
              <button
                className='platform-btn platform-btn-secondary'
                style={{ width: '100%' }}
              >
                <Visibility sx={{ fontSize: '1.2rem' }} />
                View Detailed Report
              </button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </DashboardErrorBoundary>
  );
};

export default BugBountyDashboard;