import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  Slider,
  Divider
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Visibility,
  GetApp,
  Settings,
  Search,
  Security,
  Speed,
  Timeline,
  TrendingUp,
  ExpandMore,
  FilterList,
  Map,
  Dns,
  Language,
  Storage,
  CloudQueue,
  VpnKey,
  BugReport,
  Assessment
} from '@mui/icons-material';
import { enhancedSudomyAPI } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`sudomy-tabpanel-${index}`}
      aria-labelledby={`sudomy-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedSudomyDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [scans, setScans] = useState([]);
  const [techniques, setTechniques] = useState([]);
  const [activeScans, setActiveScans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [scanDialog, setScanDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);
  const [techniqueDialog, setTechniqueDialog] = useState(false);

  // Form states
  const [scanForm, setScanForm] = useState({
    target: '',
    scanName: '',
    techniques: {
      passive: true,
      active: false,
      bruteforce: false,
      permutation: true,
      alteration: true,
      certificate: true,
      dns: true,
      web: true,
      social: false
    },
    intensity: 3,
    timeout: 30,
    threads: 10,
    wordlists: ['common', 'medium'],
    outputFormat: 'json',
    notifications: true
  });

  const [advancedConfig, setAdvancedConfig] = useState({
    maxDepth: 5,
    rateLimiting: true,
    userAgent: 'Enhanced-Sudomy/2.0',
    proxy: '',
    customHeaders: {},
    excludePatterns: [],
    includePatterns: [],
    apiKeys: {
      shodan: '',
      virustotal: '',
      securitytrails: '',
      censys: ''
    }
  });

  // Results state
  const [scanResults, setScanResults] = useState({});

  useEffect(() => {
    loadSudomyData();
  }, []);

  const loadSudomyData = async () => {
    setLoading(true);
    try {
      const techniquesRes = await enhancedSudomyAPI.getAdvancedTechniques();
      setTechniques(techniquesRes.data);

      // Mock scan data
      setScans([
        {
          id: 1,
          name: 'example.com Deep Scan',
          target: 'example.com',
          status: 'completed',
          progress: 100,
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date().toISOString(),
          subdomains: 156,
          techniques: ['passive', 'certificate', 'dns'],
          findings: {
            total: 156,
            active: 142,
            vulnerable: 8,
            interesting: 23
          }
        },
        {
          id: 2,
          name: 'testcorp.com Comprehensive',
          target: 'testcorp.com',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 1800000).toISOString(),
          endTime: null,
          subdomains: 89,
          techniques: ['passive', 'active', 'bruteforce'],
          findings: {
            total: 89,
            active: 76,
            vulnerable: 3,
            interesting: 12
          }
        }
      ]);

      setActiveScans([
        {
          id: 2,
          name: 'testcorp.com Comprehensive',
          target: 'testcorp.com',
          progress: 65,
          currentTechnique: 'DNS Bruteforce',
          eta: '15 minutes'
        }
      ]);

    } catch (error) {
      // logger.error('Error loading Sudomy data:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = async () => {
    try {
      const scanData = {
        target: scanForm.target,
        name: scanForm.scanName,
        config: {
          techniques: Object.keys(scanForm.techniques).filter(t => scanForm.techniques[t]),
          intensity: scanForm.intensity,
          timeout: scanForm.timeout,
          threads: scanForm.threads,
          wordlists: scanForm.wordlists,
          outputFormat: scanForm.outputFormat
        },
        advanced: advancedConfig
      };

      const response = await enhancedSudomyAPI.startEnhancedScan(scanData);
      setScanDialog(false);

      // Add to active scans
      const newScan = {
        id: Date.now(),
        name: scanForm.scanName,
        target: scanForm.target,
        status: 'running',
        progress: 0,
        startTime: new Date().toISOString(),
        techniques: Object.keys(scanForm.techniques).filter(t => scanForm.techniques[t])
      };

      setScans(prev => [newScan, ...prev]);
      setActiveScans(prev => [{ ...newScan, currentTechnique: 'Initializing', eta: 'Calculating...' }, ...prev]);

      // Reset form
      setScanForm({
        target: '',
        scanName: '',
        techniques: {
          passive: true,
          active: false,
          bruteforce: false,
          permutation: true,
          alteration: true,
          certificate: true,
          dns: true,
          web: true,
          social: false
        },
        intensity: 3,
        timeout: 30,
        threads: 10,
        wordlists: ['common', 'medium'],
        outputFormat: 'json',
        notifications: true
      });

    } catch (error) {
      // logger.error('Error starting scan:', error); // TODO: Implement client-side logging
    }
  };

  const handleStopScan = async (scanId) => {
    try {
      // Mock stop scan
      setScans(prev => prev.map(s =>
        s.id === scanId ? { ...s, status: 'stopped' } : s
      ));
      setActiveScans(prev => prev.filter(s => s.id !== scanId)
    } catch (error) {
      // logger.error('Error stopping scan:', error); // TODO: Implement client-side logging
    }
  };

  const handleViewResults = async (scanId) => {
    try {
      const response = await enhancedSudomyAPI.getEnhancedResults(scanId);
      setScanResults(prev => ({
        ...prev,
        [scanId]: response.data
      })
    } catch (error) {
      // logger.error('Error fetching results:', error); // TODO: Implement client-side logging
    }
  };

  const handleSaveConfig = async () => {
    try {
      await enhancedSudomyAPI.configureAdvanced(advancedConfig);
      setConfigDialog(false);
    } catch (error) {
      // logger.error('Error saving config:', error); // TODO: Implement client-side logging
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'stopped': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTechniqueIcon = (technique) => {
    switch (technique) {
      case 'passive': return <Search />
      case 'active': return <Security />
      case 'dns': return <Dns />
      case 'certificate': return <VpnKey />
      case 'bruteforce': return <Speed />
      case 'web': return <Language />
      default: return <Assessment />
    }
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box display='flex' justifyContent='between' alignItems='center' mb={3}>
        <Typography variant='h4' component='h1' gutterBottom>
          🔍 Enhanced Sudomy Dashboard
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<PlayArrow />}
            onClick={() => setScanDialog(true)}
            sx={{ mr: 1 }}
          >
            Start Enhanced Scan
          </Button>
          <Button
            variant='outlined'
            startIcon={<Settings />}
            onClick={() => setConfigDialog(true)}
            sx={{ mr: 1 }}
          >
            Advanced Config
          </Button>
          <IconButton onClick={loadSudomyData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Search color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Total Scans
                  </Typography>
                  <Typography variant='h4'>
                    {scans.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Timeline color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Active Scans
                  </Typography>
                  <Typography variant='h4'>
                    {activeScans.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Dns color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Subdomains Found
                  </Typography>
                  <Typography variant='h4'>
                    {scans.reduce((sum, s) => sum + (s.subdomains || 0), 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <BugReport color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Vulnerabilities
                  </Typography>
                  <Typography variant='h4'>
                    {scans.reduce((sum, s) => sum + (s.findings?.vulnerable || 0), 0)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Active Scans Alert */}
      {activeScans.length > 0 && (
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='subtitle1' gutterBottom>
            {activeScans.length} scan(s) currently running
          </Typography>
          {activeScans.map((scan) => (
            <Box key={scan.id} sx={{ mt: 1 }}>
              <Box display='flex' justifyContent='between' alignItems='center'>
                <Typography variant='body2'>
                  {scan.name} - {scan.currentTechnique}
                </Typography>
                <Typography variant='caption'>
                  ETA: {scan.eta}
                </Typography>
              </Box>
              <LinearProgress variant='determinate' value={scan.progress} sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Scan History' />
            <Tab label='Techniques' />
            <Tab label='Results Analysis' />
            <Tab label='Performance' />
          </Tabs>
        </Box>
        {/* Scan History Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scan Name</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Techniques</TableCell>
                  <TableCell>Subdomains</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell>{scan.name}</TableCell>
                    <TableCell>{scan.target}</TableCell>
                    <TableCell>
                      <Chip
                        label={scan.status}
                        color={getStatusColor(scan.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <LinearProgress
                          variant='determinate'
                          value={scan.progress}
                          sx={{ width: 80, mr: 1 }}
                        />
                        <Typography variant='body2'>
                          {scan.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        {scan.techniques?.map((tech) => (
                          <Chip
                            key={tech}
                            icon={getTechniqueIcon(tech)}
                            label={tech}
                            size='small'
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>{scan.subdomains || 0}</TableCell>
                    <TableCell>
                      {scan.endTime ?
                        `${Math.round((new Date(scan.endTime) - new Date(scan.startTime)) / 60000)}m` :
                        'Running...';
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Results'>
                        <IconButton
                          size='small'
                          onClick={() => handleViewResults(scan.id)}
                          disabled={scan.status === 'running'}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Download'>
                        <IconButton
                          size='small'
                          disabled={scan.status === 'running'}
                        >
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                      {scan.status === 'running' && (
                        <Tooltip title='Stop Scan'>
                          <IconButton
                            size='small'
                            onClick={() => handleStopScan(scan.id)}
                          >
                            <Stop />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Techniques Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Passive Techniques
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Search /></ListItemIcon>
                      <ListItemText
                        primary='Search Engine Discovery'
                        secondary='Google, Bing, DuckDuckGo dorking'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><VpnKey /></ListItemIcon>
                      <ListItemText
                        primary='Certificate Transparency'
                        secondary='CT logs analysis'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Dns /></ListItemIcon>
                      <ListItemText
                        primary='DNS Records'
                        secondary='Zone transfers, AXFR'
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Active Techniques
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Speed /></ListItemIcon>
                      <ListItemText
                        primary='DNS Bruteforce'
                        secondary='Wordlist-based enumeration'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Language /></ListItemIcon>
                      <ListItemText
                        primary='Web Crawling'
                        secondary='Spider and link analysis'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Security /></ListItemIcon>
                      <ListItemText
                        primary='Port Scanning'
                        secondary='Service discovery'
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        {/* Results Analysis Tab */}
        <TabPanel value={tabValue} index={2}>
          {Object.keys(scanResults).length > 0 ? (
            Object.entries(scanResults).map(([scanId, results]) => (
              <Accordion key={scanId}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant='h6'>
                    Scan Results - {scans.find(s => s.id.toString() === scanId)?.name}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant='subtitle1' gutterBottom>
                        Discovery Summary
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary='Total Subdomains'
                            secondary={results.total || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Active Hosts'
                            secondary={results.active || 0}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary='Vulnerable Services'
                            secondary={results.vulnerable || 0}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant='subtitle1' gutterBottom>
                        Top Findings
                      </Typography>
                      <TableContainer>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>Subdomain</TableCell>
                              <TableCell>IP Address</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Services</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow>
                              <TableCell>api.example.com</TableCell>
                              <TableCell>192.168.1.100</TableCell>
                              <TableCell>
                                <Chip label='Active' color='success' size='small' />
                              </TableCell>
                              <TableCell>HTTP, HTTPS</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>admin.example.com</TableCell>
                              <TableCell>192.168.1.101</TableCell>
                              <TableCell>
                                <Chip label='Vulnerable' color='error' size='small' />
                              </TableCell>
                              <TableCell>HTTP, SSH</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ));
          ) : (
            <Alert severity='info'>
              No detailed results available. Run a scan and view results to see analysis here.
            </Alert>
          )}
        </TabPanel>
        {/* Performance Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Scan Performance Metrics
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Speed /></ListItemIcon>
                      <ListItemText
                        primary='Average Scan Time'
                        secondary='45 minutes'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><TrendingUp /></ListItemIcon>
                      <ListItemText
                        primary='Discovery Rate'
                        secondary='3.2 subdomains/minute'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Assessment /></ListItemIcon>
                      <ListItemText
                        primary='Success Rate'
                        secondary='94.5%'
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Technique Effectiveness
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2'>Passive Discovery</Typography>
                    <LinearProgress variant='determinate' value={85} />
                    <Typography variant='caption'>85% effective</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2'>DNS Bruteforce</Typography>
                    <LinearProgress variant='determinate' value={72} />
                    <Typography variant='caption'>72% effective</Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant='body2'>Certificate Analysis</Typography>
                    <LinearProgress variant='determinate' value={91} />
                    <Typography variant='caption'>91% effective</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
      {/* Start Scan Dialog */}
      <Dialog open={scanDialog} onClose={() => setScanDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Start Enhanced Sudomy Scan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Target Domain'
                value={scanForm.target}
                onChange={(e) => setScanForm({ ...scanForm, target: e.target.value })}
                placeholder='example.com'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Scan Name'
                value={scanForm.scanName}
                onChange={(e) => setScanForm({ ...scanForm, scanName: e.target.value })}
                placeholder='My Enhanced Scan'
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                Reconnaissance Techniques
              </Typography>
              <FormGroup row>
                {Object.entries(scanForm.techniques).map(([technique, enabled]) => (
                  <FormControlLabel
                    key={technique}
                    control={
                      <Checkbox
                        checked={enabled}
                        onChange={(e) => setScanForm({
                          ...scanForm,
                          techniques: {
                            ...scanForm.techniques,
                            [technique]: e.target.checked
                          }
                        })}
                      />
                    }
                    label={technique.charAt(0).toUpperCase() + technique.slice(1)}
                  />
                ))}
              </FormGroup>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Scan Intensity</Typography>
              <Slider
                value={scanForm.intensity}
                onChange={(e, value) => setScanForm({ ...scanForm, intensity: value })}
                min={1}
                max={5}
                marks
                valueLabelDisplay='auto'
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Timeout (seconds)'
                type='number'
                value={scanForm.timeout}
                onChange={(e) => setScanForm({ ...scanForm, timeout: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label='Threads'
                type='number'
                value={scanForm.threads}
                onChange={(e) => setScanForm({ ...scanForm, threads: parseInt(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialog(false)}>Cancel</Button>
          <Button onClick={handleStartScan} variant='contained'>
            Start Scan
          </Button>
        </DialogActions>
      </Dialog>
      {/* Advanced Config Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Advanced Configuration</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Max Recursion Depth'
                type='number'
                value={advancedConfig.maxDepth}
                onChange={(e) => setAdvancedConfig({
                  ...advancedConfig,
                  maxDepth: parseInt(e.target.value)
                })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='User Agent'
                value={advancedConfig.userAgent}
                onChange={(e) => setAdvancedConfig({
                  ...advancedConfig,
                  userAgent: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={advancedConfig.rateLimiting}
                    onChange={(e) => setAdvancedConfig({
                      ...advancedConfig,
                      rateLimiting: e.target.checked
                    })}
                  />
                }
                label='Enable Rate Limiting'
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
                API Keys (Optional)
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(advancedConfig.apiKeys).map(([service, key]) => (
                  <Grid item xs={12} md={6} key={service}>
                    <TextField
                      fullWidth
                      label={`${service.charAt(0).toUpperCase() + service.slice(1)} API Key`}
                      value={key}
                      onChange={(e) => setAdvancedConfig({
                        ...advancedConfig,
                        apiKeys: {
                          ...advancedConfig.apiKeys,
                          [service]: e.target.value
                        }
                      })}
                      type='password'
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveConfig} variant='contained'>
            Save Configuration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedSudomyDashboard;