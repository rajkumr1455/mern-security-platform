import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  
} from '@mui/icons-material';
  import {
    Visibility as EyeIcon,
  } from '@mui/icons-material';
  import {
    Security as ShieldIcon,
  } from '@mui/icons-material';
  import {
    Router as NetworkIcon,
  } from '@mui/icons-material';
  import {
    Camera as CameraIcon,
  } from '@mui/icons-material';
  import {
    BarChart as ChartIcon
  } from '@mui/icons-material';

const SudomyRecon = () => {
  const [targetDomain, setTargetDomain] = useState('');
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);

  // Fetch scan history and stats on component mount
  useEffect(() => {
    fetchScanHistory();
    fetchStats();
  }, []);

  // Poll for scan progress if there's an active scan
  useEffect(() => {
    let interval
    if (activeScanId && isScanning) {
      interval = setInterval(() => {
        fetchScanProgress(activeScanId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeScanId, isScanning]);

  const fetchScanHistory = async () => {
    try {
      const response = await fetch('/api/recon/sudomy/history');
      const data = await response.json();
      if (data.success) {
        setScanHistory(data.scans);
      }
    } catch (error) {
      // logger.error('Error fetching scan history:', error); // TODO: Implement client-side logging
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/recon/sudomy/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // logger.error('Error fetching stats:', error); // TODO: Implement client-side logging
    }
  };

  const fetchScanProgress = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/${scanId}/progress`);
      const data = await response.json();

      setScanProgress(data);

      if (data.status === 'completed') {
        setIsScanning(false);
        setScanStatus({
          type: 'success',
          message: `Sudomy scan completed! Found ${data.results?.subdomains_found || 0} subdomains.`
        });
        fetchScanResults(scanId);
        fetchScanHistory(); // Refresh history
        fetchStats(); // Refresh stats
      } else if (data.status === 'failed') {
        setIsScanning(false);
        setScanStatus({
          type: 'danger',
          message: 'Scan failed. Please try again.'
        });
      }
    } catch (error) {
      // logger.error('Error fetching scan progress:', error); // TODO: Implement client-side logging
    }
  };

  const fetchScanResults = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/${scanId}/results`);
      const data = await response.json();
      if (data.success) {
        setScanResults(data.results);
      }
    } catch (error) {
      // logger.error('Error fetching scan results:', error); // TODO: Implement client-side logging
    }
  };

  const startSudomyScan = async (e) => {
    e.preventDefault();

    if (!targetDomain.trim()) {
      setScanStatus({
        type: 'warning',
        message: 'Please enter a target domain.'
      });
      return
    }

    setIsScanning(true);
    setScanStatus({
      type: 'info',
      message: `Starting Sudomy scan for: ${targetDomain}`
    });
    setScanProgress(null);
    setScanResults(null);

    try {
      const response = await fetch('/api/recon/sudomy/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: targetDomain.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveScanId(data.scan_id);
        setScanStatus({
          type: 'success',
          message: data.message
        });
      } else {
        setIsScanning(false);
        setScanStatus({
          type: 'danger',
          message: data.message || 'Failed to start scan'
        });
      }
    } catch (error) {
      setIsScanning(false);
      setScanStatus({
        type: 'danger',
        message: `Error starting scan: ${error.message}`
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1 }} />
          Sudomy Reconnaissance
        </Typography>
      </Box>
      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2'>
                  {stats.total_scans}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Scans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2'>
                  {stats.total_subdomains}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Subdomains Found
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2'>
                  {stats.total_vulnerabilities}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Vulnerabilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2'>
                  {stats.active_scans}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Active Scans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Grid container spacing={3}>
        {/* Scan Form */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PlayIcon sx={{ mr: 1 }} />
                  Start Sudomy Scan
                </Box>
              }
            />
            <CardContent>
              <Box component='form' onSubmit={startSudomyScan} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label='Target Domain'
                  placeholder='example.com'
                  value={targetDomain}
                  onChange={(e) => setTargetDomain(e.target.value)}
                  disabled={isScanning}
                  fullWidth
                  variant='outlined'
                />
                <Button
                  type='submit'
                  variant='contained'
                  disabled={isScanning}
                  fullWidth
                  startIcon={isScanning ? <CircularProgress size={20} /> : <PlayIcon />}
                >
                  {isScanning ? 'Scanning...' : 'Start Sudomy Scan'}
                </Button>
              </Box>
              {/* Scan Status */}
              {scanStatus && (
                <Alert severity={scanStatus.type === 'danger' ? 'error' : scanStatus.type} sx={{ mt: 2 }}>
                  {scanStatus.message}
                </Alert>
              )}

              {/* Scan Progress */}
              {scanProgress && isScanning && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Progress: {scanProgress.progress}%</Typography>
                    <Typography variant='body2'>Phase: {scanProgress.current_phase + 1}/6</Typography>
                  </Box>
                  <LinearProgress
                    variant='determinate'
                    value={scanProgress.progress}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {scanProgress.current_phase_name}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Features */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShieldIcon sx={{ mr: 1 }} />
                  Sudomy Features
                </Box>
              }
            />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SearchIcon color='primary' />
                  </ListItemIcon>
                  <ListItemText primary='Advanced subdomain enumeration' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NetworkIcon color='success' />
                  </ListItemIcon>
                  <ListItemText primary='DNS resolution and validation' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CameraIcon color='info' />
                  </ListItemIcon>
                  <ListItemText primary='Screenshot capture' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <EyeIcon color='warning' />
                  </ListItemIcon>
                  <ListItemText primary='Port scanning integration' />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <ChartIcon color='error' />
                  </ListItemIcon>
                  <ListItemText primary='Comprehensive reporting' />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Scan Results */}
      {scanResults && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChartIcon sx={{ mr: 1 }} />
                  Scan Results
                </Box>
              }
            />
            <CardContent>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={`${scanResults.subdomains_found?.length || 0} Subdomains`}
                    color='primary'
                    sx={{ p: 1, width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={`${scanResults.vulnerabilities?.length || 0} Vulnerabilities`}
                    color='warning'
                    sx={{ p: 1, width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={`${scanResults.screenshots_captured || 0} Screenshots`}
                    color='info'
                    sx={{ p: 1, width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Chip
                    label={`${scanResults.ports_scanned?.length || 0} Ports Scanned`}
                    color='success'
                    sx={{ p: 1, width: '100%' }}
                  />
                </Grid>
              </Grid>
                {/* Subdomains Table */}
                {scanResults.subdomains_found && scanResults.subdomains_found.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant='h6' gutterBottom>Discovered Subdomains</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Subdomain</TableCell>
                            <TableCell>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scanResults.subdomains_found.map((subdomain, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{subdomain}</TableCell>
                              <TableCell>
                                <Chip label='Active' color='success' size='small' />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Vulnerabilities Table */}
                {scanResults.vulnerabilities && scanResults.vulnerabilities.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant='h6' gutterBottom>Vulnerabilities Found</Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Target</TableCell>
                            <TableCell>Description</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scanResults.vulnerabilities.map((vuln, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{vuln.type}</TableCell>
                              <TableCell>
                                <Chip
                                  label={vuln.severity}
                                  color={vuln.severity === 'High' ? 'error' : vuln.severity === 'Medium' ? 'warning' : 'info'}
                                  size='small'
                                />
                              </TableCell>
                              <TableCell>{vuln.subdomain}</TableCell>
                              <TableCell>{vuln.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ChartIcon sx={{ mr: 1 }} />
                  Recent Sudomy Scans
                </Box>
              }
            />
            <CardContent>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Target</TableCell>
                      <TableCell>Completed</TableCell>
                      <TableCell>Subdomains</TableCell>
                      <TableCell>Vulnerabilities</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scanHistory.slice(0, 10).map((scan, index) => (
                      <TableRow key={index}>
                        <TableCell>{scan.target}</TableCell>
                        <TableCell>{formatTimestamp(scan.completed)}</TableCell>
                        <TableCell>
                          <Chip label={scan.subdomains_found || 0} color='primary' size='small' />
                        </TableCell>
                        <TableCell>
                          <Chip label={scan.vulnerabilities_found || 0} color='warning' size='small' />
                        </TableCell>
                        <TableCell>
                          <Chip label={scan.status} color='success' size='small' />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default SudomyRecon;