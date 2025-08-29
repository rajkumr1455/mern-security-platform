import EnhancedSudomyRecon from './EnhancedSudomyRecon';
import React, { useState, useEffect } from 'react';
import SudomyRecon from './SudomyRecon';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab

} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  
} from '@mui/icons-material';
  import {
    PlayArrow as PlayIcon,
  } from '@mui/icons-material';
  import {
    Stop as StopIcon,
  } from '@mui/icons-material';
  import {
    Download as DownloadIcon,
  } from '@mui/icons-material';
  import {
    Visibility as ViewIcon,
  } from '@mui/icons-material';
  import {
    Security as SecurityIcon,
  } from '@mui/icons-material';
  import {
    Language as DomainIcon,
  } from '@mui/icons-material';
  import {
    Router as PortIcon,
  } from '@mui/icons-material';
  import {
    Api as ApiIcon
  } from '@mui/icons-material';
import { reconAPI } from '../../services/api';
import axios from 'axios';

const Reconnaissance = () => {
  const [target, setTarget] = useState('');
  const [selectedModules, setSelectedModules] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [reconResults, setReconResults] = useState([]);
  const [activeScans, setActiveScans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    fetchAvailableModules();
    fetchReconResults();
    fetchActiveScans();
  }, []);

  const fetchAvailableModules = async () => {
    try {
      const response = await axios.get('/api/recon/modules');
      setAvailableModules(response.data.modules || []);
    } catch (error) {
      // logger.error('Error fetching recon modules:', error); // TODO: Implement client-side logging
      // Fallback to empty array
      setAvailableModules([]);
    }
  };

  const fetchReconResults = async () => {
    try {
      const response = await reconAPI.getReconResults();
      setReconResults(response.data.results || [
        {
          id: 1,
          target: 'example.com',
          modules: ['subdomain_enum', 'port_scan'],
          status: 'completed',
          startTime: new Date().toISOString(),
          results: {
            subdomains: ['www.example.com', 'api.example.com', 'admin.example.com'],
            open_ports: [80, 443, 22],
            technologies: ['nginx', 'react', 'node.js']
          }
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching recon results:', error); // TODO: Implement client-side logging
    }
  };

  const fetchActiveScans = async () => {
    try {
      setActiveScans([
        {
          id: 'recon_001',
          target: 'test.com',
          progress: 65,
          currentModule: 'subdomain_enum',
          startTime: new Date().toISOString()
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching active scans:', error); // TODO: Implement client-side logging
    }
  };

  const handleStartRecon = async () => {
    if (!target || selectedModules.length === 0) {
      alert('Please enter a target and select at least one module');
      return
    }

    setLoading(true);
    try {
      const response = await reconAPI.startRecon({
        target,
        modules: selectedModules,
        options: {
          deep_scan: true,
          timeout: 300
        }
      });

      // logger.info('Reconnaissance started:', response.data); // TODO: Implement client-side logging
      setOpenDialog(false);
      setTarget('');
      setSelectedModules([]);
      fetchActiveScans();
    } catch (error) {
      // logger.error('Error starting reconnaissance:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (moduleId) => {
    setSelectedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const getModuleIcon = (iconType) => {
    switch (iconType) {
      case 'domain': return <DomainIcon />
      case 'router': return <PortIcon />
      case 'api': return <ApiIcon />
      default: return <SecurityIcon />
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = ({ children, value, index, ...other }) => {
    return (
      <div
        role='tabpanel'
        hidden={value !== index}
        id={`recon-tabpanel-${index}`}
        aria-labelledby={`recon-tab-${index}`}
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
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Reconnaissance
          </Typography>
          {currentTab === 0 && (
            <Button
              variant='contained'
              startIcon={<SearchIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Start Reconnaissance
            </Button>
          )}
        </Box>
        {/* Tabs for different reconnaissance modules */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label='reconnaissance tabs'>
            <Tab label='General Reconnaissance' />
            <Tab label='Sudomy Framework' />
            <Tab label='Enhanced Sudomy' />
          </Tabs>
        </Box>
        {/* Tab Panel for General Reconnaissance */}
        <TabPanel value={currentTab} index={0}>
          {/* Active Scans */}
          {activeScans.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Active Reconnaissance Scans
                </Typography>
                {activeScans.map((scan) => (
                  <Box key={scan.id} sx={{ mb: 2 }}>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
                      <Typography variant='body1'>
                        {scan.target} - {scan.currentModule}
                      </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {scan.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={scan.progress} />
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Available Modules */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Available Reconnaissance Modules
            </Typography>
            <Grid container spacing={2}>
              {availableModules.map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <Card variant='outlined'>
                    <CardContent>
                      <Box display='flex' alignItems='center' mb={1}>
                        {getModuleIcon(module.icon)}
                        <Typography variant='h6' sx={{ ml: 1 }}>
                          {module.name}
                        </Typography>
                      </Box>
                      <Typography variant='body2' color='text.secondary'>
                        {module.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
        {/* Reconnaissance Results */}
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Reconnaissance Results
            </Typography>
            {reconResults.map((result) => (
              <Accordion key={result.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display='flex' alignItems='center' gap={2} width='100%'>
                    <Typography variant='h6'>{result.target}</Typography>
                    <Chip
                      label={result.status}
                      color={getStatusColor(result.status)}
                      size='small'
                    />
                    <Typography variant='body2' color='text.secondary' sx={{ ml: 'auto' }}>
                      {new Date(result.startTime).toLocaleString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    {/* Subdomains */}
                    {result.results?.subdomains && (
                      <Grid item xs={12} md={4}>
                        <Typography variant='subtitle1' gutterBottom>
                          Subdomains ({result.results?.subdomains?.length || 0})
                        </Typography>
                        <Box>
                          {result.results?.subdomains?.map((subdomain, index) => (
                            <Chip
                              key={index}
                              label={subdomain}
                              size='small'
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Open Ports */}
                    {result.results?.open_ports && (
                      <Grid item xs={12} md={4}>
                        <Typography variant='subtitle1' gutterBottom>
                          Open Ports ({result.results?.open_ports?.length || 0})
                        </Typography>
                        <Box>
                          {result.results?.open_ports?.map((port, index) => (
                            <Chip
                              key={index}
                              label={port}
                              color='primary'
                              size='small'
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Technologies */}
                    {result.results?.technologies && (
                      <Grid item xs={12} md={4}>
                        <Typography variant='subtitle1' gutterBottom>
                          Technologies ({result.results?.technologies?.length || 0})
                        </Typography>
                        <Box>
                          {result.results?.technologies?.map((tech, index) => (
                            <Chip
                              key={index}
                              label={tech}
                              color='secondary'
                              size='small'
                              sx={{ m: 0.5 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button size='small' startIcon={<ViewIcon />}>
                      View Details
                    </Button>
                    <Button size='small' startIcon={<DownloadIcon />}>
                      Export
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
        </TabPanel>
        {/* Tab Panel for Sudomy Reconnaissance */}
        <TabPanel value={currentTab} index={1}>
          <SudomyRecon />
        </TabPanel>
        {/* Tab Panel for Enhanced Sudomy Reconnaissance */}
        <TabPanel value={currentTab} index={2}>
          <EnhancedSudomyRecon />
        </TabPanel>
        {/* Start Reconnaissance Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth='md' fullWidth>
          <DialogTitle>Start Reconnaissance Scan</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin='dense'
              label='Target (Domain/IP)'
              fullWidth
              variant='outlined'
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder='example.com'
              sx={{ mb: 3 }}
            />
            <Typography variant='h6' gutterBottom>
              Select Reconnaissance Modules
            </Typography>
            <Grid container spacing={2}>
              {availableModules.map((module) => (
                <Grid item xs={12} sm={6} key={module.id}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedModules.includes(module.id)}
                        onChange={() => handleModuleToggle(module.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant='body1'>{module.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>
                          {module.description}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button
              onClick={handleStartRecon}
              variant='contained'
              disabled={loading || !target || selectedModules.length === 0}
              startIcon={loading ? null : <PlayIcon />}
            >
              {loading ? 'Starting...' : 'Start Reconnaissance'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Reconnaissance;