import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  LinearProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton

} from '@mui/material';
import {
  Speed as PerformanceIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { performanceAPI } from '../../services/api';

const PerformanceMonitoring = () => {
  const [performanceStats, setPerformanceStats] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [databasePerformance, setDatabasePerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchAllMetrics();
    const interval = setInterval(fetchAllMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAllMetrics = async () => {
    try {
      setLoading(true);

      // Mock data for performance metrics
      setPerformanceStats({
        cpu_usage: 45.2,
        memory_usage: 68.7,
        disk_usage: 34.1,
        network_io: {
          incoming: 1250,
          outgoing: 890
        },
        response_times: {
          avg: 245,
          p95: 450,
          p99: 680
        },
        active_connections: 127,
        requests_per_minute: 1840
      });

      setSystemMetrics({
        uptime: '7 days, 14 hours',
        load_average: [1.2, 1.5, 1.8],
        processes: 245,
        threads: 1240,
        file_descriptors: 890,
        swap_usage: 12.3
      });

      setDatabasePerformance({
        connection_pool: {
          active: 15,
          idle: 5,
          max: 20
        },
        query_performance: {
          avg_query_time: 45,
          slow_queries: 3,
          total_queries: 15420
        },
        cache_hit_ratio: 94.2,
        index_efficiency: 87.5
      });

      setLastUpdate(new Date());
    } catch (error) {
      // logger.error('Error fetching performance metrics:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizePerformance = async () => {
    try {
      await performanceAPI.optimizePerformance();
      alert('Performance optimization initiated');
      fetchAllMetrics();
    } catch (error) {
      // logger.error('Error optimizing performance:', error); // TODO: Implement client-side logging
    }
  };

  const getUsageColor = (percentage) => {
    if (percentage > 80) return 'error';
    if (percentage > 60) return 'warning';
    return 'success';
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    };

  if (loading && !performanceStats) {
    return (
      <Container maxWidth='lg'>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading performance metrics...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Performance Monitoring
          </Typography>
          <Box>
            <IconButton onClick={fetchAllMetrics} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant='contained'
              startIcon={<TrendingUpIcon />}
              onClick={handleOptimizePerformance}
              sx={{ ml: 1 }}
            >
              Optimize
            </Button>
          </Box>
        </Box>
        <Typography variant='body2' color='text.secondary' gutterBottom>
          Last updated: {lastUpdate.toLocaleString()}
        </Typography>
        {/* System Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={1}>
                  <PerformanceIcon color='primary' />
                  <Typography variant='h6' sx={{ ml: 1 }}>CPU Usage</Typography>
                </Box>
                <Typography variant='h4' color={getUsageColor(performanceStats?.cpu_usage)}>
                  {performanceStats?.cpu_usage}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={performanceStats?.cpu_usage}
                  color={getUsageColor(performanceStats?.cpu_usage)}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={1}>
                  <MemoryIcon color='primary' />
                  <Typography variant='h6' sx={{ ml: 1 }}>Memory</Typography>
                </Box>
                <Typography variant='h4' color={getUsageColor(performanceStats?.memory_usage)}>
                  {performanceStats?.memory_usage}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={performanceStats?.memory_usage}
                  color={getUsageColor(performanceStats?.memory_usage)}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={1}>
                  <StorageIcon color='primary' />
                  <Typography variant='h6' sx={{ ml: 1 }}>Disk Usage</Typography>
                </Box>
                <Typography variant='h4' color={getUsageColor(performanceStats?.disk_usage)}>
                  {performanceStats?.disk_usage}%
                </Typography>
                <LinearProgress
                  variant='determinate'
                  value={performanceStats?.disk_usage}
                  color={getUsageColor(performanceStats?.disk_usage)}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display='flex' alignItems='center' mb={1}>
                  <NetworkIcon color='primary' />
                  <Typography variant='h6' sx={{ ml: 1 }}>Connections</Typography>
                </Box>
                <Typography variant='h4' color='primary'>
                  {performanceStats?.active_connections}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Active connections
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Response Times */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Response Times
                </Typography>
                <TableContainer>
                  <Table size='small'>
                    <TableBody>
                      <TableRow>
                        <TableCell>Average</TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={`${performanceStats?.response_times?.avg}ms`}
                            color={performanceStats?.response_times?.avg > 500 ? 'error' : 'success'}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>95th Percentile</TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={`${performanceStats?.response_times?.p95}ms`}
                            color={performanceStats?.response_times?.p95 > 1000 ? 'error' : 'warning'}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>99th Percentile</TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={`${performanceStats?.response_times?.p99}ms`}
                            color={performanceStats?.response_times?.p99 > 2000 ? 'error' : 'warning'}
                            size='small'
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Network I/O
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Incoming: {formatBytes(performanceStats?.network_io?.incoming * 1024)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Outgoing: {formatBytes(performanceStats?.network_io?.outgoing * 1024)}
                  </Typography>
                </Box>
                <Typography variant='h6' gutterBottom>
                  Requests/Minute
                </Typography>
                <Typography variant='h4' color='primary'>
                  {performanceStats?.requests_per_minute?.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Database Performance */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Database Performance
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant='subtitle1' gutterBottom>
                  Connection Pool
                </Typography>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableBody>
                      <TableRow>
                        <TableCell>Active</TableCell>
                        <TableCell align='right'>{databasePerformance?.connection_pool?.active}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Idle</TableCell>
                        <TableCell align='right'>{databasePerformance?.connection_pool?.idle}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Max</TableCell>
                        <TableCell align='right'>{databasePerformance?.connection_pool?.max}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant='subtitle1' gutterBottom>
                  Query Performance
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant='body2'>
                    Avg Query Time: {databasePerformance?.query_performance?.avg_query_time}ms
                  </Typography>
                  <Typography variant='body2'>
                    Slow Queries: {databasePerformance?.query_performance?.slow_queries}
                  </Typography>
                  <Typography variant='body2'>
                    Total Queries: {databasePerformance?.query_performance?.total_queries?.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant='subtitle1' gutterBottom>
                  Cache & Index Performance
                </Typography>
                <Box sx={{ mb: 1 }}>
                  <Typography variant='body2'>
                    Cache Hit Ratio:
                    <Chip
                      label={`${databasePerformance?.cache_hit_ratio}%`}
                      color={databasePerformance?.cache_hit_ratio > 90 ? 'success' : 'warning'}
                      size='small'
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                  <Typography variant='body2' sx={{ mt: 1 }}>
                    Index Efficiency:
                    <Chip
                      label={`${databasePerformance?.index_efficiency}%`}
                      color={databasePerformance?.index_efficiency > 85 ? 'success' : 'warning'}
                      size='small'
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {/* System Information */}
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              System Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant='body2'><strong>Uptime:</strong> {systemMetrics?.uptime}</Typography>
                <Typography variant='body2'><strong>Processes:</strong> {systemMetrics?.processes}</Typography>
                <Typography variant='body2'><strong>Threads:</strong> {systemMetrics?.threads}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant='body2'>
                  <strong>Load Average:</strong> {systemMetrics?.load_average?.join(', ')}
                </Typography>
                <Typography variant='body2'>
                  <strong>File Descriptors:</strong> {systemMetrics?.file_descriptors}
                </Typography>
                <Typography variant='body2'>
                  <strong>Swap Usage:</strong> {systemMetrics?.swap_usage}%
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default PerformanceMonitoring;