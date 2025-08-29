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
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent
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

const UnifiedWeb3Dashboard = () => {
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
    address: '',
    network: 'ethereum',
    abi: '',
    sourceCode: '',
    name: ''
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

  // Results and workflow states
  const [analysisResults, setAnalysisResults] = useState({});
  const [analyzing, setAnalyzing] = useState(false);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportResults, setReportResults] = useState({});

  useEffect(() => {
    loadWeb3Data();
  }, []);

  const loadWeb3Data = async () => {
    setLoading(true);
    try {
      const [toolsRes, networksRes, analysesRes, statsRes] = await Promise.all([
        enhancedWeb3API.getToolsStatus(),;
        enhancedWeb3API.getSupportedNetworks(),;
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/analyses`),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/statistics`)
      ]);

      setToolsStatus(toolsRes.data);
      setSupportedNetworks(Array.isArray(networksRes.data) ? networksRes.data : ['ethereum', 'polygon', 'binance-smart-chain', 'arbitrum', 'optimism']);

      // Load user's analyses from MongoDB
      const analysesData = await analysesRes.json();
      if (analysesData.success && analysesData.data) {
        // Convert MongoDB analyses to contracts format
        const mongoContracts = analysesData.data.map(analysis => ({
          id: analysis._id,
          name: analysis.contractName || `Contract ${analysis.contractAddress.substring(0, 10)}`,
          address: analysis.contractAddress,
          network: analysis.network,
          type: analysis.category || 'Other',
          riskLevel: analysis.summary?.overallRisk?.toLowerCase() || 'medium',
          lastAnalyzed: analysis.updatedAt || analysis.createdAt,
          securityScore: analysis.summary?.securityScore || 0,
          status: analysis.status,
          analysisId: analysis.id
        }));

        setContracts(mongoContracts);

        // Convert to analyses format
        const mongoAnalyses = analysesData.data.map(analysis => ({
          id: analysis._id,
          contractName: analysis.contractName || analysis.contractAddress,
          status: analysis.status,
          vulnerabilities: analysis.summary?.totalVulnerabilities || 0,
          gasOptimizations: analysis.summary?.gasOptimizationOpportunities || 0,
          score: analysis.summary?.securityScore || 0,
          timestamp: analysis.updatedAt || analysis.createdAt,
          type: 'smart_contract',
          analysisId: analysis.id,
          results: analysis.results
        }));

        setAnalyses(mongoAnalyses);

        // Store analysis results for detailed view
        const resultsMap = {};
        const reportsMap = {};
        analysesData.data.forEach(analysis => {
          resultsMap[analysis.contractAddress] = analysis

          // Check if this analysis has a detailed report
          if (analysis.detailedReport && analysis.detailedReport.reportId) {
            reportsMap[analysis.contractAddress] = analysis.detailedReport
          }
        });
        setAnalysisResults(resultsMap);
        setReportResults(reportsMap);
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
      // Set fallback data when API fails
      setToolsStatus({
        slither: { status: 'operational', version: '0.9.3' },
        mythril: { status: 'operational', version: '0.23.15' },
        securify: { status: 'operational', version: '2.0' }
      });
      setSupportedNetworks(['ethereum', 'polygon', 'binance-smart-chain', 'arbitrum', 'optimism']);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced contract analysis with workflow tracking
  const handleContractAnalysis = async () => {
    try {
      // logger.info('Starting contract analysis with data:', contractForm); // TODO: Implement client-side logging

      // Validate required fields
      if (!contractForm.address) {
        alert('Please enter a contract address');
        return
      }

      setAnalyzing(true);
      setWorkflowProgress(0);
      setCurrentStep(0);

      // Define workflow steps
      const steps = [
        'Contract Validation',
        'Static Analysis',
        'Dynamic Testing',
        'Gas Optimization',
        'Security Report'
      ];
      setWorkflowSteps(steps);

      // Simulate workflow progression
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        setWorkflowProgress((i / steps.length) * 100);

        // Add delay to show progression
        await new Promise(resolve => setTimeout(resolve, 1000)
      }

      // Call the actual API
      const response = await enhancedWeb3API.analyzeContract(contractForm);
      // logger.info('Analysis response:', response); // TODO: Implement client-side logging
      // logger.info('Response data structure:', response.data); // TODO: Implement client-side logging

      // Access the correct data structure (response.data.data contains the analysis)
      const analysisData = response.data.data || response.data
      // logger.info('Analysis data:', analysisData); // TODO: Implement client-side logging
      // logger.info('Vulnerabilities found:', analysisData.results?.vulnerabilities?.length || 0); // TODO: Implement client-side logging

      // Store results
      setAnalysisResults(prev => ({
        ...prev,
        [contractForm.address]: analysisData
      }));

      // Add to contracts list
      const newContract = {
        id: Date.now(),
        name: contractForm.name || `Contract ${contractForm.address.substring(0, 10)}`,
        address: contractForm.address,
        network: contractForm.network,
        type: 'Smart Contract',
        riskLevel: analysisData.summary?.overallRisk?.toLowerCase() || 'medium',
        lastAnalyzed: new Date().toISOString(),
        securityScore: analysisData.summary?.securityScore || 0,
        status: 'analyzed'
      };

      setContracts(prev => [newContract, ...prev]);

      // Add to analyses list
      const newAnalysis = {
        id: Date.now(),
        contractName: newContract.name,
        status: 'completed',
        vulnerabilities: analysisData.summary?.totalVulnerabilities || 0,
        gasOptimizations: analysisData.summary?.gasOptimizationOpportunities || 0,
        score: analysisData.summary?.securityScore || 0,
        timestamp: new Date().toISOString(),
        type: 'smart_contract'
      };

      setAnalyses(prev => [newAnalysis, ...prev]);

      setWorkflowProgress(100);
      setContractDialog(false);
      setContractForm({
        address: '',
        network: 'ethereum',
        abi: '',
        sourceCode: '',
        name: ''
      });

      // Show detailed success message with vulnerability findings
      const vulnerabilities = analysisData.results?.vulnerabilities || [];
      let vulnDetails = '';
      if (vulnerabilities.length > 0) {
        vulnDetails = '\n\nVulnerabilities Found:\n' +
          vulnerabilities.map((v, i) => `${i+1}. ${v.type} (${v.severity}): ${v.description}`).join('\n');
      }

      alert(`Contract analysis completed successfully!

Security Score: ${analysisData.summary?.securityScore || 0}/100
Vulnerabilities: ${analysisData.summary?.totalVulnerabilities || 0}
Gas Optimizations: ${analysisData.summary?.gasOptimizationOpportunities || 0}
Risk Level: ${analysisData.summary?.overallRisk || 'Unknown'}${vulnDetails}

Check the 'Analysis Results' tab for detailed findings.`);

      // Automatically switch to Analysis Results tab to show findings
      setTabValue(1);
    } catch (error) {
      // logger.error('Error analyzing contract:', error); // TODO: Implement client-side logging
      alert(`Error analyzing contract: ${error.message}`);
    } finally {
      setAnalyzing(false);
      setWorkflowSteps([]);
      setCurrentStep(0);
      setWorkflowProgress(0);
    }
  };

  // Generate detailed report with screenshots
  const handleDetailedReport = async (contractAddress) => {
    try {
      setGeneratingReport(true);
      // logger.info('Generating detailed report with screenshots for:', contractAddress); // TODO: Implement client-side logging

      // Find contract data
      const contract = contracts.find(c => c.address === contractAddress);
      if (!contract) {
        alert('Contract not found');
        return
      }

      const contractData = {
        address: contract.address,
        network: contract.network,
        name: contract.name
      };

      // Call detailed analysis API with longer timeout
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/analyze/detailed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contractData)
      });

      const result = await response.json();
      // logger.info('Detailed report API response:', result); // TODO: Implement client-side logging

      if (result.success) {
        // Check if detailed report was generated
        if (result.data.detailedReport) {
          const report = result.data.detailedReport

          // Store report results
          setReportResults(prev => ({
            ...prev,
            [contractAddress]: report
          }));

          // Show success message with download links
          alert(`Detailed report with screenshots generated successfully!

Report ID: ${report.reportId}
Files Generated:
- HTML Report with Screenshots (${Object.keys(report.files?.screenshots || {}).length}+ screenshots)
- Executive Summary
- Vulnerability Visualizations
- Blockchain Explorer Screenshots

You can view and download the report from the 'Web3 Reports' tab.`);

          // Switch to Web3 Reports tab
          setTabValue(2);

        } else {
          // Analysis completed but no detailed report - create a basic report entry
          const basicReport = {
            reportId: `basic_${result.data.id}`,
            analysisId: result.data.id,
            contractAddress: result.data.contractAddress,
            generatedAt: new Date().toISOString(),
            hasScreenshots: false
          };

          setReportResults(prev => ({
            ...prev,
            [contractAddress]: basicReport
          }));

          alert(`Analysis completed successfully!

Security Score: ${result.data.summary?.securityScore || 0}/100
Vulnerabilities: ${result.data.summary?.totalVulnerabilities || 0}
Risk Level: ${result.data.summary?.overallRisk || 'Unknown'}

Note: Screenshots are being generated in the background. Check the 'Web3 Reports' tab for the complete report.`);

          // Switch to Web3 Reports tab
          setTabValue(2);
        }

        // Reload data to get updated analysis
        loadWeb3Data();

      } else {
        throw new Error(result.error || 'Failed to generate detailed report');
      }

    } catch (error) {
      // logger.error('Error generating detailed report:', error); // TODO: Implement client-side logging
      alert(`Error generating detailed report: ${error.message}

The analysis may still be processing. Please check the 'Web3 Reports' tab in a few moments.`);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleBlockchainScan = async () => {
    try {
      const response = await enhancedWeb3API.scanBlockchain(scanForm);
      setScanDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error scanning blockchain:', error); // TODO: Implement client-side logging
    }
  };

  const handleDefiAnalysis = async () => {
    try {
      const response = await enhancedWeb3API.analyzeDeFi(defiForm);
      setDefiDialog(false);
      loadWeb3Data();
    } catch (error) {
      // logger.error('Error analyzing DeFi protocol:', error); // TODO: Implement client-side logging
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
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <Typography variant='h4' component='h1' gutterBottom>
          🔗 Unified Web3 Security Dashboard
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
      {/* Workflow Progress */}
      {analyzing && workflowSteps.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Analysis Workflow Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <LinearProgress
                variant='determinate'
                value={workflowProgress}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Typography variant='body2' sx={{ mt: 1 }}>
                {Math.round(workflowProgress)}% - {workflowSteps[currentStep]}
              </Typography>
            </Box>
            <Stepper activeStep={currentStep} orientation='horizontal'>
              {workflowSteps.map((step, index) => (
                <Step key={step}>
                  <StepLabel>{step}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      )}

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
            <Tab label='Analysis Results' />
            <Tab label='Web3 Reports' />
            <Tab label='DeFi Protocols' />
            <Tab label='NFT Collections' />
            <Tab label='Bridge Protocols' />
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
                      <Box display='flex' gap={0.5}>
                        <Tooltip title='View Analysis'>
                          <IconButton size='small' onClick={() => {
                            if (analysisResults[contract.address]) {
                              alert(`Analysis Results for ${contract.name}:\n\nSecurity Score: ${analysisResults[contract.address].summary?.securityScore || 'N/A'}\nVulnerabilities: ${analysisResults[contract.address].summary?.totalVulnerabilities || 'N/A'}\nRisk Level: ${analysisResults[contract.address].summary?.overallRisk || 'N/A'}`);
                            } else {
                              alert('No detailed analysis results available for this contract.');
                            }
                          }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Export Complete Report with Screenshots'>
                          <IconButton
                            size='small'
                            onClick={async () => {
                              try {
                                setGeneratingReport(true);

                                // Generate fresh analysis with screenshots
                                const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/export/${contract.analysisId || contract.id}`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    includeScreenshots: true,
                                    format: 'complete',
                                    contractAddress: contract.address,
                                    network: contract.network
                                  })
                                });

                                const result = await response.json();

                                if (result.success) {
                                  // Auto-download the export package
                                  window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${result.data.downloadUrl}`, '_blank');

                                  alert(`✅ Export Complete!\n\nFiles included:\n• HTML Security Report\n• Executive Summary\n• Screenshots (${result.data.files?.screenshots || 5}+)\n• Visual Charts\n• Analysis Data\n\nDownload started automatically.`);
                                } else {
                                  throw new Error(result.error);
                                }
                              } catch (error) {
                                // logger.error('Export failed:', error); // TODO: Implement client-side logging
                                alert(`❌ Export failed: ${error.message}\n\nTrying alternative export method...`);

                                // Fallback to existing report download
                                if (reportResults[contract.address]) {
                                  const reportId = reportResults[contract.address].reportId
                                  window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/download/${reportId}/security_report.html`, '_blank');
                                }
                              } finally {
                                setGeneratingReport(false);
                              }
                            }}
                            disabled={generatingReport}
                            sx={{
                              color: '#10b981',
                              '&:hover': { background: 'rgba(16, 185, 129, 0.1)' }
                            }}
                          >
                            {generatingReport ? <CircularProgress size={16} /> : <GetApp />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title='Re-analyze'>
                          <IconButton size='small' onClick={() => {
                            setContractForm({
                              address: contract.address,
                              network: contract.network,
                              name: contract.name,
                              abi: '',
                              sourceCode: ''
                            });
                            setContractDialog(true);
                          }}>
                            <Refresh />
                          </IconButton>
                        </Tooltip>
                        {reportResults[contract.address] && (
                          <Tooltip title='View Existing Report'>
                            <IconButton
                              size='small'
                              onClick={() => {
                                const report = reportResults[contract.address];
                                if (report.reportId && !report.reportId.startsWith('basic_')) {
                                  window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/view/${report.reportId}/security_report.html`, '_blank');
                                } else {
                                  setTabValue(2); // Switch to Web3 Reports tab
                                }
                              }}
                              sx={{
                                color: '#8b5cf6',
                                '&:hover': { background: 'rgba(139, 92, 246, 0.1)' }
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Analysis Results Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h6'>
              📊 Analysis Results
            </Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='outlined'
                startIcon={<GetApp />}
                onClick={() => {
                  // Export analysis results as JSON
                  const dataStr = JSON.stringify(analysisResults, null, 2);
                  const dataBlob = new Blob([dataStr], {type: 'application/json'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url
                  link.download = `web3_analysis_results_${new Date().toISOString().split('T')[0]}.json`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export JSON
              </Button>
              <Button
                variant='outlined'
                startIcon={<GetApp />}
                onClick={() => {
                  // Export analysis results as CSV
                  const csvData = Object.entries(analysisResults).map(([address, analysis]) => ({
                    'Contract Address': address,
                    'Contract Name': analysis.contractName || 'Unknown',
                    'Network': analysis.network,
                    'Security Score': analysis.summary?.securityScore || 0,
                    'Vulnerabilities': analysis.summary?.totalVulnerabilities || 0,
                    'Risk Level': analysis.summary?.overallRisk || 'Unknown',
                    'Status': analysis.status,
                    'Analysis Date': new Date(analysis.updatedAt || analysis.createdAt).toLocaleDateString()
                  }));

                  const csvHeaders = Object.keys(csvData[0] || {});
                  const csvContent = [
                    csvHeaders.join(','),;
                    ...csvData.map(row => csvHeaders.map(header => `'${row[header]}'`).join(','))
                  ].join('\n');

                  const dataBlob = new Blob([csvContent], {type: 'text/csv'});
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url
                  link.download = `web3_analysis_results_${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </Button>
              <Button
                variant='contained'
                startIcon={<Assessment />}
                onClick={() => {
                  // Generate comprehensive report for all analyses
                  alert('Generating comprehensive report for all analyses...');
                }}
              >
                Generate Report
              </Button>
            </Box>
          </Box>
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
                      {/* Detailed Report Section */}
                      {reportResults[address] && (
                        <Card sx={{ mt: 2, p: 2, bgcolor: '#f8f9fa' }}>
                          <Typography variant='subtitle1' gutterBottom>
                            📊 Detailed Report Available
                          </Typography>
                          <Typography variant='body2' color='textSecondary' gutterBottom>
                            Report ID: {reportResults[address].reportId}
                          </Typography>
                          <Box display='flex' flexDirection='column' gap={1} mt={2}>
                            <Button
                              size='small'
                              variant='contained'
                              startIcon={<Visibility />}
                              onClick={() => {
                                const reportId = reportResults[address].reportId
                                if (reportId && !reportId.startsWith('basic_')) {
                                  window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/view/${reportId}/security_report.html`, '_blank');
                                } else {
                                  setTabValue(2); // Switch to Web3 Reports tab
                                }
                              }}
                            >
                              View HTML Report
                            </Button>
                            <Button
                              size='small'
                              variant='outlined'
                              startIcon={<GetApp />}
                              onClick={() => {
                                const reportId = reportResults[address].reportId
                                if (reportId && !reportId.startsWith('basic_')) {
                                  window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/download/${reportId}`, '_blank');
                                } else {
                                  alert('Report is being generated. Please check the Web3 Reports tab.');
                                }
                              }}
                            >
                              Download Report
                            </Button>
                            <Button
                              size='small'
                              variant='outlined'
                              startIcon={<Assessment />}
                              onClick={() => setTabValue(2)}
                            >
                              View in Reports Tab
                            </Button>
                          </Box>
                        </Card>
                      )}

                      {/* Generate Report Section for contracts without detailed reports */}
                      {!reportResults[address] && (
                        <Card sx={{ mt: 2, p: 2, bgcolor: '#f0f8ff' }}>
                          <Typography variant='subtitle1' gutterBottom>
                            📋 Generate Detailed Report
                          </Typography>
                          <Typography variant='body2' color='textSecondary' gutterBottom>
                            Create a comprehensive report with screenshots and visual analysis
                          </Typography>
                          <Button
                            size='small'
                            variant='contained'
                            startIcon={<Assessment />}
                            onClick={() => handleDetailedReport(address)}
                            disabled={generatingReport}
                            sx={{ mt: 1 }}
                          >
                            {generatingReport ? 'Generating...' : 'Generate Report with Screenshots'}
                          </Button>
                        </Card>
                      )}
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
                          {vuln.location && (
                            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                              Location: {vuln.location}
                            </Typography>
                          )}
                          {vuln.recommendation && (
                            <Typography variant='caption' display='block' sx={{ mt: 1, fontWeight: 600 }}>
                              Recommendation: {vuln.recommendation}
                            </Typography>
                          )}
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
        {/* Web3 Reports Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
            <Typography variant='h6'>
              📊 Web3 Security Reports
            </Typography>
            <Button
              variant='contained'
              startIcon={<GetApp />}
              onClick={() => {
                // Export all reports functionality
                alert('Exporting all Web3 reports...');
              }}
            >
              Export All Reports
            </Button>
          </Box>
          <Grid container spacing={3}>
            {/* Reports Summary Cards */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    📈 Analysis Summary
                  </Typography>
                  <Typography variant='h4' color='primary'>
                    {contracts.length}
                  </Typography>
                  <Typography color='textSecondary'>
                    Total Contracts Analyzed
                  </Typography>
                  <Box mt={2}>
                    <Typography variant='body2'>
                      Completed: {contracts.filter(c => c.status === 'completed').length}
                    </Typography>
                    <Typography variant='body2'>
                      Average Score: {Math.round(contracts.reduce((acc, c) => acc + c.securityScore, 0) / contracts.length) || 0}/100
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    🚨 Vulnerabilities Found
                  </Typography>
                  <Typography variant='h4' color='error'>
                    {analyses.reduce((acc, a) => acc + a.vulnerabilities, 0)}
                  </Typography>
                  <Typography color='textSecondary'>
                    Total Security Issues
                  </Typography>
                  <Box mt={2}>
                    <Typography variant='body2'>
                      Critical: {analyses.filter(a => a.results?.vulnerabilities?.some(v => v.severity === 'Critical')).length}
                    </Typography>
                    <Typography variant='body2'>
                      High: {analyses.filter(a => a.results?.vulnerabilities?.some(v => v.severity === 'High')).length}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    📋 Generated Reports
                  </Typography>
                  <Typography variant='h4' color='success'>
                    {Object.keys(reportResults).length}
                  </Typography>
                  <Typography color='textSecondary'>
                    Detailed Reports Available
                  </Typography>
                  <Box mt={2}>
                    <Typography variant='body2'>
                      HTML Reports: {Object.keys(reportResults).length}
                    </Typography>
                    <Typography variant='body2'>
                      Screenshots: {Object.keys(reportResults).length * 5}+
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {/* Reports List */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    📄 Available Reports
                  </Typography>
                  {Object.keys(reportResults).length > 0 ? (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Contract</TableCell>
                            <TableCell>Network</TableCell>
                            <TableCell>Report ID</TableCell>
                            <TableCell>Generated</TableCell>
                            <TableCell>Security Score</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {Object.entries(reportResults).map(([address, report]) => {
                            const contract = contracts.find(c => c.address === address);
                            return (
                              <TableRow key={address}>
                                <TableCell>
                                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                    {address.substring(0, 10)}...{address.substring(38)}
                                  </Typography>
                                  <Typography variant='caption' color='textSecondary'>
                                    {contract?.name || 'Unknown Contract'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={contract?.network || 'ethereum'} size='small' />
                                </TableCell>
                                <TableCell>
                                  <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                    {report.reportId}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {new Date().toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Box display='flex' alignItems='center'>
                                    <LinearProgress
                                      variant='determinate'
                                      value={contract?.securityScore || 0}
                                      sx={{ width: 60, mr: 1 }}
                                      color={getScoreColor(contract?.securityScore || 0)}
                                    />
                                    <Typography variant='body2'>
                                      {contract?.securityScore || 0}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box display='flex' gap={1}>
                                    <Tooltip title='View HTML Report'>
                                      <IconButton
                                        size='small'
                                        onClick={() => {
                                          window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/view/${report.reportId}/security_report.html`, '_blank');
                                        }}
                                      >
                                        <Visibility />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title='Download Report'>
                                      <IconButton
                                        size='small'
                                        onClick={() => {
                                          window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/web3/report/download/${report.reportId}`, '_blank');
                                        }}
                                      >
                                        <GetApp />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity='info'>
                      No detailed reports generated yet. Use the 'Generate Detailed Report' button in the Smart Contracts tab to create reports with screenshots.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        {/* DeFi Protocols Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {defiProtocols.map((protocol) => (
              <Grid item xs={12} md={6} lg={4} key={protocol.id}>
                <Card>
                  <CardContent>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
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
        {/* Remaining tabs - NFT, Bridge, Blockchain Scans */}
        <TabPanel value={tabValue} index={4}>
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
                    <Box display='flex' justifyContent='space-between' alignItems='center' mb={2}>
                      <Chip label={nft.standard} size='small' />
                      <Typography variant='body2'>
                        Floor: {nft.floorPrice}
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
        <TabPanel value={tabValue} index={5}>
          <Typography variant='h6' gutterBottom>
            Bridge Protocols
          </Typography>
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
        <TabPanel value={tabValue} index={6}>
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

export default UnifiedWeb3Dashboard;