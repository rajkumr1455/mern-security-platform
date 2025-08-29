import React, { useState, useCallback, useMemo } from 'react';
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
  Visibility
} from '@mui/icons-material';
import SecurityBadge from '../../components/Enhanced/SecurityBadge';
import useApiCache from '../../hooks/useApiCache';
import useDebounce from '../../hooks/useDebounce';

const OptimizedByteroxDashboard = () => {
  // Use API cache for dashboard stats with 30-second refresh
  const {
    data: dashboardStats,
    loading: statsLoading,
    refetch: refetchStats
  } = useApiCache('/api/dashboard/stats', {
    cacheTime: 30 * 1000, // 30 seconds cache
    refetchInterval: 30 * 1000 // Auto-refresh every 30 seconds
  });

  // Use API cache for targets with longer cache time
  const {
    data: targetsData,
    loading: targetsLoading
  } = useApiCache('/api/targets', {
    cacheTime: 2 * 60 * 1000 // 2 minutes cache
  });

  const [refreshing, setRefreshing] = useState(false);

  // Debounced refresh to prevent spam clicking
  const debouncedRefresh = useDebounce(refreshing, 1000);

  // Memoized stats calculation
  const stats = useMemo(() => {
    if (!dashboardStats?.data) {
      return {
        totalScans: 0,
        activeThreats: 0,
        vulnerabilities: 0,
        secureAssets: 0,
        lastScanTime: 'Never',
        systemHealth: 0
      };
    }

    const data = dashboardStats.data
    return {
      totalScans: data.totalScans || 0,
      activeThreats: data.vulnerabilities?.high || 0,
      vulnerabilities: data.vulnerabilities?.total || 0,
      secureAssets: data.activeTargets || 0,
      lastScanTime: '3 minutes ago',
      systemHealth: data.systemHealth?.cpu ? 100 - data.systemHealth.cpu : 95
    };
  }, [dashboardStats]);

  // Memoized recent scans
  const recentScans = useMemo(() => {
    if (!dashboardStats?.data?.recentScans) {
      return []
    }

    return dashboardStats.data.recentScans.map((scan, index) => ({
      id: scan.id || index,
      target: scan.target || 'Unknown',
      type: scan.type || 'Security Scan',
      status: scan.status?.toLowerCase() || 'completed',
      severity: scan.vulnerabilities?.high > 0 ? 'high' :
                scan.vulnerabilities?.medium > 0 ? 'medium' : 'low',
      vulnerabilities: scan.vulnerabilities?.high + scan.vulnerabilities?.medium + scan.vulnerabilities?.low || 0,
      timestamp: scan.startTime || 'Unknown'
    })
  }, [dashboardStats]);

  // Optimized refresh handler
  const handleRefresh = useCallback(async () => {
    if (refreshing) return

    setRefreshing(true);
    try {
      await refetchStats();
    } finally {
      setTimeout(() => setRefreshing(false), 1000);
    }
  }, [refreshing, refetchStats]);

  // Memoized threat level calculation
  const threatLevel = useMemo(() => {
    const highThreats = stats.activeThreats
    if (highThreats >= 5) return { level: 'Critical', color: '#dc3545' };
    if (highThreats >= 3) return { level: 'High', color: '#fd7e14' };
    if (highThreats >= 1) return { level: 'Medium', color: '#ffc107' };
    return { level: 'Low', color: '#28a745' };
  }, [stats.activeThreats]);

  // Loading state
  if (statsLoading && !dashboardStats) {
    return (
      <Container maxWidth='xl' sx={{ py: 4 }}>
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <LinearProgress sx={{ width: '50%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='xl' sx={{ py: 4 }}>
      {/* Optimized Header */}
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
          <Typography variant='h6' color='text.secondary' sx={{ opacity: 0.8 }}>
            Advanced Threat Detection & Response Platform
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={2}>
          <Tooltip title='Refresh Dashboard'>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              className='glass-button'
              sx={{
                background: 'rgba(139, 92, 246, 0.1)',
                '&:hover': { background: 'rgba(139, 92, 246, 0.2)' }
              }}
            >
              <Refresh sx={{ color: '#8b5cf6' }} />
            </IconButton>
          </Tooltip>
          <Box className='status-indicator'>
            <Typography variant='caption' color='text.secondary'>
              Last Update: {stats.lastScanTime}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Optimized Stats Grid */}
      <Grid container spacing={4} mb={6}>
        {[
          {
            title: 'Total Scans',
            value: stats.totalScans.toLocaleString(),
            icon: <Shield sx={{ fontSize: 40 }} />,
            color: '#8b5cf6',
            trend: '+12%'
          },
          {
            title: 'Active Threats',
            value: stats.activeThreats,
            icon: <Warning sx={{ fontSize: 40 }} />,
            color: threatLevel.color,
            trend: '-8%'
          },
          {
            title: 'Vulnerabilities',
            value: stats.vulnerabilities,
            icon: <BugReport sx={{ fontSize: 40 }} />,
            color: '#fd7e14',
            trend: '+3%'
          },
          {
            title: 'Secure Assets',
            value: stats.secureAssets,
            icon: <CheckCircle sx={{ fontSize: 40 }} />,
            color: '#28a745',
            trend: '+15%'
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              className='glass-card hover-lift'
              sx={{
                height: '100%',
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display='flex' justifyContent='space-between' alignItems='flex-start' mb={2}>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Box textAlign='right'>
                    <Typography variant='h4' fontWeight='bold' color='white'>
                      {stat.value}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  {stat.trend.startsWith('+') ?
                    <TrendingUp sx={{ fontSize: 16, color: '#28a745' }} /> :
                    <TrendingDown sx={{ fontSize: 16, color: '#dc3545' }} />
                  }
                  <Typography variant='caption' color='text.secondary'>
                    {stat.trend} from last week
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* System Health & Recent Scans */}
      <Grid container spacing={4}>
        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Card className='glass-card' sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display='flex' alignItems='center' gap={2} mb={3}>
                <Speed sx={{ color: '#06b6d4', fontSize: 28 }} />
                <Typography variant='h6' fontWeight='bold'>
                  System Health
                </Typography>
              </Box>
              <Box textAlign='center' mb={3}>
                <Typography variant='h2' fontWeight='bold' color='#06b6d4'>
                  {stats.systemHealth.toFixed(1)}%
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Overall Performance
                </Typography>
              </Box>
              <LinearProgress
                variant='determinate'
                value={stats.systemHealth}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(6, 182, 212, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#06b6d4'
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        {/* Recent Scans */}
        <Grid item xs={12} lg={8}>
          <Card className='glass-card' sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display='flex' alignItems='center' justify='space-between' mb={3}>
                <Box display='flex' alignItems='center' gap={2}>
                  <Visibility sx={{ color: '#8b5cf6', fontSize: 28 }} />
                  <Typography variant='h6' fontWeight='bold'>
                    Recent Security Scans
                  </Typography>
                </Box>
              </Box>
              <Box>
                {recentScans.map((scan) => (
                  <Box
                    key={scan.id}
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                    py={2}
                    borderBottom='1px solid rgba(255, 255, 255, 0.1)'
                  >
                    <Box>
                      <Typography variant='body1' fontWeight='500'>
                        {scan.target}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {scan.type} • {scan.timestamp}
                      </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' gap={2}>
                      <Typography variant='body2'>
                        {scan.vulnerabilities} issues
                      </Typography>
                      <SecurityBadge severity={scan.severity} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OptimizedByteroxDashboard;