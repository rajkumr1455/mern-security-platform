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
  ListItemIcon
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Visibility,
  GetApp,
  Warning,
  CheckCircle,
  Error,
  ExpandMore,
  AccountBalance,
  Security,
  Code,
  Analytics,
  TrendingUp,
  Token,
  SwapHoriz,
  Lock
} from '@mui/icons-material';
import { web3API } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`web3-tabpanel-${index}`}
      aria-labelledby={`web3-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Web3Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [toolsStatus, setToolsStatus] = useState(null);
  const [defiProtocols, setDefiProtocols] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [contractDialog, setContractDialog] = useState(false);
  const [scanDialog, setScanDialog] = useState(false);
  const [defiDialog, setDefiDialog] = useState(false);

  // Form states
  const [contractForm, setContractForm] = useState({
    address: '',
    network: 'ethereum',
    abi: '',
    name: ''
  });

  const [scanForm, setScanForm] = useState({
    network: 'ethereum',
    blockRange: '1000',
    scanType: 'vulnerability'
  });

  const [defiForm, setDefiForm] = useState({
    protocol: '',
    poolAddress: '',
    tokenPair: ''
  });

  // Results states
  const [analysisResults, setAnalysisResults] = useState({});

  useEffect(() => {
    loadWeb3Data();
  }, []);

  const loadWeb3Data = async () => {
    setLoading(true);
    try {
      const toolsRes = await web3API.getToolsStatus();
      setToolsStatus(toolsRes.data);

      // Mock data for demonstration
      setContracts([
        {
          id: 1,
          name: 'UniswapV3Pool',
          address: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
          network: 'ethereum',
          type: 'DeFi',
          riskLevel: 'medium',
          lastAnalyzed: new Date().toISOString()
        },
        {
          id: 2,
          name: 'CompoundCToken',
          address: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
          network: 'ethereum',
          type: 'Lending',
          riskLevel: 'low',
          lastAnalyzed: new Date().toISOString()
        }
      ]);

      setAnalyses([
        {
          id: 1,
          contractName: 'UniswapV3Pool',
          status: 'completed',
          vulnerabilities: 2,
          gasOptimizations: 5,
          score: 85,
          timestamp: new Date().toISOString()
        }
      ]);

    } catch (error) {
      // logger.error('Error loading Web3 data:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleContractAnalysis = async () => {
    try {
      // logger.info('Starting contract analysis...', contractForm); // TODO: Implement client-side logging

      // Validate contract address
      if (!contractForm.address || contractForm.address.length < 40) {
        alert('Please enter a valid contract address (42 characters starting with 0x)');
        return
      }

      // Prepare contract data
      const contractData = {
        contractAddress: contractForm.address, // Use contractAddress to match backend
        network: contractForm.network,
        name: contractForm.name || `Contract_${contractForm.address.slice(0, 8)}`
      };

      // Add ABI if provided and valid
      if (contractForm.abi && contractForm.abi.trim()) {
        try {
          contractData.abi = JSON.parse(contractForm.abi);
        } catch (abiError) {
          // logger.warn('Invalid ABI provided, proceeding without ABI:', abiError); // TODO: Implement client-side logging
        }
      }

      // logger.info('Sending contract data:', contractData); // TODO: Implement client-side logging

      const response = await web3API.analyzeContract(contractData);

      // logger.info('Analysis response:', response); // TODO: Implement client-side logging

      if (response.data && response.data.success) {
        setAnalysisResults(prev => ({
          ...prev,
          [contractForm.address]: response.data.data
        }));

        alert(`Analysis completed successfully! Analysis ID: ${response.data.data.id}`);
      } else {
        // logger.error('Analysis failed:', response.data); // TODO: Implement client-side logging
        alert('Analysis failed. Please check the console for details.');
      }

      setContractDialog(false);
      setContractForm({
        address: '',
        network: 'ethereum',
        abi: '',
        name: ''
      });
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error analyzing contract:', error); // TODO: Implement client-side logging

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        // logger.error('Server error:', error.response.status, error.response.data); // TODO: Implement client-side logging
        alert(`Server error: ${error.response.data?.error || 'Unknown server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        // logger.error('Network error - no response received:', error.request); // TODO: Implement client-side logging
        alert('Network error: Unable to connect to the server. Please check if the server is running.');
      } else {
        // Something else happened
        // logger.error('Request setup error:', error.message); // TODO: Implement client-side logging
        alert(`Request error: ${error.message}`);
      }
    }
  };

  const handleBlockchainScan = async () => {
    try {
      const response = await web3API.scanBlockchain(scanForm);
      setScanDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error scanning blockchain:', error); // TODO: Implement client-side logging
    }
  };

  const handleDefiAnalysis = async () => {
    try {
      const response = await web3API.analyzeDeFi(defiForm);
      setDefiDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error analyzing DeFi protocol:', error); // TODO: Implement client-side logging
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'primary';
      case 'failed': return 'error';
      case 'pending': return 'warning';
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
          🔗 Web3 Security Dashboard
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<Code />}
            onClick={() => setContractDialog(true)}
            sx={{ mr: 1 }}
          >
            Analyze Contract
          </Button>
          <Button
            variant='outlined'
            startIcon={<Security />}
            onClick={() => setScanDialog(true)}
            sx={{ mr: 1 }}
          >
            Blockchain Scan
          </Button>
          <Button
            variant='outlined'
            startIcon={<SwapHoriz />}
            onClick={() => setDefiDialog(true)}
            sx={{ mr: 1 }}
          >
            DeFi Analysis
          </Button>
          <IconButton onClick={loadWeb3Data}>
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
                <Code color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Contracts Analyzed
                  </Typography>
                  <Typography variant='h4'>
                    {contracts.length}
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
                <Warning color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Vulnerabilities Found
                  </Typography>
                  <Typography variant='h4'>
                    {analyses.reduce((sum, a) => sum + a.vulnerabilities, 0)}
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
                <TrendingUp color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant='h4'>
                    {analyses.length > 0 ?
                      Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length) : 0
                    }
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
                <Token color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Networks Supported
                  </Typography>
                  <Typography variant='h4'>
                    5
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Tools Status */}
      {toolsStatus && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Web3 Security Tools Status
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(toolsStatus).map(([tool, status]) => (
                <Grid item xs={12} sm={6} md={3} key={tool}>
                  <Box display='flex' alignItems='center'>
                    <Chip
                      icon={status === 'operational' ? <CheckCircle /> : <Error />}
                      label={tool}
                      color={status === 'operational' ? 'success' : 'error'}
                      size='small'
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Smart Contracts' />
            <Tab label='Analysis Results' />
            <Tab label='Immunefi PoC Generator' />
            <Tab label='DeFi Protocols' />
          </Tabs>
        </Box>
        {/* Smart Contracts Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Contract Name</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Network</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Last Analyzed</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>{contract.name}</TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                        {contract.address.substring(0, 10)}...{contract.address.substring(38)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={contract.network} size='small' />
                    </TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={contract.riskLevel}
                        color={getRiskColor(contract.riskLevel)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(contract.lastAnalyzed).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Analysis'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Re-analyze'>
                        <IconButton size='small'>
                          <Refresh />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Analysis Results Tab */}
        <TabPanel value={tabValue} index={1}>
          {analyses.map((analysis) => (
            <Accordion key={analysis.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box display='flex' alignItems='center' width='100%'>
                  <Typography variant='h6' sx={{ flexGrow: 1 }}>
                    {analysis.contractName}
                  </Typography>
                  <Chip
                    label={analysis.status}
                    color={getStatusColor(analysis.status)}
                    size='small'
                    sx={{ mr: 2 }}
                  />
                  <Typography variant='body2' color='textSecondary'>
                    Score: {analysis.score}/100
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Security Analysis
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <Warning color='warning' />
                        </ListItemIcon>
                        <ListItemText
                          primary='Vulnerabilities'
                          secondary={`${analysis.vulnerabilities} found`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <TrendingUp color='success' />
                        </ListItemIcon>
                        <ListItemText
                          primary='Gas Optimizations'
                          secondary={`${analysis.gasOptimizations} suggestions`}
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Risk Assessment
                    </Typography>
                    <LinearProgress
                      variant='determinate'
                      value={analysis.score}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant='body2'>
                      Overall Security Score: {analysis.score}/100
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant='subtitle1' gutterBottom>
                      Recommendations
                    </Typography>
                    <Typography variant='body2'>
                      • Implement access controls
                      • Add reentrancy guards
                      • Optimize gas usage
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </TabPanel>
        {/* Immunefi PoC Generator Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant='h5' gutterBottom>
              🛡️ Immunefi PoC Generator
            </Typography>
            <Alert severity='info' sx={{ mb: 3 }}>
              Generate professional proof-of-concept templates for Immunefi bug bounty submissions
            </Alert>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Quick PoC Generator
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Vulnerability Name'
                      placeholder='e.g., Reentrancy in Withdraw Function'
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Vulnerability Type</InputLabel>
                      <Select defaultValue='reentrancy'>
                        <MenuItem value='reentrancy'>🔄 Reentrancy Attack</MenuItem>
                        <MenuItem value='flashloan'>⚡ Flash Loan Attack</MenuItem>
                        <MenuItem value='price-manipulation'>📈 Price Manipulation</MenuItem>
                        <MenuItem value='access-control'>🔐 Access Control</MenuItem>
                        <MenuItem value='integer-overflow'>🔢 Integer Overflow</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Target Contract Address'
                      placeholder='0x1234567890abcdef1234567890abcdef12345678'
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>Severity</InputLabel>
                      <Select defaultValue='high'>
                        <MenuItem value='critical'>🔴 Critical ($50K+)</MenuItem>
                        <MenuItem value='high'>🟠 High ($10K-$50K)</MenuItem>
                        <MenuItem value='medium'>🟡 Medium ($1K-$10K)</MenuItem>
                        <MenuItem value='low'>🟢 Low ($100-$1K)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label='Vulnerability Description'
                      placeholder='Describe the vulnerability and its impact...'
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display='flex' gap={2}>
                      <Button
                        variant='contained'
                        size='large'
                        startIcon={<PlayArrow />}
                        onClick={() => alert('PoC Generation will be implemented here')}
                      >
                        Generate PoC
                      </Button>
                      <Button
                        variant='outlined'
                        size='large'
                        startIcon={<Visibility />}
                      >
                        Preview Template
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Generated PoC Features
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Foundry Project Structure' />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Exploit Contract Template' />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Comprehensive Test Suite' />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Professional Documentation' />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Immunefi Compliance' />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CheckCircle color='success' /></ListItemIcon>
                        <ListItemText primary='Ready for Submission' />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
        {/* DeFi Protocols Tab */}
        <TabPanel value={tabValue} index={3}>
          <Alert severity='info' sx={{ mb: 2 }}>
            DeFi protocol analysis helps identify risks in decentralized finance applications.
          </Alert>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Uniswap V3 Analysis
                  </Typography>
                  <Typography color='textSecondary' paragraph>
                    Liquidity pool security assessment
                  </Typography>
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Chip label='Low Risk' color='success' size='small' />
                    <Button size='small' startIcon={<Analytics />}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Compound Protocol
                  </Typography>
                  <Typography color='textSecondary' paragraph>
                    Lending protocol security review
                  </Typography>
                  <Box display='flex' justifyContent='space-between' alignItems='center'>
                    <Chip label='Medium Risk' color='warning' size='small' />
                    <Button size='small' startIcon={<Analytics />}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        {/* Blockchain Scans Tab - Removed */}
          <Alert severity='info' sx={{ mb: 2 }}>
            Blockchain scans analyze transaction patterns and identify suspicious activities.
          </Alert>
          <Typography variant='h6' gutterBottom>
            Recent Scans
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Network</TableCell>
                  <TableCell>Block Range</TableCell>
                  <TableCell>Scan Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Findings</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Ethereum</TableCell>
                  <TableCell>18500000 - 18501000</TableCell>
                  <TableCell>Vulnerability Scan</TableCell>
                  <TableCell>
                    <Chip label='Completed' color='success' size='small' />
                  </TableCell>
                  <TableCell>3 suspicious transactions</TableCell>
                  <TableCell>
                    <IconButton size='small'>
                      <Visibility />
                    </IconButton>
                    <IconButton size='small'>
                      <GetApp />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
      {/* Contract Analysis Dialog */}
      <Dialog open={contractDialog} onClose={() => setContractDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Analyze Smart Contract</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Contract Address'
                value={contractForm.address}
                onChange={(e) => setContractForm({ ...contractForm, address: e.target.value })}
                placeholder='0x...'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Contract Name (Optional)'
                value={contractForm.name}
                onChange={(e) => setContractForm({ ...contractForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Network</InputLabel>
                <Select
                  value={contractForm.network}
                  onChange={(e) => setContractForm({ ...contractForm, network: e.target.value })}
                >
                  <MenuItem value='ethereum'>Ethereum</MenuItem>
                  <MenuItem value='polygon'>Polygon</MenuItem>
                  <MenuItem value='bsc'>Binance Smart Chain</MenuItem>
                  <MenuItem value='arbitrum'>Arbitrum</MenuItem>
                  <MenuItem value='optimism'>Optimism</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='ABI (Optional)'
                multiline
                rows={4}
                value={contractForm.abi}
                onChange={(e) => setContractForm({ ...contractForm, abi: e.target.value })}
                placeholder='Paste contract ABI JSON here...'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialog(false)}>Cancel</Button>
          <Button onClick={handleContractAnalysis} variant='contained'>
            Analyze Contract
          </Button>
        </DialogActions>
      </Dialog>
      {/* Blockchain Scan Dialog */}
      <Dialog open={scanDialog} onClose={() => setScanDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Blockchain Security Scan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Network</InputLabel>
                <Select
                  value={scanForm.network}
                  onChange={(e) => setScanForm({ ...scanForm, network: e.target.value })}
                >
                  <MenuItem value='ethereum'>Ethereum</MenuItem>
                  <MenuItem value='polygon'>Polygon</MenuItem>
                  <MenuItem value='bsc'>Binance Smart Chain</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Block Range'
                value={scanForm.blockRange}
                onChange={(e) => setScanForm({ ...scanForm, blockRange: e.target.value })}
                placeholder='1000'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Scan Type</InputLabel>
                <Select
                  value={scanForm.scanType}
                  onChange={(e) => setScanForm({ ...scanForm, scanType: e.target.value })}
                >
                  <MenuItem value='vulnerability'>Vulnerability Scan</MenuItem>
                  <MenuItem value='suspicious'>Suspicious Activity</MenuItem>
                  <MenuItem value='compliance'>Compliance Check</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialog(false)}>Cancel</Button>
          <Button onClick={handleBlockchainScan} variant='contained'>
            Start Scan
          </Button>
        </DialogActions>
      </Dialog>
      {/* DeFi Analysis Dialog */}
      <Dialog open={defiDialog} onClose={() => setDefiDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>DeFi Protocol Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Protocol</InputLabel>
                <Select
                  value={defiForm.protocol}
                  onChange={(e) => setDefiForm({ ...defiForm, protocol: e.target.value })}
                >
                  <MenuItem value='uniswap'>Uniswap</MenuItem>
                  <MenuItem value='compound'>Compound</MenuItem>
                  <MenuItem value='aave'>Aave</MenuItem>
                  <MenuItem value='curve'>Curve</MenuItem>
                  <MenuItem value='sushiswap'>SushiSwap</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Pool/Contract Address'
                value={defiForm.poolAddress}
                onChange={(e) => setDefiForm({ ...defiForm, poolAddress: e.target.value })}
                placeholder='0x...'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Token Pair (Optional)'
                value={defiForm.tokenPair}
                onChange={(e) => setDefiForm({ ...defiForm, tokenPair: e.target.value })}
                placeholder='ETH/USDC'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDefiDialog(false)}>Cancel</Button>
          <Button onClick={handleDefiAnalysis} variant='contained'>
            Analyze Protocol
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Web3Dashboard;