import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  Speed,
  Memory,
  Storage,
  NetworkCheck
} from '@mui/icons-material';

const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    responseTime: 0,
    cacheHitRate: 0,
    activeConnections: 0,
    memoryUsage: 0,
    uptime: 0
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/security/performance');
        const data = await response.json();
        if (data.success) {
          setMetrics(data.data);
        }
      } catch (error) {
        // logger.error('Failed to fetch performance metrics:', error); // TODO: Implement client-side logging
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getPerformanceColor = (value, thresholds) => {
    if (value >= thresholds.good) return '#28a745';
    if (value >= thresholds.warning) return '#ffc107';
    return '#dc3545';
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign='center'>
              <Speed sx={{ fontSize: 40, color: '#8b5cf6', mb: 1 }} />
              <Typography variant='h4' fontWeight='bold'>
                {metrics.responseTime}ms
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Avg Response Time
              </Typography>
              <LinearProgress
                variant='determinate'
                value={Math.max(0, 100 - (metrics.responseTime / 10))}
                sx={{ mt: 1, height: 6, borderRadius: 3 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign='center'>
              <Memory sx={{ fontSize: 40, color: '#06b6d4', mb: 1 }} />
              <Typography variant='h4' fontWeight='bold'>
                {metrics.cacheHitRate}%
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Cache Hit Rate
              </Typography>
              <LinearProgress
                variant='determinate'
                value={metrics.cacheHitRate}
                sx={{
                  mt: 1,
                  height: 6,
                  borderRadius: 3,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getPerformanceColor(metrics.cacheHitRate, { good: 80, warning: 60 })
                  }
                }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign='center'>
              <NetworkCheck sx={{ fontSize: 40, color: '#28a745', mb: 1 }} />
              <Typography variant='h4' fontWeight='bold'>
                {metrics.activeConnections}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Active Connections
              </Typography>
              <Chip
                label={metrics.activeConnections < 50 ? 'Healthy' : 'High Load'}
                color={metrics.activeConnections < 50 ? 'success' : 'warning'}
                size='small'
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box textAlign='center'>
              <Storage sx={{ fontSize: 40, color: '#fd7e14', mb: 1 }} />
              <Typography variant='h4' fontWeight='bold'>
                {formatUptime(metrics.uptime)}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                System Uptime
              </Typography>
              <Chip
                label='Online'
                color='success'
                size='small'
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;