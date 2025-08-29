import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Psychology as AIIcon,
  Security as SecurityIcon,
  
} from '@mui/icons-material';
  import {
    Search as SearchIcon,
  } from '@mui/icons-material';
  import {
    BugReport as BugIcon,
  } from '@mui/icons-material';
  import {
    Shield as ShieldIcon,
  } from '@mui/icons-material';
  import {
    Speed as SpeedIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    Warning as WarningIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as CheckIcon,
  } from '@mui/icons-material';
  import {
    Error as ErrorIcon,
  } from '@mui/icons-material';
  import {
    PlayArrow as PlayIcon,
  } from '@mui/icons-material';
  import {
    Stop as StopIcon,
  } from '@mui/icons-material';
  import {
    Visibility as EyeIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    TrendingUp as TrendingIcon,
  } from '@mui/icons-material';
  import {
    MonetizationOn as MoneyIcon
  } from '@mui/icons-material';
} from '@mui/icons-material';
import axios from 'axios';

const EliteAIDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [aiStatus, setAIStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [discoveryTarget, setDiscoveryTarget] = useState('');
  const [discoveryRunning, setDiscoveryRunning] = useState(false);
  const [discoveryResults, setDiscoveryResults] = useState(null);
  const [osintTarget, setOsintTarget] = useState('');
  const [osintRunning, setOsintRunning] = useState(false);
  const [osintResults, setOsintResults] = useState(null);
  const [exploitDialog, setExploitDialog] = useState(false);
  const [pendingExploits, setPendingExploits] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchAIStatus();
    fetchMetrics();
    fetchPendingExploits();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchAIStatus();
      fetchMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchAIStatus = async () => {
    try {
      const response = await axios.get('/api/elite-ai/status');
      setAIStatus(response.data.status);
      setLoading(false);
    } catch (error) {
      // logger.error('Error fetching AI status:', error); // TODO: Implement client-side logging
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await axios.get('/api/elite-ai/metrics');
      setMetrics(response.data.metrics);
    } catch (error) {
      // logger.error('Error fetching metrics:', error); // TODO: Implement client-side logging
    }
  };

  const fetchPendingExploits = async () => {
    try {
      const response = await axios.get('/api/elite-ai/exploit/pending');
      setPendingExploits(response.data.exploits || []);
    } catch (error) {
      // logger.error('Error fetching pending exploits:', error); // TODO: Implement client-side logging
    }
  };

  const executeEliteDiscovery = async () => {
    if (!discoveryTarget.trim()) return

    setDiscoveryRunning(true);
    setDiscoveryResults(null);

    try {
      const response = await axios.post('/api/elite-ai/discovery/execute', {
        target: {
          url: discoveryTarget.startsWith('http') ? discoveryTarget : `https://${discoveryTarget}`,
          domain: discoveryTarget.replace(/^https?:\/\//, '').split('/')[0]
        },
        options: {
          enableExploitation: false,
          bountyFocus: true
        }
      });

      setDiscoveryResults(response.data.discovery);
    } catch (error) {
      // logger.error('Error executing discovery:', error); // TODO: Implement client-side logging
      setDiscoveryResults({
        error: error.response?.data?.error || 'Discovery failed'
      });
    } finally {
      setDiscoveryRunning(false);
    }
  };

  const executeOSINTGathering = async () => {
    if (!osintTarget.trim()) return

    setOsintRunning(true);
    setOsintResults(null);

    try {
      const response = await axios.post('/api/elite-ai/osint/gather', {
        target: {
          domain: osintTarget.replace(/^https?:\/\//, '').split('/')[0],
          url: osintTarget.startsWith('http') ? osintTarget : `https://${osintTarget}`
        }
      });

      setOsintResults(response.data.intelligence);
    } catch (error) {
      // logger.error('Error executing OSINT:', error); // TODO: Implement client-side logging
      setOsintResults({
        error: error.response?.data?.error || 'OSINT gathering failed'
      });
    } finally {
      setOsintRunning(false);
    }
  };

  const approveExploit = async (exploitId) => {
    try {
      await axios.post(`/api/elite-ai/exploit/${exploitId}/approve`, {
        approvalNotes: 'Approved for controlled execution'
      });
      fetchPendingExploits();
    } catch (error) {
      // logger.error('Error approving exploit:', error); // TODO: Implement client-side logging
    }
  };

  const renderStatusCard = (title, value, icon, color = 'primary') => (
    <Card>
      <CardContent sx={{ textAlign: 'center' }}>
        <Box display='flex' justifyContent='center' mb={1}>
          {React.cloneElement(icon, { sx: { fontSize: 40 }, color })}
        </Box>
        <Typography variant='h4' color={`${color}.main`} fontWeight='bold'>
          {value}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {title}
        </Typography>
      </CardContent>
    </Card>
  );

  const renderDiscoveryTab = () => (
    <Box>
      <Typography variant='h5' gutterBottom>
        🧠 Elite AI Vulnerability Discovery
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            AI-Powered Target Analysis
          </Typography>
          <Box display='flex' gap={2} mb={2}>
            <TextField
              fullWidth
              label='Target Domain/URL'
              value={discoveryTarget}
              onChange={(e) => setDiscoveryTarget(e.target.value)}
              placeholder='example.com or https://example.com'
              disabled={discoveryRunning}
            />
            <Button
              variant='contained'
              onClick={executeEliteDiscovery}
              disabled={discoveryRunning || !discoveryTarget.trim()}
              startIcon={discoveryRunning ? <CircularProgress size={20} /> : <PlayIcon />}
              sx={{ minWidth: 200 }}
            >
              {discoveryRunning ? 'Analyzing...' : 'Start AI Discovery'}
            </Button>
          </Box>
          {discoveryRunning && (
            <Box>
              <Typography variant='body2' gutterBottom>
                AI Discovery in Progress...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </CardContent>
      </Card>
      {discoveryResults && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Discovery Results
            </Typography>
            {discoveryResults.error ? (
              <Alert severity='error'>{discoveryResults.error}</Alert>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  {renderStatusCard('Vulnerabilities', discoveryResults.vulnerabilities || 0, <BugIcon />, 'warning')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderStatusCard('Exploits', discoveryResults.exploits || 0, <SecurityIcon />, 'error')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderStatusCard('Confidence', `${discoveryResults.confidence || 0}%`, <AssessmentIcon />, 'success')}
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  {renderStatusCard('Status', discoveryResults.status || 'Unknown', <CheckIcon />, 'info')}
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderOSINTTab = () => (
    <Box>
      <Typography variant='h5' gutterBottom>
        🕵️ OSINT Intelligence Gathering
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            Comprehensive Target Intelligence
          </Typography>
          <Box display='flex' gap={2} mb={2}>
            <TextField
              fullWidth
              label='Target Domain'
              value={osintTarget}
              onChange={(e) => setOsintTarget(e.target.value)}
              placeholder='example.com'
              disabled={osintRunning}
            />
            <Button
              variant='contained'
              onClick={executeOSINTGathering}
              disabled={osintRunning || !osintTarget.trim()}
              startIcon={osintRunning ? <CircularProgress size={20} /> : <SearchIcon />}
              sx={{ minWidth: 200 }}
            >
              {osintRunning ? 'Gathering...' : 'Start OSINT'}
            </Button>
          </Box>
          {osintRunning && (
            <Box>
              <Typography variant='body2' gutterBottom>
                OSINT Intelligence Gathering in Progress...
              </Typography>
              <LinearProgress />
            </Box>
          )}
        </CardContent>
      </Card>
      {osintResults && (
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Intelligence Results
            </Typography>
            {osintResults.error ? (
              <Alert severity='error'>{osintResults.error}</Alert>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Employees', osintResults.employees || 0, <SearchIcon />, 'info')}
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Technologies', osintResults.technologies || 0, <SecurityIcon />, 'primary')}
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Infrastructure', osintResults.infrastructure || 0, <AssessmentIcon />, 'secondary')}
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Breaches', osintResults.breaches || 0, <WarningIcon />, 'warning')}
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Hidden Assets', osintResults.hiddenAssets || 0, <EyeIcon />, 'success')}
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  {renderStatusCard('Risk Score', `${osintResults.riskScore || 0}%`, <TrendingIcon />, 'error')}
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderExploitsTab = () => (
    <Box>
      <Typography variant='h5' gutterBottom>
        ⚡ Automated Exploitation
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
            <Typography variant='h6'>
              Pending Exploit Approvals
            </Typography>
            <Button
              variant='outlined'
              onClick={fetchPendingExploits}
              startIcon={<SearchIcon />}
            >
              Refresh
            </Button>
          </Box>
          {pendingExploits.length === 0 ? (
            <Alert severity='info'>No pending exploits requiring approval</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Exploit ID</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Vulnerability</TableCell>
                    <TableCell>Risk Level</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingExploits.map((exploit) => (
                    <TableRow key={exploit.id}>
                      <TableCell>{exploit.id}</TableCell>
                      <TableCell>{exploit.target}</TableCell>
                      <TableCell>{exploit.vulnerability}</TableCell>
                      <TableCell>
                        <Chip
                          label={exploit.riskLevel}
                          color={exploit.riskLevel >= 4 ? 'error' : 'warning'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{new Date(exploit.created).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button
                          size='small'
                          variant='contained'
                          color='success'
                          onClick={() => approveExploit(exploit.id)}
                          startIcon={<CheckIcon />}
                        >
                          Approve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );

  const renderMetricsTab = () => (
    <Box>
      <Typography variant='h5' gutterBottom>
        📊 Elite AI Metrics
      </Typography>
      {metrics && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Performance Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {renderStatusCard('Vulnerabilities', metrics.performance.vulnerabilitiesDiscovered, <BugIcon />, 'warning')}
                  </Grid>
                  <Grid item xs={6}>
                    {renderStatusCard('Exploits', metrics.performance.exploitsGenerated, <SecurityIcon />, 'error')}
                  </Grid>
                  <Grid item xs={6}>
                    {renderStatusCard('Success Rate', `${metrics.performance.successRate}%`, <TrendingIcon />, 'success')}
                  </Grid>
                  <Grid item xs={6}>
                    {renderStatusCard('Zero-days', metrics.performance.zeroDaysFound, <AIIcon />, 'primary')}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Bug Bounty Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {renderStatusCard('Campaigns', metrics.bounty.campaignsExecuted, <PlayIcon />, 'info')}
                  </Grid>
                  <Grid item xs={6}>
                    {renderStatusCard('Total Earnings', `$${metrics.bounty.totalEarnings}`, <MoneyIcon />, 'success')}
                  </Grid>
                  <Grid item xs={12}>
                    {renderStatusCard('Avg per Campaign', `$${metrics.bounty.averagePerCampaign}`, <TrendingIcon />, 'primary')}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Safety Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderStatusCard('Safety Violations', metrics.safety.safetyViolations, <WarningIcon />, 'error')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderStatusCard('Safety Rate', `${metrics.safety.safetyRate}%`, <ShieldIcon />, 'success')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderStatusCard('Uptime', `${Math.round(metrics.system.uptime / 3600000)}h`, <SpeedIcon />, 'info')}
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    {renderStatusCard('Status', 'Operational', <CheckIcon />, 'success')}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='50vh'>
        <CircularProgress size={60} />
        <Typography variant='h6' sx={{ ml: 2 }}>
          Loading Elite AI Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h3' component='h1' fontWeight='bold' mb={1}>
        🧠 Elite AI Security Engine
      </Typography>
      <Typography variant='body1' color='text.secondary' mb={3}>
        Advanced AI-powered vulnerability discovery, OSINT intelligence, and automated exploitation
      </Typography>
      {/* Status Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant='h6' gutterBottom>
            System Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box display='flex' alignItems='center'>
                <CheckIcon color='success' sx={{ mr: 1 }} />
                <Typography>AI Engine: {aiStatus?.status || 'Unknown'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display='flex' alignItems='center'>
                <CheckIcon color='success' sx={{ mr: 1 }} />
                <Typography>ML Detection: Active</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display='flex' alignItems='center'>
                <CheckIcon color='success' sx={{ mr: 1 }} />
                <Typography>OSINT Engine: Active</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display='flex' alignItems='center'>
                <ShieldIcon color='success' sx={{ mr: 1 }} />
                <Typography>Safety Controls: Active</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {/* Main Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label='AI Discovery' icon={<AIIcon />} />
          <Tab label='OSINT Intelligence' icon={<SearchIcon />} />
          <Tab label='Exploits' icon={<SecurityIcon />} />
          <Tab label='Metrics' icon={<AssessmentIcon />} />
        </Tabs>
      </Box>
      {/* Tab Content */}
      {activeTab === 0 && renderDiscoveryTab()}
      {activeTab === 1 && renderOSINTTab()}
      {activeTab === 2 && renderExploitsTab()}
      {activeTab === 3 && renderMetricsTab()}
    </Box>
  );
};

export default EliteAIDashboard;