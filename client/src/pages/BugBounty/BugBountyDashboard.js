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
  Tooltip

} from '@mui/material';
import {
  PlayArrow,
  Stop,
  TrendingUp,
  AttachMoney,
  Security,
  Campaign,
  Visibility,
  GetApp,
  Refresh,
  Settings

} from '@mui/icons-material';
import { bugBountyAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`bug-bounty-tabpanel-${index}`}
      aria-labelledby={`bug-bounty-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BugBountyDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignDialog, setCampaignDialog] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    program: '',
    targets: '',
    budget: '',
    duration: '24'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, campaignsRes, programsRes, earningsRes, submissionsRes] = await Promise.all([
        bugBountyAPI.getStats(),
        bugBountyAPI.getActiveCampaigns(),
        bugBountyAPI.getPrograms(),
        bugBountyAPI.getEarnings(),
        bugBountyAPI.getSubmissions()
      ]);

      setStats(statsRes.data);
      setCampaigns(campaignsRes.data);
      setPrograms(programsRes.data);
      setEarnings(earningsRes.data);
      setSubmissions(submissionsRes.data);
    } catch (error) {
      logger.error('Error loading bug bounty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartCampaign = async () => {
    try {
      const campaignData = {
        ...newCampaign,
        targets: newCampaign.targets.split('\n').filter(t => t.trim()),
        budget: parseFloat(newCampaign.budget),
        duration: parseInt(newCampaign.duration)
      };

      await bugBountyAPI.startCampaign(campaignData);
      setCampaignDialog(false);
      setNewCampaign({
        name: '',
        program: '',
        targets: '',
        budget: '',
        duration: '24'
      });
      loadDashboardData();
    } catch (error) {
      logger.error('Error starting campaign:', error);
    }
  };

  const handleStopCampaign = async (campaignId) => {
    try {
      await bugBountyAPI.stopCampaign(campaignId);
      loadDashboardData();
    } catch (error) {
      logger.error('Error stopping campaign:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
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
          🏆 Bug Bounty Automation Dashboard
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<PlayArrow />}
            onClick={() => setCampaignDialog(true)}
            sx={{ mr: 1 }}
          >
            Start Campaign
          </Button>
          <Button
            variant='outlined'
            startIcon={<Security />}
            onClick={() => navigate('/web3')}
            sx={{ mr: 1 }}
          >
            Web3 Security & PoC
          </Button>
          <IconButton onClick={loadDashboardData}>
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
                <Campaign color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Active Campaigns
                  </Typography>
                  <Typography variant='h4'>
                    {stats?.activeCampaigns || 0}
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
                <AttachMoney color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Total Earnings
                  </Typography>
                  <Typography variant='h4'>
                    ${earnings?.total || 0}
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
                <Security color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Vulnerabilities Found
                  </Typography>
                  <Typography variant='h4'>
                    {stats?.vulnerabilitiesFound || 0}
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
                <TrendingUp color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant='h4'>
                    {stats?.successRate || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Active Campaigns' />
            <Tab label='Programs' />
            <Tab label='Submissions' />
            <Tab label='Earnings' />
          </Tabs>
        </Box>
        {/* Active Campaigns Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign Name</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Targets</TableCell>
                  <TableCell>Findings</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>{campaign.name}</TableCell>
                    <TableCell>{campaign.program}</TableCell>
                    <TableCell>
                      <Chip
                        label={campaign.status}
                        color={getStatusColor(campaign.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <LinearProgress
                          variant='determinate'
                          value={campaign.progress}
                          sx={{ width: 100, mr: 1 }}
                        />
                        <Typography variant='body2'>
                          {campaign.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{campaign.targets}</TableCell>
                    <TableCell>{campaign.findings}</TableCell>
                    <TableCell>
                      <Tooltip title='View Details'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Stop Campaign'>
                        <IconButton
                          size='small'
                          onClick={() => handleStopCampaign(campaign.id)}
                          disabled={campaign.status !== 'running'}
                        >
                          <Stop />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Programs Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Program Name</TableCell>
                  <TableCell>Platform</TableCell>
                  <TableCell>Scope</TableCell>
                  <TableCell>Max Bounty</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{program.platform}</TableCell>
                    <TableCell>{program.scope}</TableCell>
                    <TableCell>${program.maxBounty}</TableCell>
                    <TableCell>{program.responseTime}</TableCell>
                    <TableCell>
                      <Chip
                        label={program.rating}
                        color={program.rating >= 4 ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Submissions Tab */}
        <TabPanel value={tabValue} index={2}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Program</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Bounty</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>{submission.title}</TableCell>
                    <TableCell>{submission.program}</TableCell>
                    <TableCell>
                      <Chip
                        label={submission.severity}
                        color={getSeverityColor(submission.severity)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={submission.status}
                        color={getStatusColor(submission.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>${submission.bounty || 'Pending'}</TableCell>
                    <TableCell>{new Date(submission.submitted).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Tooltip title='View Report'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Download'>
                        <IconButton size='small'>
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Earnings Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Monthly Earnings
                  </Typography>
                  <Typography variant='h3' color='primary'>
                    ${earnings?.monthly || 0}
                  </Typography>
                  <Typography color='textSecondary'>
                    This month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Average per Vulnerability
                  </Typography>
                  <Typography variant='h3' color='success.main'>
                    ${earnings?.averagePerVuln || 0}
                  </Typography>
                  <Typography color='textSecondary'>
                    All time average
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
      {/* New Campaign Dialog */}
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Start New Bug Bounty Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Campaign Name'
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Bug Bounty Program</InputLabel>
                <Select
                  value={newCampaign.program}
                  onChange={(e) => setNewCampaign({ ...newCampaign, program: e.target.value })}
                >
                  {programs.map((program) => (
                    <MenuItem key={program.id} value={program.name}>
                      {program.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Budget ($)'
                type='number'
                value={newCampaign.budget}
                onChange={(e) => setNewCampaign({ ...newCampaign, budget: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Target URLs (one per line)'
                multiline
                rows={4}
                value={newCampaign.targets}
                onChange={(e) => setNewCampaign({ ...newCampaign, targets: e.target.value })}
                placeholder='https://example.com&#10;https://api.example.com'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Duration (hours)'
                type='number'
                value={newCampaign.duration}
                onChange={(e) => setNewCampaign({ ...newCampaign, duration: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
          <Button onClick={handleStartCampaign} variant='contained'>
            Start Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BugBountyDashboard;