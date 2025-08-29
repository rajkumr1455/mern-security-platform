import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert

} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  
} from '@mui/icons-material';
  import {
    Visibility as ViewIcon,
  } from '@mui/icons-material';
  import {
    Delete as DeleteIcon
  } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Scans = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [targets, setTargets] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState('');
  const [selectedScanType, setSelectedScanType] = useState('web2');
  const navigate = useNavigate();

  useEffect(() => {
    fetchScans();
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/targets');
      if (response.data.success) {
        // Handle both array and object formats from the API
        let targetsData = response.data.targets
        if (Array.isArray(targetsData)) {
          setTargets(targetsData);
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
          setTargets(targetsArray);
        }
      }
    } catch (error) {
      // logger.error('Failed to fetch targets:', error); // TODO: Implement client-side logging
      setTargets([]);
    }
  };

  const fetchScans = async () => {
    try {
      setLoading(true);

      // Get scan results from backend
      const response = await axios.get('/api/results/all');
      const scanResults = response.data.results || [];

      // Get active scans
      const activeResponse = await axios.get('/api/scans/active');
      const activeScans = activeResponse.data.scans || [];

      // Combine and format scan data
      const allScans = [
        ...activeScans.map(scan => ({
          ...scan,
          status: 'running',
          progress: scan.progress || Math.floor(Math.random() * 100)
        })),
        ...scanResults.map(result => ({
          ...result,
          status: 'completed',
          progress: 100
        }))
      ];

      setScans(allScans);
    } catch (error) {
      // logger.error('Error fetching scans:', error); // TODO: Implement client-side logging
      // Fallback to empty array
      setScans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewScan = (scanId) => {
    navigate(`/scans/${scanId}`);
  };

  const handleStopScan = (scanId) => {
    // logger.info('Stopping scan:', scanId); // TODO: Implement client-side logging
  };

  const handleDeleteScan = (scanId) => {
    // logger.info('Deleting scan:', scanId); // TODO: Implement client-side logging
  };

  const handleStartScan = async () => {
    if (!selectedTarget) {
      alert('Please select a target');
      return
    }

    try {
      let response
      if (selectedScanType === 'web2') {
        response = await axios.post('/api/scans/web2', {
          targetId: selectedTarget,
          scanTypes: ['vulnerability'],
          options: {
            intensity: 'medium',
            timeout: 300
          }
        });
      } else if (selectedScanType === 'web3') {
        response = await axios.post('/api/web3/analyze', {
          targetId: selectedTarget,
          analysisType: 'comprehensive'
        });
      }

      if (response?.data?.success) {
        setScanDialogOpen(false);
        setSelectedTarget('');
        fetchScans();
        alert(`${selectedScanType.toUpperCase()} scan started successfully!`);
      }
    } catch (error) {
      // logger.error('Failed to start scan:', error); // TODO: Implement client-side logging
      alert('Failed to start scan. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading scans...</Typography>
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Security Scans
          </Typography>
          <Button
            variant='contained'
            startIcon={<PlayIcon />}
            onClick={() => setScanDialogOpen(true)}
          >
            New Scan
          </Button>
        </Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Scans
                </Typography>
                <Typography variant='h4'>
                  {scans.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Running
                </Typography>
                <Typography variant='h4' color='warning.main'>
                  {scans.filter(s => s.status === 'running').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Completed
                </Typography>
                <Typography variant='h4' color='success.main'>
                  {scans.filter(s => s.status === 'completed').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Vulnerabilities
                </Typography>
                <Typography variant='h4' color='error.main'>
                  {scans.reduce((sum, scan) => sum + scan.vulnerabilities, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Scans Table */}
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Recent Scans
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Scan Name</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Start Time</TableCell>
                    <TableCell>Vulnerabilities</TableCell>
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
                          label={scan.type}
                          color={scan.type === 'web3' ? 'secondary' : 'primary'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={scan.status}
                          color={getStatusColor(scan.status)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          <LinearProgress
                            variant='determinate'
                            value={scan.progress}
                            sx={{ width: 100 }}
                          />
                          <Typography variant='body2'>
                            {scan.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{scan.startTime}</TableCell>
                      <TableCell>
                        <Chip
                          label={scan.vulnerabilities}
                          color={scan.vulnerabilities > 0 ? 'error' : 'success'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => handleViewScan(scan.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                        {scan.status === 'running' && (
                          <IconButton
                            size='small'
                            color='warning'
                            onClick={() => handleStopScan(scan.id)}
                          >
                            <StopIcon />
                          </IconButton>
                        )}
                        <IconButton
                          size='small'
                          color='error'
                          onClick={() => handleDeleteScan(scan.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
      {/* New Scan Dialog */}
      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Start New Security Scan</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Target</InputLabel>
              <Select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                label='Select Target'
              >
                {targets.map((target) => (
                  <MenuItem key={target.id} value={target.id}>
                    {target.name} ({target.url}) - {target.type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {targets.length === 0 && (
              <Alert severity='info' sx={{ mb: 3 }}>
                No targets available. Please add targets first by visiting the{' '}
                <Button
                  variant='text'
                  onClick={() => navigate('/targets')}
                  sx={{ textTransform: 'none', p: 0, minWidth: 'auto' }}
                >
                  Targets page
                </Button>
              </Alert>
            )}

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Scan Type</InputLabel>
              <Select
                value={selectedScanType}
                onChange={(e) => setSelectedScanType(e.target.value)}
                label='Scan Type'
              >
                <MenuItem value='web2'>Web2 Security Scan</MenuItem>
                <MenuItem value='web3'>Web3 Security Analysis</MenuItem>
              </Select>
            </FormControl>
            <Alert severity='info'>
              {selectedScanType === 'web2'
                ? 'Web2 scan will perform comprehensive vulnerability testing including OWASP Top 10 checks.'
                : 'Web3 scan will analyze smart contracts for security vulnerabilities and best practices.'
              }
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleStartScan}
            variant='contained'
            disabled={!selectedTarget}
            startIcon={<PlayIcon />}
          >
            Start Scan
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Scans;