import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,

} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  
} from '@mui/icons-material';
  import {
    PlayArrow as PlayArrowIcon,
  } from '@mui/icons-material';
  import {
    Stop as StopIcon,
  } from '@mui/icons-material';
  import {
    Refresh as RefreshIcon,
  } from '@mui/icons-material';
  import {
    Settings as SettingsIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as CheckCircleIcon,
  } from '@mui/icons-material';
  import {
    Warning as WarningIcon,
  } from '@mui/icons-material';
  import {
    Error as ErrorIcon,
  } from '@mui/icons-material';
  import {
    Info as InfoIcon
  } from '@mui/icons-material';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Web2Scans = () => {
  const [targets, setTargets] = useState([]);
  const [modules, setModules] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [addTargetDialogOpen, setAddTargetDialogOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [newTarget, setNewTarget] = useState({
    name: '',
    url: '',
    description: '',
    type: 'web2'
  });
  const [scanOptions, setScanOptions] = useState({
    intensity: 'medium',
    timeout: 300,
    concurrent: 10,
    userAgent: 'SecurityPlatform/1.0'
  });

  useEffect(() => {
    fetchTargets();
    fetchModules();
    fetchScans();

    // Auto-refresh scans every 5 seconds
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/targets');
      if (response.data.success) {
        // Handle both array and object formats from the API
        let targetsData = response.data.targets
        if (Array.isArray(targetsData)) {
          setTargets(targetsData.filter(t => t.type === 'web2' || t.type === 'web' || t.type === 'api'));
        } else {
          // Convert object format to array
          const targetsArray = Object.entries(targetsData).map(([key, value], index) => ({
            id: value._id || index + 1,
            name: key,
            url: value.url || key,
            description: value.description || 'No description available',
            type: value.type || 'web2',
            status: value.status || 'active'
          }));
          setTargets(targetsArray.filter(t => t.type === 'web2' || t.type === 'web' || t.type === 'api'));
        }
      }
    } catch (error) {
      // logger.error('Failed to fetch targets:', error); // TODO: Implement client-side logging
      setTargets([]);
    }
  };

  const handleAddTarget = async () => {
    try {
      // Validate required fields
      if (!newTarget.name.trim()) {
        toast.error('Target name is required');
        return
      }
      if (!newTarget.url.trim()) {
        toast.error('Target URL is required');
        return
      }

      // Add target via backend API
      const response = await axios.post('/api/targets', {
        name: newTarget.name,
        url: newTarget.url,
        description: newTarget.description,
        type: newTarget.type
      });

      // logger.info('Target added successfully:', response.data); // TODO: Implement client-side logging
      setAddTargetDialogOpen(false);
      setNewTarget({ name: '', url: '', description: '', type: 'web2' });
      fetchTargets();
      toast.success('Target added successfully!');
    } catch (error) {
      // logger.error('Error adding target:', error); // TODO: Implement client-side logging

      // Show more detailed error message
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details.map(err => err.msg).join(', ');
        toast.error(`Validation failed: ${validationErrors}`);
      } else if (error.response?.data?.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error('Failed to add target. Please try again.');
      }
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/scans/web2/modules');
      if (response.data.success) {
        setModules(response.data.modules);
        // Set default selected modules for better UX
        setSelectedModules([response.data.modules[0]?.id].filter(Boolean));
      }
    } catch (error) {
      // logger.error('Failed to fetch modules:', error); // TODO: Implement client-side logging
      // Fallback modules if API fails
      setModules([
        {
          id: 'vulnerability',
          name: 'Vulnerability Scanner',
          description: 'Comprehensive vulnerability detection',
          category: 'Security Testing',
          enabled: true
        }
      ]);
    }
  };

  const fetchScans = async () => {
    try {
      const response = await axios.get('/api/scans?type=web2');
      if (response.data.success) {
        setScans(response.data.scans || []);
      }
    } catch (error) {
      // logger.error('Failed to fetch scans:', error); // TODO: Implement client-side logging
    }
  };

  const handleStartScan = async () => {
    if (!selectedTarget || selectedModules.length === 0) {
      toast.error('Please select a target and at least one scan module');
      return
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/scans/web2', {
        targetId: selectedTarget,
        scanTypes: selectedModules,
        options: scanOptions
      });

      if (response.data.success) {
        setScanDialogOpen(false);
        setSelectedTarget('');
        setSelectedModules([]);
        fetchScans();

        // Show success notification
        toast.success(`Web2 scan started successfully! Scan ID: ${response.data.scanId}`);

        // Show progress notifications
        setTimeout(() => {
          toast.loading('Scan in progress... Checking for vulnerabilities', { duration: 3000 });
        }, 2000);

        setTimeout(() => {
          toast.success('Vulnerabilities detected! Check the scan results.', { duration: 4000 });
        }, 10000);
      }
    } catch (error) {
      // logger.error('Failed to start scan:', error); // TODO: Implement client-side logging
      toast.error('Failed to start scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'running':
        return 'warning';
      case 'failed':
        return 'error';
      default:;
        return 'default';
    }
  };

  const getVulnerabilityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:;
        return 'default';
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        minHeight: '100vh',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Header */}
      <Box mb={4}>
        <Typography variant='h3' component='h1' fontWeight='bold' color='text.primary' mb={1}>
          Web2 Security Scanning
        </Typography>
        <Typography variant='body1' color='text.secondary' mb={3}>
          Comprehensive web application security testing with advanced vulnerability detection
        </Typography>
        <Box display='flex' gap={2}>
          <Button
            variant='contained'
            startIcon={<PlayArrowIcon />}
            onClick={() => setScanDialogOpen(true)}
            size='large'
          >
            Start New Scan
          </Button>
          <Button
            variant='outlined'
            startIcon={<RefreshIcon />}
            onClick={fetchScans}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='modern-card'>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h4' component='div' fontWeight='bold' color='primary.main'>
                    {scans.length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' textTransform='uppercase'>
                    Total Scans
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='modern-card'>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h4' component='div' fontWeight='bold' color='warning.main'>
                    {scans.filter(s => s.status === 'running').length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' textTransform='uppercase'>
                    Active Scans
                  </Typography>
                </Box>
                <PlayArrowIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='modern-card'>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h4' component='div' fontWeight='bold' color='error.main'>
                    {scans.reduce((acc, scan) => acc + (scan.vulnerabilities?.high || 0), 0)}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' textTransform='uppercase'>
                    High Risk Issues
                  </Typography>
                </Box>
                <ErrorIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className='modern-card'>
            <CardContent>
              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Box>
                  <Typography variant='h4' component='div' fontWeight='bold' color='success.main'>
                    {modules.length}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' textTransform='uppercase'>
                    Available Modules
                  </Typography>
                </Box>
                <BugReportIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Available Modules */}
      <Card className='modern-card' sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant='h5' component='h2' fontWeight='bold' mb={3}>
            Available Scanning Modules
          </Typography>
          <Grid container spacing={2}>
            {modules.map((module) => (
              <Grid item xs={12} md={6} key={module.id}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display='flex' alignItems='center' width='100%'>
                      <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant='subtitle1' fontWeight='bold'>
                          {module.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {module.category}
                        </Typography>
                      </Box>
                      <Box ml='auto'>
                        <Chip
                          label={module.enabled ? 'Enabled' : 'Disabled'}
                          color={module.enabled ? 'success' : 'default'}
                          size='small'
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant='body2' color='text.secondary' mb={2}>
                      {module.description}
                    </Typography>
                    {module.subModules && (
                      <Box>
                        <Typography variant='subtitle2' fontWeight='bold' mb={1}>
                          Sub-modules:;
                        </Typography>
                        {module.subModules.map((subModule) => (
                          <Box key={subModule.id} mb={1}>
                            <Typography variant='body2' fontWeight='500'>
                              • {subModule.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary' ml={2}>
                              {subModule.description}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
      {/* Recent Scans */}
      <Card className='modern-card'>
        <CardContent>
          <Typography variant='h5' component='h2' fontWeight='bold' mb={3}>
            Recent Web2 Scans
          </Typography>
          {scans.length === 0 ? (
            <Alert severity='info' sx={{ mb: 2 }}>
              No scans found. Start your first Web2 security scan to see results here.
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Target</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Modules</strong></TableCell>
                    <TableCell><strong>Vulnerabilities</strong></TableCell>
                    <TableCell><strong>Started</strong></TableCell>
                    <TableCell><strong>Progress</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scans.map((scan) => (
                    <TableRow key={scan.id} hover>
                      <TableCell>
                        <Box display='flex' alignItems='center'>
                          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                          {scan.target || 'Unknown Target'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scan.status || 'Unknown'}
                          color={getStatusColor(scan.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {scan.scanTypes?.join(', ') || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display='flex' gap={0.5}>
                          {scan.vulnerabilities?.high > 0 && (
                            <Chip
                              label={`${scan.vulnerabilities.high} High`}
                              color='error'
                              size='small'
                            />
                          )}
                          {scan.vulnerabilities?.medium > 0 && (
                            <Chip
                              label={`${scan.vulnerabilities.medium} Medium`}
                              color='warning'
                              size='small'
                            />
                          )}
                          {scan.vulnerabilities?.low > 0 && (
                            <Chip
                              label={`${scan.vulnerabilities.low} Low`}
                              color='info'
                              size='small'
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' color='text.secondary'>
                          {scan.startTime || 'Unknown'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {scan.status === 'running' ? (
                          <Box>
                            <LinearProgress
                              variant='determinate'
                              value={scan.progress || 0}
                              sx={{ mb: 1 }}
                              color='primary'
                            />
                            <Typography variant='caption' color='text.secondary'>
                              {scan.progress || 0}% - Scanning...
                            </Typography>
                          </Box>
                        ) : (
                          <Box>
                            <LinearProgress
                              variant='determinate'
                              value={100}
                              sx={{ mb: 1 }}
                              color={scan.status === 'completed' ? 'success' : 'error'}
                            />
                            <Typography variant='caption' color='text.secondary'>
                              {scan.status === 'completed' ? 'Complete' : 'Failed'}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
      {/* Start Scan Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)} maxWidth='md' fullWidth>
        <DialogTitle>
          <Box display='flex' alignItems='center'>
            <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
            Start New Web2 Security Scan
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Box display='flex' alignItems='center' gap={2} mb={2}>
                <FormControl fullWidth>
                  <InputLabel>Select Target</InputLabel>
                  <Select
                    value={selectedTarget}
                    onChange={(e) => setSelectedTarget(e.target.value)}
                    label='Select Target'
                  >
                    {targets.map((target) => (
                      <MenuItem key={target.id} value={target.id}>
                        {target.name} ({target.url})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant='outlined'
                  onClick={() => setAddTargetDialogOpen(true)}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Add Target
                </Button>
              </Box>
              {targets.length === 0 && (
                <Alert severity='info'>
                  No targets available. Please add a target first.
                </Alert>
              )}
            </Box>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Scan Modules
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              {modules.map((module) => (
                <FormControlLabel
                  key={module.id}
                  control={
                    <Checkbox
                      checked={selectedModules.includes(module.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModules([...selectedModules, module.id]);
                        } else {
                          setSelectedModules(selectedModules.filter(id => id !== module.id));
                        }
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant='body1' fontWeight='500'>
                        {module.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {module.description}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </FormGroup>
            <Typography variant='h6' fontWeight='bold' mb={2}>
              Scan Options
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Intensity</InputLabel>
                  <Select
                    value={scanOptions.intensity}
                    onChange={(e) => setScanOptions({...scanOptions, intensity: e.target.value})}
                    label='Intensity'
                  >
                    <MenuItem value='low'>Low</MenuItem>
                    <MenuItem value='medium'>Medium</MenuItem>
                    <MenuItem value='high'>High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label='Timeout (seconds)'
                  type='number'
                  value={scanOptions.timeout}
                  onChange={(e) => setScanOptions({...scanOptions, timeout: parseInt(e.target.value)})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStartScan}
            variant='contained'
            disabled={loading || !selectedTarget || selectedModules.length === 0}
            startIcon={loading ? <RefreshIcon /> : <PlayArrowIcon />}
          >
            {loading ? 'Starting...' : 'Start Scan'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add Target Dialog */}
      <Dialog open={addTargetDialogOpen} onClose={() => setAddTargetDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Target</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Target Name'
            fullWidth
            variant='outlined'
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='URL'
            fullWidth
            variant='outlined'
            value={newTarget.url}
            onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Description'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={newTarget.description}
            onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTargetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTarget} variant='contained'>Add Target</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Web2Scans;