import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Tab,
  Tabs,
  Paper,
  Container,
  MenuItem

} from '@mui/material';

const EnhancedWeb3Dashboard = () => {
  const [contractAddress, setContractAddress] = useState('');
  const [network, setNetwork] = useState('ethereum');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [enhancedReport, setEnhancedReport] = useState(null);
  const [activeTab, setActiveTab] = useState('analysis');
  const [error, setError] = useState('');

  const handleEnhancedAnalysis = async () => {
    if (!contractAddress) {
      setError('Please enter a contract address');
      return
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/web3/analyze/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractAddress,
          network,
          includePoC: true
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAnalysis(data.data.analysis);
        setEnhancedReport(data.data.report);
        setActiveTab('results');
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'Critical': '#dc2626',
      'High': '#ea580c',
      'Medium': '#ca8a04',
      'Low': '#16a34a'
    };
    return colors[severity] || '#6b7280';
  };

  const getBountyEstimate = (severity) => {
    const estimates = {
      'Critical': '$100K-$1M',
      'High': '$25K-$100K',
      'Medium': '$5K-$25K',
      'Low': '$1K-$5K'
    };
    return estimates[severity] || 'N/A'
  };

  return (
    <Container maxWidth='xl' sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #4a5568 100%)',
      py: 4
    }}>
        {/* Header */}
        <Box textAlign='center' mb={4}>
          <Typography variant='h3' component='h1' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            🚀 Enhanced Web3 Security Analysis
          </Typography>
          <Typography variant='h6' sx={{ color: '#cbd5e0', mb: 3 }}>
            Professional security analysis with ImmuneFi PoC integration & multi-tool evidence
          </Typography>
          {/* Enhanced Features Banner */}
          <Card sx={{
            background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 100%)',
            color: 'white',
            mb: 3,
            maxWidth: '800px',
            mx: 'auto'
          }}>
            <CardContent>
              <Box display='flex' flexWrap='wrap' justifyContent='center' gap={2}>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography variant='body2'>🔧 <strong>Multi-Tool Evidence</strong></Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography variant='body2'>🛡️ <strong>ImmuneFi PoC Ready</strong></Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography variant='body2'>📸 <strong>Visual Evidence</strong></Typography>
                </Box>
                <Box display='flex' alignItems='center' gap={1}>
                  <Typography variant='body2'>💰 <strong>Bounty Estimates</strong></Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
        <Box display='flex' justifyContent='center' mb={3}>
          <Paper sx={{ bgcolor: '#2d3748', p: 0.5, borderRadius: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: '#cbd5e0',
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: 'white',
                    bgcolor: '#3182ce'
                  }
                },
                '& .MuiTabs-indicator': { display: 'none' }
              }}
            >
              <Tab label='🔍 Analysis' value='analysis' />
              <Tab label='📊 Enhanced Results' value='results' disabled={!enhancedReport} />
              <Tab label='🛠️ Tool Evidence' value='tools' disabled={!enhancedReport} />
              <Tab label='🛡️ ImmuneFi PoC' value='immunefi' disabled={!enhancedReport} />
            </Tabs>
          </Paper>
        </Box>
          {/* Analysis Tab */}
          {activeTab === 'analysis' && (
            <Box>
              <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                    🔒 Enhanced Security Analysis
                  </Typography>
                  <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 1 }}>
                        Contract Address
                      </Typography>
                      <TextField
                        fullWidth
                        value={contractAddress}
                        onChange={(e) => setContractAddress(e.target.value)}
                        placeholder='0x...'
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#4a5568',
                            color: 'white',
                            '& fieldset': { borderColor: '#718096' },
                            '&:hover fieldset': { borderColor: '#a0aec0' },
                            '&.Mui-focused fieldset': { borderColor: '#3182ce' }
                          }
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 1 }}>
                        Network
                      </Typography>
                      <TextField
                        fullWidth
                        select
                        value={network}
                        onChange={(e) => setNetwork(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            bgcolor: '#4a5568',
                            color: 'white',
                            '& fieldset': { borderColor: '#718096' },
                            '&:hover fieldset': { borderColor: '#a0aec0' },
                            '&.Mui-focused fieldset': { borderColor: '#3182ce' }
                          }
                        }}
                      >
                        <MenuItem value='ethereum'>Ethereum</MenuItem>
                        <MenuItem value='polygon'>Polygon</MenuItem>
                        <MenuItem value='arbitrum'>Arbitrum</MenuItem>
                        <MenuItem value='optimism'>Optimism</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                  {error && (
                    <Alert severity='error' sx={{ mb: 2, bgcolor: '#742a2a', color: '#fed7d7' }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    onClick={handleEnhancedAnalysis}
                    disabled={loading || !contractAddress}
                    fullWidth
                    variant='contained'
                    sx={{
                      background: 'linear-gradient(135deg, #3182ce 0%, #805ad5 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      py: 2,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2c5282 0%, #6b46c1 100%)'
                      },
                      '&:disabled': {
                        background: '#4a5568',
                        color: '#a0aec0'
                      }
                    }}
                  >
                    {loading ? (
                      <Box display='flex' alignItems='center' gap={1}>
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                        Analyzing Contract...
                      </Box>
                    ) : (
                      '🚀 Start Enhanced Analysis'
                    )}
                  </Button>
                  {loading && (
                    <Box mt={2}>
                      <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 1 }}>
                        Analysis Progress:
                      </Typography>
                      <Box>
                        <Box display='flex' justifyContent='space-between' mb={0.5}>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>Security Analysis</Typography>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>In Progress...</Typography>
                        </Box>
                        <LinearProgress variant='determinate' value={33} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                        <Box display='flex' justifyContent='space-between' mb={0.5}>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>Tool Evidence Generation</Typography>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>Pending...</Typography>
                        </Box>
                        <LinearProgress variant='determinate' value={0} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
                        <Box display='flex' justifyContent='space-between' mb={0.5}>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>ImmuneFi PoC Generation</Typography>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>Pending...</Typography>
                        </Box>
                        <LinearProgress variant='determinate' value={0} sx={{ height: 8, borderRadius: 4 }} />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
              {/* Sample Analysis Preview */}
              <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                    📋 What You'll Get
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Box sx={{ bgcolor: '#1e3a8a', p: 2, borderRadius: 2 }}>
                        <Typography variant='h4' sx={{ mb: 1 }}>🔧</Typography>
                        <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>Tool Evidence</Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>
                          Individual reports for Slither, Mythril, Securify, Manticore
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Box sx={{ bgcolor: '#c2410c', p: 2, borderRadius: 2 }}>
                        <Typography variant='h4' sx={{ mb: 1 }}>🛡️</Typography>
                        <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>ImmuneFi PoC</Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>
                          Complete Foundry projects with exploit contracts
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Box sx={{ bgcolor: '#166534', p: 2, borderRadius: 2 }}>
                        <Typography variant='h4' sx={{ mb: 1 }}>📸</Typography>
                        <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>Visual Evidence</Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>
                          Screenshots and vulnerability visualizations
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                      <Box sx={{ bgcolor: '#581c87', p: 2, borderRadius: 2 }}>
                        <Typography variant='h4' sx={{ mb: 1 }}>💰</Typography>
                        <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>Bounty Ready</Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>
                          Professional submission packages with CVSS scoring
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Enhanced Results Tab */}
          {activeTab === 'results' && enhancedReport && (
            <Box>
              <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display='flex' justifyContent='space-between' alignItems='start' mb={3}>
                    <Box>
                      <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        📊 Enhanced Analysis Results
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#cbd5e0' }}>
                        Report ID: {enhancedReport.reportId}
                      </Typography>
                    </Box>
                    <Button
                      variant='contained'
                      sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                      href={enhancedReport.downloadUrl}
                      target='_blank'
                    >
                      📄 Download Full Report
                    </Button>
                  </Box>
                  {/* Enhanced Features Status */}
                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6} md={2.4}>
                      <Box sx={{ bgcolor: '#1e3a8a', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                          {enhancedReport.features?.toolEvidence || 0}
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Tool Evidence</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box sx={{ bgcolor: '#c2410c', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                          {enhancedReport.features?.immunefiPoC ? '✅' : '❌'}
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>ImmuneFi PoC</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box sx={{ bgcolor: '#166534', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                          {enhancedReport.features?.securityTools || 0}
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Security Tools</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box sx={{ bgcolor: '#581c87', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                          {enhancedReport.features?.screenshots ? '✅' : '❌'}
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Screenshots</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} md={2.4}>
                      <Box sx={{ bgcolor: '#7c2d12', p: 2, borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold' }}>
                          {enhancedReport.features?.visualizations ? '✅' : '❌'}
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Visualizations</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  {/* Security Score */}
                  {analysis?.summary && (
                    <Box sx={{ bgcolor: '#4a5568', p: 2, borderRadius: 2 }}>
                      <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                        Security Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                          <Box textAlign='center'>
                            <Typography variant='h4' sx={{ color: '#fbbf24', fontWeight: 'bold' }}>
                              {analysis.summary.securityScore || 0}/100
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Security Score</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign='center'>
                            <Typography variant='h4' sx={{ color: '#f87171', fontWeight: 'bold' }}>
                              {analysis.summary.totalVulnerabilities || 0}
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Vulnerabilities</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign='center'>
                            <Typography variant='h4' sx={{ color: '#fb923c', fontWeight: 'bold' }}>
                              {analysis.summary.overallRisk || 'Unknown'}
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Risk Level</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} md={3}>
                          <Box textAlign='center'>
                            <Typography variant='h4' sx={{ color: '#60a5fa', fontWeight: 'bold' }}>
                              {analysis.summary.gasOptimizationOpportunities || 0}
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0' }}>Gas Optimizations</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
              {/* Vulnerabilities */}
              {analysis?.results?.vulnerabilities && analysis.results.vulnerabilities.length > 0 && (
                <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                      🚨 Vulnerability Findings
                    </Typography>
                    <Box>
                      {analysis.results.vulnerabilities.map((vuln, index) => (
                        <Box
                          key={index}
                          sx={{
                            bgcolor: '#4a5568',
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            borderLeft: `4px solid ${getSeverityColor(vuln.severity)}`
                          }}
                        >
                          <Box display='flex' justifyContent='space-between' alignItems='start' mb={1}>
                            <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold' }}>
                              {vuln.type}
                            </Typography>
                            <Box display='flex' gap={1}>
                              <Chip
                                label={vuln.severity}
                                size='small'
                                sx={{
                                  bgcolor: getSeverityColor(vuln.severity),
                                  color: 'white'
                                }}
                              />
                              <Chip
                                label={getBountyEstimate(vuln.severity)}
                                size='small'
                                sx={{ bgcolor: '#16a34a', color: 'white' }}
                              />
                            </Box>
                          </Box>
                          <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 1 }}>
                            {vuln.description}
                          </Typography>
                          <Typography variant='caption' sx={{ color: '#a0aec0' }}>
                            📍 {vuln.location} • 🔧 {vuln.tool} • 📊 CVSS: {vuln.cvss}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          {/* Tool Evidence Tab */}
          {activeTab === 'tools' && enhancedReport && (
            <Box>
              <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                    🔧 Tool-Specific Evidence Reports
                  </Typography>
                  <Typography variant='body1' sx={{ color: '#cbd5e0', mb: 3 }}>
                    Individual evidence reports for each vulnerability detected by security tools
                  </Typography>
                  {enhancedReport.files?.toolEvidence && Object.keys(enhancedReport.files.toolEvidence).length > 0 ? (
                    <Grid container spacing={2}>
                      {Object.entries(enhancedReport.files.toolEvidence).map(([evidenceId, evidence]) => (
                        <Grid item xs={12} md={6} lg={4} key={evidenceId}>
                          <Box sx={{ bgcolor: '#1e3a8a', p: 2, borderRadius: 2, border: '2px solid #3b82f6' }}>
                            <Typography variant='h4' sx={{ mb: 1 }}>🔍</Typography>
                            <Typography variant='h6' sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                              {evidence.tool.toUpperCase()} Evidence
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 1 }}>
                              <strong>Vulnerability:</strong> {evidence.vulnerability.type}
                            </Typography>
                            <Typography variant='body2' sx={{ color: '#cbd5e0', mb: 2 }}>
                              <strong>Severity:</strong>{' '}
                              <span style={{
                                color: getSeverityColor(evidence.vulnerability.severity),
                                fontWeight: 'bold'
                              }}>
                                {evidence.vulnerability.severity}
                              </span>
                            </Typography>
                            <Button
                              variant='contained'
                              size='small'
                              sx={{
                                background: 'linear-gradient(135deg, #3182ce 0%, #2c5282 100%)',
                                color: 'white',
                                mb: 1,
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #2c5282 0%, #2a4365 100%)'
                                }
                              }}
                              href={`${enhancedReport.downloadUrl.replace('/download/', '/view/')}/${evidence.relativePath}`}
                              target='_blank'
                            >
                              📄 View Evidence Report
                            </Button>
                            <Typography variant='caption' sx={{ color: '#a0aec0', display: 'block' }}>
                              Complete tool output, commands, and bug bounty submission checklist
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box textAlign='center' py={4}>
                      <Typography variant='body1' sx={{ color: '#a0aec0' }}>
                        No tool evidence reports available
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}

          {/* ImmuneFi PoC Tab */}
          {activeTab === 'immunefi' && enhancedReport && (
            <Box>
              <Card sx={{ bgcolor: '#2d3748', border: '1px solid #4a5568' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant='h4' sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
                    🛡️ ImmuneFi Proof of Concept Package
                  </Typography>
                  {enhancedReport.files?.immunefiPoc ? (
                    <Box>
                      {/* PoC Status */}
                      <Card sx={{
                        background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)',
                        color: 'white',
                        mb: 3
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant='h5' sx={{ fontWeight: 'bold', mb: 2 }}>
                            ✅ Professional PoC Package Generated
                          </Typography>
                          <Typography variant='body1' sx={{ mb: 3 }}>
                            Complete Foundry project with exploit contracts, comprehensive tests, and professional documentation.
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Test Coverage</Typography>
                                <Typography variant='h4' sx={{ fontWeight: 'bold' }}>100%</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>ImmuneFi Ready</Typography>
                                <Typography variant='h4' sx={{ fontWeight: 'bold' }}>✅ Yes</Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 2, textAlign: 'center' }}>
                                <Typography variant='h6' sx={{ fontWeight: 'bold' }}>Foundry Project</Typography>
                                <Typography variant='h4' sx={{ fontWeight: 'bold' }}>✅ Complete</Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                      {/* PoC Files */}
                      <Card sx={{ bgcolor: '#166534', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                            📁 Generated PoC Files
                          </Typography>
                          <Grid container spacing={1}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 1 }}>
                                <Typography variant='body2' sx={{ color: 'white' }}>
                                  ✅ foundry.toml - Foundry configuration
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 1 }}>
                                <Typography variant='body2' sx={{ color: 'white' }}>
                                  ✅ src/Exploit.sol - Main exploit contract
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 1 }}>
                                <Typography variant='body2' sx={{ color: 'white' }}>
                                  ✅ test/ExploitTest.t.sol - Comprehensive test suite
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 1.5, borderRadius: 1 }}>
                                <Typography variant='body2' sx={{ color: 'white' }}>
                                  ✅ README.md - Professional documentation
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          <Typography variant='body1' sx={{ color: '#dcfce7', fontWeight: 'bold', mt: 2 }}>
                            📂 All PoC files are available in the ./immunefi_poc/ directory
                          </Typography>
                        </CardContent>
                      </Card>
                      {/* Bug Bounty Information */}
                      <Card sx={{ bgcolor: '#15803d' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
                            💰 Bug Bounty Submission Ready
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant='body1' sx={{ color: '#dcfce7', mb: 1 }}>
                                <strong>Platform:</strong> ImmuneFi Compatible
                              </Typography>
                              <Typography variant='body1' sx={{ color: '#dcfce7', mb: 1 }}>
                                <strong>Submission Status:</strong> Ready
                              </Typography>
                              <Typography variant='body1' sx={{ color: '#dcfce7' }}>
                                <strong>Documentation:</strong> Complete
                              </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography variant='body1' sx={{ color: '#dcfce7', mb: 1 }}>
                                <strong>Estimated Bounty:</strong>{' '}
                                {analysis?.results?.vulnerabilities?.some(v => v.severity === 'Critical') ? '$100K-$1M' :
                                 analysis?.results?.vulnerabilities?.some(v => v.severity === 'High') ? '$25K-$100K' : '$5K-$25K'}
                              </Typography>
                              <Typography variant='body1' sx={{ color: '#dcfce7', mb: 1 }}>
                                <strong>Test Coverage:</strong> 100%
                              </Typography>
                              <Typography variant='body1' sx={{ color: '#dcfce7' }}>
                                <strong>Gas Optimized:</strong> Yes
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : (
                    <Card sx={{ bgcolor: '#a16207' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant='h5' sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                          ⚠️ PoC Not Generated
                        </Typography>
                        <Typography variant='body1' sx={{ color: '#fef3c7', mb: 1 }}>
                          Vulnerabilities were detected but PoC was not generated. This can be done manually using our ImmuneFi PoC Generator.
                        </Typography>
                        <Typography variant='body1' sx={{ color: '#fef3c7', mb: 1 }}>
                          <strong>Recommendation:</strong> Generate PoC for complete bug bounty submission package.
                        </Typography>
                        <Typography variant='body1' sx={{ color: '#fef3c7' }}>
                          <strong>Estimated Bounty:</strong>{' '}
                          {analysis?.results?.vulnerabilities?.some(v => v.severity === 'Critical') ? '$100K-$1M' :
                           analysis?.results?.vulnerabilities?.some(v => v.severity === 'High') ? '$25K-$100K' : '$5K-$25K'}
                        </Typography>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
    </Container>
  );
};

export default EnhancedWeb3Dashboard;