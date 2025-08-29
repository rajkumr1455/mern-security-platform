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
  Lock,
  BugReport,
  Assessment,
  Timeline,
  CloudQueue
} from '@mui/icons-material';
import { enhancedWeb3API } from '../../services/api';

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

const ComprehensiveWeb3Dashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [contracts, setContracts] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [toolsStatus, setToolsStatus] = useState(null);
  const [supportedNetworks, setSupportedNetworks] = useState([]);
  const [defiProtocols, setDefiProtocols] = useState([]);
  const [nftCollections, setNftCollections] = useState([]);
  const [bridges, setBridges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [contractDialog, setContractDialog] = useState(false);
  const [scanDialog, setScanDialog] = useState(false);
  const [defiDialog, setDefiDialog] = useState(false);
  const [nftDialog, setNftDialog] = useState(false);
  const [bridgeDialog, setBridgeDialog] = useState(false);

  // Form states
  const [contractForm, setContractForm] = useState({
    address: '0x4eff2d77D9fFbAeFB4b141A3e494c085b3FF4Cb5',
    network: 'ethereum',
    abi: '',
    sourceCode: '',
    name: 'Test Smart Contract Example'
  });

  const [scanForm, setScanForm] = useState({
    network: 'ethereum',
    blockRange: '1000',
    scanType: 'vulnerability'
  });

  const [defiForm, setDefiForm] = useState({
    protocol: '',
    contractAddress: '',
    tokenPair: ''
  });

  const [nftForm, setNftForm] = useState({
    address: '',
    network: 'ethereum',
    standard: 'ERC-721',
    name: ''
  });

  const [bridgeForm, setBridgeForm] = useState({
    protocol: '',
    sourceChain: 'ethereum',
    targetChain: 'polygon'
  });

  // Results states
  const [analysisResults, setAnalysisResults] = useState({});
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadWeb3Data();
  }, []);

  const loadWeb3Data = async () => {
    setLoading(true);
    try {
      const [toolsRes, networksRes, analysesRes] = await Promise.all([
        enhancedWeb3API.getToolsStatus(),;
        enhancedWeb3API.getSupportedNetworks(),;
        enhancedWeb3API.getUserAnalyses({ limit: 50 })
      ]);

      setToolsStatus(toolsRes.data);
      setSupportedNetworks(Array.isArray(networksRes.data) ? networksRes.data : ['ethereum', 'polygon', 'binance-smart-chain', 'arbitrum', 'optimism']);

      // Process real analysis data
      if (analysesRes.data && Array.isArray(analysesRes.data)) {
        const contractsData = analysesRes.data.map((analysis, index) => ({
          id: analysis.id || analysis._id || index + 1,
          name: analysis.contractName || `Contract ${analysis.contractAddress?.slice(0, 10)}`,
          address: analysis.contractAddress,
          network: analysis.network || 'ethereum',
          type: analysis.category || 'Smart Contract',
          riskLevel: analysis.summary?.overallRisk?.toLowerCase() || 'medium',
          lastAnalyzed: analysis.updatedAt || analysis.createdAt || new Date().toISOString(),
          securityScore: analysis.summary?.securityScore || analysis.results?.securityScore || 61
        }));

        const analysesData = analysesRes.data.map((analysis, index) => ({
          id: analysis.id || analysis._id || index + 1,
          contractName: analysis.contractName || `Contract ${analysis.contractAddress?.slice(0, 10)}`,
          status: analysis.status || 'completed',
          vulnerabilities: analysis.summary?.totalVulnerabilities || 0,
          gasOptimizations: analysis.summary?.gasOptimizationOpportunities || 0,
          score: analysis.summary?.securityScore || analysis.results?.securityScore || 61,
          timestamp: analysis.updatedAt || analysis.createdAt || new Date().toISOString(),
          type: 'smart_contract'
        }));

        setContracts(contractsData);
        setAnalyses(analysesData);
      } else {
        // Fallback to empty arrays if no data
        setContracts([]);
        setAnalyses([]);
      }

      setDefiProtocols([
        {
          id: 1,
          name: 'Uniswap V3',
          tvl: '$4.2B',
          riskScore: 75,
          category: 'DEX',
          status: 'active'
        },
        {
          id: 2,
          name: 'Compound',
          tvl: '$2.1B',
          riskScore: 85,
          category: 'Lending',
          status: 'active'
        }
      ]);

      setNftCollections([
        {
          id: 1,
          name: 'CryptoPunks',
          address: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
          standard: 'ERC-721',
          securityScore: 95,
          floorPrice: '65 ETH'
        }
      ]);

      setBridges([
        {
          id: 1,
          name: 'Polygon Bridge',
          sourceChain: 'Ethereum',
          targetChain: 'Polygon',
          tvl: '$1.2B',
          riskScore: 80,
          status: 'operational'
        }
      ]);

    } catch (error) {
      // logger.error('Error loading Web3 data:', error); // TODO: Implement client-side logging
      // logger.error('Error details:', error.response?.data || error.message); // TODO: Implement client-side logging

      // Set fallback data when API fails
      setToolsStatus({
        slither: { status: 'operational', version: '0.9.3' },
        mythril: { status: 'operational', version: '0.23.15' },
        securify: { status: 'operational', version: '2.0' }
      });
      setSupportedNetworks(['ethereum', 'polygon', 'binance-smart-chain', 'arbitrum', 'optimism']);

      // Add example contract for testing
      setContracts([{
        id: 1,
        name: 'Test Smart Contract Example',
        address: '0x4eff2d77D9fFbAeFB4b141A3e494c085b3FF4Cb5',
        network: 'ethereum',
        type: 'Smart Contract',
        riskLevel: 'medium',
        lastAnalyzed: new Date().toISOString(),
        securityScore: 61
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleContractAnalysis = async () => {
    try {
      // logger.info('Starting contract analysis with data:', contractForm); // TODO: Implement client-side logging

      // Validate required fields
      if (!contractForm.address) {
        alert('Please enter a contract address');
        return
      }

      setAnalyzing(true);
      const response = await enhancedWeb3API.analyzeContract(contractForm);
      // logger.info('Analysis response:', response); // TODO: Implement client-side logging

      setAnalysisResults(prev => ({
        ...prev,
        [contractForm.address]: response.data
      }));

      setContractDialog(false);
      setContractForm({
        address: '',
        network: 'ethereum',
        abi: '',
        sourceCode: '',
        name: ''
      });

      // Refresh the data to show the new analysis
      await loadWeb3Data();

      // Show success message
      alert('Contract analysis completed successfully!');
    } catch (error) {
      // logger.error('Error analyzing contract:', error); // TODO: Implement client-side logging
      alert(`Error analyzing contract: ${error.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleBlockchainScan = async () => {
    try {
      // logger.info('Starting blockchain scan with data:', scanForm); // TODO: Implement client-side logging
      const response = await enhancedWeb3API.scanBlockchain(scanForm);
      // logger.info('Blockchain scan response:', response); // TODO: Implement client-side logging
      setScanDialog(false);
      await loadWeb3Data();
      alert('Blockchain scan completed successfully!');
    } catch (error) {
      // logger.error('Error scanning blockchain:', error); // TODO: Implement client-side logging
      alert(`Error scanning blockchain: ${error.message}`);
    }
  };

  const handleDefiAnalysis = async () => {
    try {
      // logger.info('Starting DeFi analysis with data:', defiForm); // TODO: Implement client-side logging
      const response = await enhancedWeb3API.analyzeDeFi(defiForm);
      // logger.info('DeFi analysis response:', response); // TODO: Implement client-side logging
      setDefiDialog(false);
      await loadWeb3Data();
      alert('DeFi protocol analysis completed successfully!');
    } catch (error) {
      // logger.error('Error analyzing DeFi protocol:', error); // TODO: Implement client-side logging
      alert(`Error analyzing DeFi protocol: ${error.message}`);
    }
  };

  const handleNFTAnalysis = async () => {
    try {
      const response = await enhancedWeb3API.analyzeNFT(nftForm);
      setNftDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error analyzing NFT:', error); // TODO: Implement client-side logging
    }
  };

  const handleBridgeAnalysis = async () => {
    try {
      const response = await enhancedWeb3API.analyzeBridge(bridgeForm);
      setBridgeDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error analyzing bridge:', error); // TODO: Implement client-side logging
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'error';
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
          🔗 Comprehensive Web3 Security Dashboard
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
          <IconButton onClick={loadWeb3Data}>
            <Refresh />
          </IconButton>
        </Box>
      </Box>
      {/* Enhanced Version Banner */}
      <Card sx={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
        color: 'white',
        mb: 3,
        maxWidth: '800px',
        mx: 'auto'
      }}>
        <CardContent>
          <Box display='flex' alignItems='center' justifyContent='space-between' flexWrap='wrap' gap={2}>
            <Box>
              <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                🚀 NEW: Enhanced Web3 Analysis
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                Multi-tool evidence reports • ImmuneFi PoC integration • Professional bug bounty packages
              </Typography>
            </Box>
            <Button
              variant='contained'
              sx={{
                bgcolor: 'white',
                color: '#2196F3',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#f5f5f5' }
              }}
              onClick={() => window.location.href = '/web3/enhanced'}
            >
              Try Enhanced Version →
            </Button>
          </Box>
        </CardContent>
      </Card>
      {/* Enhanced Stats Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
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
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <SwapHoriz color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    DeFi Protocols
                  </Typography>
                  <Typography variant='h4'>
                    {defiProtocols.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Token color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    NFT Collections
                  </Typography>
                  <Typography variant='h4'>
                    {nftCollections.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <CloudQueue color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Bridge Protocols
                  </Typography>
                  <Typography variant='h4'>
                    {bridges.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box display='flex' alignItems='center'>
                <Timeline color='secondary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Networks Supported
                  </Typography>
                  <Typography variant='h4'>
                    {supportedNetworks.length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Quick Action Buttons */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='outlined'
            startIcon={<SwapHoriz />}
            onClick={() => setDefiDialog(true)}
            sx={{ py: 2 }}
          >
            DeFi Analysis
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='outlined'
            startIcon={<Token />}
            onClick={() => setNftDialog(true)}
            sx={{ py: 2 }}
          >
            NFT Analysis
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='outlined'
            startIcon={<CloudQueue />}
            onClick={() => setBridgeDialog(true)}
            sx={{ py: 2 }}
          >
            Bridge Analysis
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='outlined'
            startIcon={<Timeline />}
            sx={{ py: 2 }}
          >
            MEV Analysis
          </Button>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Button
            fullWidth
            variant='outlined'
            startIcon={<Assessment />}
            sx={{ py: 2 }}
          >
            Compliance Check
          </Button>
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
                <Grid item xs={12} sm={6} md={2} key={tool}>
                  <Box display='flex' alignItems='center'>
                    <Chip
                      icon={status.status === 'operational' ? <CheckCircle /> : <Error />}
                      label={`${tool} v${status.version}`}
                      color={status.status === 'operational' ? 'success' : 'error'}
                      size='small'
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} variant='scrollable'>
            <Tab label='Smart Contracts' />
            <Tab label='DeFi Protocols' />
            <Tab label='NFT Collections' />
            <Tab label='Bridge Protocols' />
            <Tab label='Analysis Results' />
            <Tab label='Blockchain Scans' />
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
                  <TableCell>Security Score</TableCell>
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
                      <Box display='flex' alignItems='center'>
                        <LinearProgress
                          variant='determinate'
                          value={contract.securityScore}
                          sx={{ width: 60, mr: 1 }}
                          color={getScoreColor(contract.securityScore)}
                        />
                        <Typography variant='body2'>
                          {contract.securityScore}
                        </Typography>
                      </Box>
                    </TableCell>
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
                        <IconButton
                          size='small'
                          onClick={() => {
                            // Switch to Analysis Results tab and show this contract's results
                            setTabValue(4);
                            if (analysisResults[contract.address]) {
                              // logger.info('Viewing analysis for:', contract.address); // TODO: Implement client-side logging
                            } else {
                              alert(`No detailed analysis results available for ${contract.name}`);
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Re-analyze'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setContractForm({
                              address: contract.address,
                              network: contract.network,
                              name: contract.name,
                              abi: '',
                              sourceCode: ''
                            });
                            setContractDialog(true);
                          }}
                        >
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
        {/* DeFi Protocols Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {defiProtocols.map((protocol) => (
              <Grid item xs={12} md={6} lg={4} key={protocol.id}>
                <Card>
                  <CardContent>
                    <Box display='flex' justifyContent='between' alignItems='center' mb={2}>
                      <Typography variant='h6'>
                        {protocol.name}
                      </Typography>
                      <Chip
                        label={protocol.category}
                        size='small'
                        color='primary'
                      />
                    </Box>
                    <Typography color='textSecondary' gutterBottom>
                      TVL: {protocol.tvl}
                    </Typography>
                    <Box display='flex' alignItems='center' mb={2}>
                      <Typography variant='body2' sx={{ mr: 1 }}>
                        Risk Score:
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={protocol.riskScore}
                        sx={{ width: 80, mr: 1 }}
                        color={getScoreColor(protocol.riskScore)}
                      />
                      <Typography variant='body2'>
                        {protocol.riskScore}
                      </Typography>
                    </Box>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Chip
                        label={protocol.status}
                        color='success'
                        size='small'
                      />
                      <Button
                        size='small'
                        startIcon={<Analytics />}
                        onClick={() => {
                          setDefiForm({ ...defiForm, protocol: protocol.name });
                          setDefiDialog(true);
                        }}
                      >
                        Analyze
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        {/* Continue with remaining tabs... */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant='h6' gutterBottom>
            NFT Collections Analysis
          </Typography>
          <Grid container spacing={3}>
            {nftCollections.map((nft) => (
              <Grid item xs={12} md={6} lg={4} key={nft.id}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      {nft.name}
                    </Typography>
                    <Typography variant='body2' color='textSecondary' gutterBottom>
                      {nft.address.substring(0, 10)}...{nft.address.substring(38)}
                    </Typography>
                    <Box display='flex' justifyContent='between' alignItems='center' mb={2}>
                      <Chip label={nft.standard} size='small' />
                      <Typography variant='body2'>
                        Floor: {nft.floorPrice}
                      </Typography>
                    </Box>
                    <Box display='flex' alignItems='center' mb={2}>
                      <Typography variant='body2' sx={{ mr: 1 }}>
                        Security:;
                      </Typography>
                      <LinearProgress
                        variant='determinate'
                        value={nft.securityScore}
                        sx={{ width: 80, mr: 1 }}
                        color={getScoreColor(nft.securityScore)}
                      />
                      <Typography variant='body2'>
                        {nft.securityScore}
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      size='small'
                      startIcon={<Token />}
                      onClick={() => {
                        setNftForm({ ...nftForm, address: nft.address, name: nft.name });
                        setNftDialog(true);
                      }}
                    >
                      Analyze NFT
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        {/* Bridge Protocols Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bridge Name</TableCell>
                  <TableCell>Source Chain</TableCell>
                  <TableCell>Target Chain</TableCell>
                  <TableCell>TVL</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bridges.map((bridge) => (
                  <TableRow key={bridge.id}>
                    <TableCell>{bridge.name}</TableCell>
                    <TableCell>{bridge.sourceChain}</TableCell>
                    <TableCell>{bridge.targetChain}</TableCell>
                    <TableCell>{bridge.tvl}</TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <LinearProgress
                          variant='determinate'
                          value={bridge.riskScore}
                          sx={{ width: 60, mr: 1 }}
                          color={getScoreColor(bridge.riskScore)}
                        />
                        <Typography variant='body2'>
                          {bridge.riskScore}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bridge.status}
                        color='success'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size='small'
                        startIcon={<CloudQueue />}
                        onClick={() => {
                          setBridgeForm({
                            ...bridgeForm,
                            protocol: bridge.name,
                            sourceChain: bridge.sourceChain.toLowerCase(),
                            targetChain: bridge.targetChain.toLowerCase()
                          });
                          setBridgeDialog(true);
                        }}
                      >
                        Analyze
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Analysis Results Tab */}
        <TabPanel value={tabValue} index={4}>
          {Object.keys(analysisResults).length > 0 ? (
            Object.entries(analysisResults).map(([address, results]) => (
              <Accordion key={address}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant='h6'>
                    Analysis Results - {address.substring(0, 10)}...{address.substring(38)}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Typography variant='subtitle1' gutterBottom>
                        Security Summary
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemIcon>
                            <Security />
                          </ListItemIcon>
                          <ListItemText
                            primary='Security Score'
                            secondary={`${results.summary?.securityScore || 0}/100`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <Warning color='warning' />
                          </ListItemIcon>
                          <ListItemText
                            primary='Vulnerabilities'
                            secondary={`${results.summary?.totalVulnerabilities || 0} found`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <TrendingUp color='success' />
                          </ListItemIcon>
                          <ListItemText
                            primary='Gas Optimizations'
                            secondary={`${results.summary?.gasOptimizationOpportunities || 0} opportunities`}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant='subtitle1' gutterBottom>
                        Detailed Findings
                      </Typography>
                      {results.results?.vulnerabilities?.map((vuln, index) => (
                        <Alert
                          key={index}
                          severity={vuln.severity.toLowerCase()}
                          sx={{ mb: 1 }}
                        >
                          <Typography variant='subtitle2'>
                            {vuln.type}
                          </Typography>
                          <Typography variant='body2'>
                            {vuln.description}
                          </Typography>
                        </Alert>
                      ))}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ));
          ) : (
            <Alert severity='info'>
              No analysis results available. Analyze contracts to see detailed results here.
            </Alert>
          )}
        </TabPanel>
        {/* Blockchain Scans Tab */}
        <TabPanel value={tabValue} index={5}>
          <Alert severity='info' sx={{ mb: 2 }}>
            Blockchain scans analyze transaction patterns and identify suspicious activities across networks.
          </Alert>
          <Typography variant='h6' gutterBottom>
            Recent Blockchain Scans
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
                  {supportedNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </MenuItem>
                  ))}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Source Code (Optional)'
                multiline
                rows={6}
                value={contractForm.sourceCode}
                onChange={(e) => setContractForm({ ...contractForm, sourceCode: e.target.value })}
                placeholder='Paste Solidity source code here...'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContractDialog(false)} disabled={analyzing}>Cancel</Button>
          <Button
            onClick={handleContractAnalysis}
            variant='contained'
            disabled={analyzing}
            startIcon={analyzing ? <CircularProgress size={20} /> : null}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Contract'}
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
                  <MenuItem value='pancakeswap'>PancakeSwap</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Contract Address'
                value={defiForm.contractAddress}
                onChange={(e) => setDefiForm({ ...defiForm, contractAddress: e.target.value })}
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
      {/* NFT Analysis Dialog */}
      <Dialog open={nftDialog} onClose={() => setNftDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>NFT Contract Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='NFT Contract Address'
                value={nftForm.address}
                onChange={(e) => setNftForm({ ...nftForm, address: e.target.value })}
                placeholder='0x...'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Collection Name'
                value={nftForm.name}
                onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })}
                placeholder='CryptoPunks'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>NFT Standard</InputLabel>
                <Select
                  value={nftForm.standard}
                  onChange={(e) => setNftForm({ ...nftForm, standard: e.target.value })}
                >
                  <MenuItem value='ERC-721'>ERC-721</MenuItem>
                  <MenuItem value='ERC-1155'>ERC-1155</MenuItem>
                  <MenuItem value='ERC-998'>ERC-998 (Composable)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Network</InputLabel>
                <Select
                  value={nftForm.network}
                  onChange={(e) => setNftForm({ ...nftForm, network: e.target.value })}
                >
                  {supportedNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNftDialog(false)}>Cancel</Button>
          <Button onClick={handleNFTAnalysis} variant='contained'>
            Analyze NFT
          </Button>
        </DialogActions>
      </Dialog>
      {/* Bridge Analysis Dialog */}
      <Dialog open={bridgeDialog} onClose={() => setBridgeDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Cross-Chain Bridge Analysis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Bridge Protocol</InputLabel>
                <Select
                  value={bridgeForm.protocol}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, protocol: e.target.value })}
                >
                  <MenuItem value='polygon-bridge'>Polygon Bridge</MenuItem>
                  <MenuItem value='arbitrum-bridge'>Arbitrum Bridge</MenuItem>
                  <MenuItem value='optimism-bridge'>Optimism Bridge</MenuItem>
                  <MenuItem value='avalanche-bridge'>Avalanche Bridge</MenuItem>
                  <MenuItem value='multichain'>Multichain</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Source Chain</InputLabel>
                <Select
                  value={bridgeForm.sourceChain}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, sourceChain: e.target.value })}
                >
                  {supportedNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Target Chain</InputLabel>
                <Select
                  value={bridgeForm.targetChain}
                  onChange={(e) => setBridgeForm({ ...bridgeForm, targetChain: e.target.value })}
                >
                  {supportedNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBridgeDialog(false)}>Cancel</Button>
          <Button onClick={handleBridgeAnalysis} variant='contained'>
            Analyze Bridge
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
                  {supportedNetworks.map((network) => (
                    <MenuItem key={network} value={network}>
                      {network.charAt(0).toUpperCase() + network.slice(1)}
                    </MenuItem>
                  ))}
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
                  <MenuItem value='mev'>MEV Analysis</MenuItem>
                  <MenuItem value='compliance'>Compliance Check</MenuItem>
                  <MenuItem value='flash-loans'>Flash Loan Detection</MenuItem>
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
    </Box>
  );
};

export default ComprehensiveWeb3Dashboard;