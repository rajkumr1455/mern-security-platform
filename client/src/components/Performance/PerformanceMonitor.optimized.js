import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';


const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    renderTime: 0
  });

  useEffect(() => {
    // Measure initial load time
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart

    // Get memory usage (if available)
    const memoryUsage = performance.memory ? performance.memory.usedJSHeapSize : 0

    // Measure render time
    const renderTime = performance.now();

    setMetrics({
      loadTime: Math.round(loadTime),
      bundleSize: 0, // Would need to be calculated
      memoryUsage: Math.round(memoryUsage / 1024 / 1024), // Convert to MB
      renderTime: Math.round(renderTime)
    });
  }, []);

  return (
    <Box p={2}>
      <Typography variant='h6' gutterBottom>
        Performance Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Load Time
              </Typography>
              <Typography variant='h5'>
                {metrics.loadTime}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Memory Usage
              </Typography>
              <Typography variant='h5'>
                {metrics.memoryUsage}MB
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color='textSecondary' gutterBottom>
                Render Time
              </Typography>
              <Typography variant='h5'>
                {metrics.renderTime}ms
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceMonitor;