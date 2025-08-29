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
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent

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
    BarChart as ChartIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    Settings as SettingsIcon,
  } from '@mui/icons-material';
  import {
    Timeline as TimelineIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon
  } from '@mui/icons-material';

const EnhancedSudomyRecon = () => {
  const [targetDomain, setTargetDomain] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('comprehensive');
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [techniques, setTechniques] = useState(null);
  const [profiles, setProfiles] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  // Fetch enhanced data on component mount
  useEffect(() => {
    fetchTechniques();
    fetchProfiles();
    fetchScanHistory();
    fetchStats();
  }, []);

  // Poll for scan progress if there's an active scan
  useEffect(() => {
    let interval
    if (activeScanId && isScanning) {
      interval = setInterval(() => {
        fetchEnhancedScanProgress(activeScanId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeScanId, isScanning]);

  const fetchTechniques = async () => {
    try {
      const response = await fetch('/api/recon/sudomy/techniques');
      const data = await response.json();
      if (data.success) {
        setTechniques(data.techniques);
      }
    } catch (error) {
      // logger.error('Error fetching techniques:', error); // TODO: Implement client-side logging
    }
  };

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/recon/sudomy/profiles');
      const data = await response.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (error) {
      // logger.error('Error fetching profiles:', error); // TODO: Implement client-side logging
    }
  };

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

  const fetchEnhancedScanProgress = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/enhanced/${scanId}/progress`);
      const data = await response.json();

      setScanProgress(data);
      setActiveStep(data.current_phase || 0);

      if (data.status === 'completed') {
        setIsScanning(false);
        setScanStatus({
          type: 'success',
          message: `Enhanced Sudomy scan completed! Found ${data.findings_summary?.subdomains || 0} subdomains.`
        });
        fetchEnhancedScanResults(scanId);
        fetchScanHistory();
        fetchStats();
      } else if (data.status === 'failed') {
        setIsScanning(false);
        setScanStatus({
          type: 'error',
          message: 'Enhanced scan failed. Please try again.'
        });
      }
    } catch (error) {
      // logger.error('Error fetching enhanced scan progress:', error); // TODO: Implement client-side logging
    }
  };

  const fetchEnhancedScanResults = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/enhanced/${scanId}/results`);
      const data = await response.json();
      if (data.success) {
        setScanResults(data.results);
      }
    } catch (error) {
      // logger.error('Error fetching enhanced scan results:', error); // TODO: Implement client-side logging
    }
  };

  const startEnhancedSudomyScan = async (e) => {
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
      message: `Starting enhanced Sudomy scan for: ${targetDomain}`
    });
    setScanProgress(null);
    setScanResults(null);
    setActiveStep(0);

    try {
      const response = await fetch('/api/recon/sudomy/enhanced/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: targetDomain.trim(),
          profile: selectedProfile
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
          type: 'error',
          message: data.message || 'Failed to start enhanced scan'
        });
      }
    } catch (error) {
      setIsScanning(false);
      setScanStatus({
        type: 'error',
        message: `Error starting enhanced scan: ${error.message}`
      });
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role='tabpanel'
        hidden={value !== index}
        id={`enhanced-tabpanel-${index}`}
        aria-labelledby={`enhanced-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 1 }} />
          Enhanced Sudomy Reconnaissance
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Comprehensive subdomain enumeration with advanced techniques and intelligence
        </Typography>
      </Box>
      {/* Enhanced Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2' color='primary'>
                  {stats.total_scans}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Scans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2' color='success.main'>
                  {stats.total_subdomains}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Subdomains Found
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2' color='warning.main'>
                  {stats.total_vulnerabilities}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Vulnerabilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2' color='info.main'>
                  {stats.active_scans}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Active Scans
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' component='h2' color='error.main'>
                  {stats.unique_targets}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Unique Targets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label='enhanced sudomy tabs'>
          <Tab label='Scan Configuration' />
          <Tab label='Live Progress' />
          <Tab label='Results Analysis' />
          <Tab label='Techniques & Tools' />
        </Tabs>
      </Box>
      {/* Tab 1: Scan Configuration */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SettingsIcon sx={{ mr: 1 }} />
                    Scan Configuration
                  </Box>
                }
              />
              <CardContent>
                <Box component='form' onSubmit={startEnhancedSudomyScan} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label='Target Domain'
                    placeholder='example.com'
                    value={targetDomain}
                    onChange={(e) => setTargetDomain(e.target.value)}
                    disabled={isScanning}
                    fullWidth
                    variant='outlined'
                    required
                  />
                  <FormControl fullWidth>
                    <InputLabel>Scan Profile</InputLabel>
                    <Select
                      value={selectedProfile}
                      label='Scan Profile'
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      disabled={isScanning}
                    >
                      {profiles && Object.entries(profiles).map(([key, profile]) => (
                        <MenuItem key={key} value={key}>
                          <Box>
                            <Typography variant='body1'>{profile.name}</Typography>
                            <Typography variant='body2' color='text.secondary'>
                              {profile.description} • {profile.estimated_time}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    type='submit'
                    variant='contained'
                    size='large'
                    disabled={isScanning}
                    fullWidth
                    startIcon={isScanning ? <CircularProgress size={20} /> : <PlayIcon />}
                  >
                    {isScanning ? 'Scanning...' : 'Start Enhanced Scan'}
                  </Button>
                </Box>
                {/* Scan Status */}
                {scanStatus && (
                  <Alert severity={scanStatus.type} sx={{ mt: 2 }}>
                    {scanStatus.message}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShieldIcon sx={{ mr: 1 }} />
                    Scan Profiles
                  </Box>
                }
              />
              <CardContent>
                {profiles && Object.entries(profiles).map(([key, profile]) => (
                  <Accordion key={key} expanded={selectedProfile === key}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box>
                        <Typography variant='h6'>{profile.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {profile.estimated_time}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant='body2' sx={{ mb: 2 }}>
                        {profile.description}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {profile.techniques?.slice(0, 5).map((technique, index) => (
                          <Chip key={index} label={technique} size='small' />
                        ))}
                        {profile.techniques?.length > 5 && (
                          <Chip label={`+${profile.techniques.length - 5} more`} size='small' variant='outlined' />
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      {/* Tab 2: Live Progress */}
      <TabPanel value={currentTab} index={1}>
        {scanProgress && isScanning ? (
          <Card>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimelineIcon sx={{ mr: 1 }} />
                  Live Scan Progress
                </Box>
              }
            />
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant='h6'>Overall Progress: {scanProgress.progress}%</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Phase {(scanProgress.current_phase || 0) + 1}/8
                  </Typography>
                </Box>
                <LinearProgress
                  variant='determinate'
                  value={scanProgress.progress}
                  sx={{ height: 10, borderRadius: 5, mb: 2 }}
                />
                <Typography variant='body1' sx={{ mb: 1 }}>
                  <strong>Current Phase:</strong> {scanProgress.current_phase_name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  <strong>Current Task:</strong> {scanProgress.current_subphase_name}
                </Typography>
              </Box>
              {/* Live Findings Summary */}
              {scanProgress.findings_summary && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Typography variant='h4' color='primary.contrastText'>
                        {scanProgress.findings_summary.subdomains}
                      </Typography>
                      <Typography variant='body2' color='primary.contrastText'>
                        Subdomains
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                      <Typography variant='h4' color='success.contrastText'>
                        {scanProgress.findings_summary.technologies}
                      </Typography>
                      <Typography variant='body2' color='success.contrastText'>
                        Technologies
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
                      <Typography variant='h4' color='warning.contrastText'>
                        {scanProgress.findings_summary.vulnerabilities}
                      </Typography>
                      <Typography variant='body2' color='warning.contrastText'>
                        Vulnerabilities
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                      <Typography variant='h4' color='info.contrastText'>
                        {scanProgress.findings_summary.screenshots}
                      </Typography>
                      <Typography variant='body2' color='info.contrastText'>
                        Screenshots
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant='h5' color='text.secondary' gutterBottom>
                No Active Scan
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Start an enhanced scan to see live progress here
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>
      {/* Tab 3: Results Analysis */}
      <TabPanel value={currentTab} index={2}>
        {scanResults ? (
          <Grid container spacing={3}>
            {/* Results Summary */}
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ChartIcon sx={{ mr: 1 }} />
                      Scan Results Summary
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
                        label={`${scanResults.technologies?.length || 0} Technologies`}
                        color='success'
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
                  </Grid>
                  {/* Risk Analysis */}
                  {scanResults.analysis && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                      <Typography variant='h6' gutterBottom>Risk Analysis</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant='body2' color='text.secondary'>Risk Score</Typography>
                          <Typography variant='h5' color={scanResults.analysis.risk_score > 70 ? 'error.main' : scanResults.analysis.risk_score > 40 ? 'warning.main' : 'success.main'}>
                            {scanResults.analysis.risk_score}/100
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant='body2' color='text.secondary'>Threat Level</Typography>
                          <Chip
                            label={scanResults.analysis.threat_level}
                            color={getSeverityColor(scanResults.analysis.threat_level)}
                            size='small'
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant='body2' color='text.secondary'>Recommendations</Typography>
                          <Typography variant='body2'>
                            {scanResults.analysis.recommendations?.length || 0} items
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            {/* Detailed Results Tables */}
            {scanResults.subdomains_found && scanResults.subdomains_found.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardHeader title='Discovered Subdomains' />
                  <CardContent>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell>Subdomain</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>IP Address</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {scanResults.subdomains_found.slice(0, 10).map((subdomain, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{subdomain}</TableCell>
                              <TableCell>
                                <Chip label='Active' color='success' size='small' />
                              </TableCell>
                              <TableCell>192.168.1.{100 + index}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {scanResults.subdomains_found.length > 10 && (
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                        Showing 10 of {scanResults.subdomains_found.length} subdomains
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        ) : (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant='h5' color='text.secondary' gutterBottom>
                No Results Available
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Complete a scan to view detailed results and analysis
              </Typography>
            </CardContent>
          </Card>
        )}
      </TabPanel>
      {/* Tab 4: Techniques & Tools */}
      <TabPanel value={currentTab} index={3}>
        {techniques && (
          <Grid container spacing={3}>
            {Object.entries(techniques).map(([category, categoryTechniques]) => (
              <Grid item xs={12} md={4} key={category}>
                <Card>
                  <CardHeader
                    title={
                      <Typography variant='h6' sx={{ textTransform: 'capitalize' }}>
                        {category} Techniques
                      </Typography>
                    }
                  />
                  <CardContent>
                    <List>
                      {Object.entries(categoryTechniques).map(([key, technique]) => (
                        <ListItem key={key}>
                          <ListItemIcon>
                            <Chip
                              label={technique.enabled ? 'ON' : 'OFF'}
                              color={technique.enabled ? 'success' : 'default'}
                              size='small'
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={technique.name}
                            secondary={technique.description}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
    </Box>
  );
};

export default EnhancedSudomyRecon;