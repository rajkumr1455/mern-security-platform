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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider

} from '@mui/material';
import AIAnalysisErrorBoundary from '../../components/ErrorBoundary/AIAnalysisErrorBoundary';
import {
  PlayArrow,
  Stop,
  Security,
  Psychology,
  Search,
  BugReport,
  Campaign,
  Visibility,
  CheckCircle,
  Warning,
  ExpandMore,
  Code,
  Shield,
  Analytics,
  AutoAwesome,
  Refresh

} from '@mui/icons-material';
import { eliteAIAPI } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`elite-ai-tabpanel-${index}`}
      aria-labelledby={`elite-ai-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CompleteEliteAI = () => {
  const [tabValue, setTabValue] = useState(0);
  const [status, setStatus] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [pendingExploits, setPendingExploits] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [discoveryDialog, setDiscoveryDialog] = useState(false);
  const [osintDialog, setOsintDialog] = useState(false);
  const [exploitDialog, setExploitDialog] = useState(false);
  const [zerodayDialog, setZerodayDialog] = useState(false);
  const [campaignDialog, setCampaignDialog] = useState(false);

  // Form states
  const [discoveryForm, setDiscoveryForm] = useState({ target: '', options: {} });
  const [osintForm, setOsintForm] = useState({ target: '', options: {} });
  const [exploitForm, setExploitForm] = useState({
    vulnerability_type: '',
    target_context: '',
    safety_level: 'maximum'
  });
  const [zerodayForm, setZerodayForm] = useState({ target: '', options: {} });
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    program: '',
    targets: '',
    options: {}
  });

  // Results states
  const [discoveryResults, setDiscoveryResults] = useState(null);
  const [osintResults, setOsintResults] = useState(null);
  const [exploitResults, setExploitResults] = useState(null);
  const [zerodayResults, setZerodayResults] = useState(null);

  useEffect(() => {
    loadEliteAIData();
  }, []);

  const loadEliteAIData = async () => {
    setLoading(true);
    try {
      const [statusRes, metricsRes, exploitsRes] = await Promise.all([
        eliteAIAPI.getStatus(),
        eliteAIAPI.getMetrics(),
        eliteAIAPI.getPendingExploits()
      ]);

      setStatus(statusRes.data);
      setMetrics(metricsRes.data);
      setPendingExploits(exploitsRes.data);
    } catch (error) {
      // logger.error('Error loading Elite AI data:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleDiscoveryExecute = async () => {
    try {
      const response = await eliteAIAPI.executeDiscovery({
        target: { url: discoveryForm.target },
        options: discoveryForm.options
      });
      setDiscoveryResults(response.data);
      setDiscoveryDialog(false);
    } catch (error) {
      // logger.error('Error executing discovery:', error); // TODO: Implement client-side logging
    }
  };

  const handleOSINTGather = async () => {
    try {
      const response = await eliteAIAPI.gatherOSINT({
        target: osintForm.target,
        options: osintForm.options
      });
      setOsintResults(response.data);
      setOsintDialog(false);
    } catch (error) {
      // logger.error('Error gathering OSINT:', error); // TODO: Implement client-side logging
    }
  };

  const handleExploitGenerate = async () => {
    try {
      const response = await eliteAIAPI.generateExploit(exploitForm);
      setExploitResults(response.data);
      setExploitDialog(false);
      loadEliteAIData(); // Refresh pending exploits
    } catch (error) {
      // logger.error('Error generating exploit:', error); // TODO: Implement client-side logging
    }
  };

  const handleZerodayHunt = async () => {
    try {
      const response = await eliteAIAPI.huntZerodays({
        target: { url: zerodayForm.target },
        options: zerodayForm.options
      });
      setZerodayResults(response.data);
      setZerodayDialog(false);
    } catch (error) {
      // logger.error('Error hunting zero-days:', error); // TODO: Implement client-side logging
    }
  };

  const handleCampaignExecute = async () => {
    try {
      const response = await eliteAIAPI.executeCampaign({
        program: { name: campaignForm.program },
        options: campaignForm.options
      });
      setCampaignDialog(false);
      loadEliteAIData();
    } catch (error) {
      // logger.error('Error executing campaign:', error); // TODO: Implement client-side logging
    }
  };

  const handleApproveExploit = async (exploitId) => {
    try {
      await eliteAIAPI.approveExploit(exploitId, { approved: true });
      loadEliteAIData();
    } catch (error) {
      // logger.error('Error approving exploit:', error); // TODO: Implement client-side logging
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'success';
      case 'degraded': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
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
          🧠 Elite AI Security Engine
        </Typography>
        <Box>
          <IconButton onClick={loadEliteAIData}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      {/* Status Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Psychology color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Engine Status
                  </Typography>
                  <Chip
                    label={status?.status || 'Unknown'}
                    color={getStatusColor(status?.status)}
                    size='small'
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Security color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Vulnerabilities Found
                  </Typography>
                  <Typography variant='h4'>
                    {metrics?.vulnerabilitiesDiscovered || 0}
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
                <BugReport color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Zero-Days Found
                  </Typography>
                  <Typography variant='h4'>
                    {metrics?.zeroDaysFound || 0}
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
                <Analytics color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Success Rate
                  </Typography>
                  <Typography variant='h4'>
                    {metrics?.successRate || 0}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Action Buttons */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='contained'
            startIcon={<Search />}
            onClick={() => setDiscoveryDialog(true)}
            sx={{ py: 2 }}
          >
            Discovery
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='contained'
            startIcon={<Visibility />}
            onClick={() => setOsintDialog(true)}
            sx={{ py: 2 }}
          >
            OSINT
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='contained'
            startIcon={<Code />}
            onClick={() => setExploitDialog(true)}
            sx={{ py: 2 }}
          >
            Exploit
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='contained'
            startIcon={<AutoAwesome />}
            onClick={() => setZerodayDialog(true)}
            sx={{ py: 2 }}
          >
            Zero-Day
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='contained'
            startIcon={<Campaign />}
            onClick={() => setCampaignDialog(true)}
            sx={{ py: 2 }}
          >
            Campaign
          </Button>
        </Grid>
      </Grid>
      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Pending Exploits' />
            <Tab label='Discovery Results' />
            <Tab label='OSINT Results' />
            <Tab label='Zero-Day Results' />
          </Tabs>
        </Box>
        {/* Pending Exploits Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Exploit ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(pendingExploits) && pendingExploits.map((exploit) => (
                  <TableRow key={exploit.id}>
                    <TableCell>{exploit.id}</TableCell>
                    <TableCell>{exploit.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={exploit.riskLevel}
                        color={getRiskColor(exploit.riskLevel)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{exploit.target}</TableCell>
                    <TableCell>{new Date(exploit.created).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size='small'
                        startIcon={<CheckCircle />}
                        onClick={() => handleApproveExploit(exploit.id)}
                      >
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Discovery Results Tab */}
        <TabPanel value={tabValue} index={1}>
          {discoveryResults ? (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant='h6'>
                  Discovery Results for {discoveryResults.discovery?.target?.url}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1' gutterBottom>
                      Summary
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Security /></ListItemIcon>
                        <ListItemText
                          primary='Vulnerabilities Found'
                          secondary={discoveryResults.discovery?.summary?.vulnerabilities || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Code /></ListItemIcon>
                        <ListItemText
                          primary='Exploits Generated'
                          secondary={discoveryResults.discovery?.summary?.exploits || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Analytics /></ListItemIcon>
                        <ListItemText
                          primary='Confidence'
                          secondary={`${discoveryResults.discovery?.summary?.confidence || 0}%`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle1' gutterBottom>
                      Phases
                    </Typography>
                    <List dense>
                      {Object.entries(discoveryResults.discovery?.phases || {}).map(([phase, data]) => (
                        <ListItem key={phase}>
                          <ListItemIcon>
                            {data.status === 'completed' ? <CheckCircle color='success' /> : <Warning color='warning' />}
                          </ListItemIcon>
                          <ListItemText
                            primary={phase.replace('_', ' ').toUpperCase()}
                            secondary={`${data.status} - ${data.progress}%`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Alert severity='info'>No discovery results yet. Run a discovery scan to see results here.</Alert>
          )}
        </TabPanel>
        {/* OSINT Results Tab */}
        <TabPanel value={tabValue} index={2}>
          {osintResults ? (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant='h6'>
                  OSINT Results for {osintResults.target}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Intelligence Summary
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary='Employees'
                          secondary={osintResults.intelligence?.employees || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary='Technologies'
                          secondary={osintResults.intelligence?.technologies || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary='Infrastructure'
                          secondary={osintResults.intelligence?.infrastructure || 0}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary='Breaches'
                          secondary={osintResults.intelligence?.breaches || 0}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Risk Assessment
                    </Typography>
                    <Box display='flex' alignItems='center' mb={2}>
                      <Typography variant='h4' color='primary'>
                        {osintResults.intelligence?.riskScore || 0}%
                      </Typography>
                      <Typography variant='body2' sx={{ ml: 1 }}>
                        Overall Risk
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Hidden Assets
                    </Typography>
                    <Typography variant='body2'>
                      {osintResults.intelligence?.hiddenAssets || 0} assets discovered
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Alert severity='info'>No OSINT results yet. Run an OSINT scan to see results here.</Alert>
          )}
        </TabPanel>
        {/* Zero-Day Results Tab */}
        <TabPanel value={tabValue} index={3}>
          {zerodayResults ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Finding</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Verification Required</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {zerodayResults.zerodays?.map((finding, index) => (
                    <TableRow key={index}>
                      <TableCell>{finding.type}</TableCell>
                      <TableCell>{finding.confidence}%</TableCell>
                      <TableCell>
                        <Chip
                          label={finding.severity}
                          color={getRiskColor(finding.severity)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{finding.description}</TableCell>
                      <TableCell>
                        {finding.requires_manual_verification ?
                          <CheckCircle color='warning' /> :
                          <CheckCircle color='success' />
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity='info'>No zero-day results yet. Run a zero-day hunt to see results here.</Alert>
          )}
        </TabPanel>
      </Card>
      {/* Discovery Dialog */}
      <Dialog open={discoveryDialog} onClose={() => setDiscoveryDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Execute Elite Vulnerability Discovery</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Target URL'
            value={discoveryForm.target}
            onChange={(e) => setDiscoveryForm({ ...discoveryForm, target: e.target.value })}
            sx={{ mt: 2 }}
            placeholder='https://example.com'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiscoveryDialog(false)}>Cancel</Button>
          <Button onClick={handleDiscoveryExecute} variant='contained'>
            Execute Discovery
          </Button>
        </DialogActions>
      </Dialog>
      {/* OSINT Dialog */}
      <Dialog open={osintDialog} onClose={() => setOsintDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Gather OSINT Intelligence</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Target Domain'
            value={osintForm.target}
            onChange={(e) => setOsintForm({ ...osintForm, target: e.target.value })}
            sx={{ mt: 2 }}
            placeholder='example.com'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOsintDialog(false)}>Cancel</Button>
          <Button onClick={handleOSINTGather} variant='contained'>
            Gather Intelligence
          </Button>
        </DialogActions>
      </Dialog>
      {/* Exploit Dialog */}
      <Dialog open={exploitDialog} onClose={() => setExploitDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Generate AI Exploit</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vulnerability Type</InputLabel>
                <Select
                  value={exploitForm.vulnerability_type}
                  onChange={(e) => setExploitForm({ ...exploitForm, vulnerability_type: e.target.value })}
                >
                  <MenuItem value='xss'>Cross-Site Scripting (XSS)</MenuItem>
                  <MenuItem value='sqli'>SQL Injection</MenuItem>
                  <MenuItem value='cmd'>Command Injection</MenuItem>
                  <MenuItem value='ssrf'>Server-Side Request Forgery</MenuItem>
                  <MenuItem value='lfi'>Local File Inclusion</MenuItem>
                  <MenuItem value='rce'>Remote Code Execution</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Target Context'
                value={exploitForm.target_context}
                onChange={(e) => setExploitForm({ ...exploitForm, target_context: e.target.value })}
                placeholder='web application, API endpoint, etc.'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Safety Level</InputLabel>
                <Select
                  value={exploitForm.safety_level}
                  onChange={(e) => setExploitForm({ ...exploitForm, safety_level: e.target.value })}
                >
                  <MenuItem value='maximum'>Maximum Safety</MenuItem>
                  <MenuItem value='high'>High Safety</MenuItem>
                  <MenuItem value='medium'>Medium Safety</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExploitDialog(false)}>Cancel</Button>
          <Button onClick={handleExploitGenerate} variant='contained'>
            Generate Exploit
          </Button>
        </DialogActions>
      </Dialog>
      {/* Zero-Day Dialog */}
      <Dialog open={zerodayDialog} onClose={() => setZerodayDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Hunt Zero-Day Vulnerabilities</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label='Target URL'
            value={zerodayForm.target}
            onChange={(e) => setZerodayForm({ ...zerodayForm, target: e.target.value })}
            sx={{ mt: 2 }}
            placeholder='https://example.com'
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setZerodayDialog(false)}>Cancel</Button>
          <Button onClick={handleZerodayHunt} variant='contained'>
            Hunt Zero-Days
          </Button>
        </DialogActions>
      </Dialog>
      {/* Campaign Dialog */}
      <Dialog open={campaignDialog} onClose={() => setCampaignDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Execute Elite Bug Bounty Campaign</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Campaign Name'
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Bug Bounty Program'
                value={campaignForm.program}
                onChange={(e) => setCampaignForm({ ...campaignForm, program: e.target.value })}
                placeholder='HackerOne, Bugcrowd, etc.'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Target URLs (one per line)'
                multiline
                rows={4}
                value={campaignForm.targets}
                onChange={(e) => setCampaignForm({ ...campaignForm, targets: e.target.value })}
                placeholder='https://example.com&#10;https://api.example.com'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCampaignDialog(false)}>Cancel</Button>
          <Button onClick={handleCampaignExecute} variant='contained'>
            Execute Campaign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompleteEliteAI;