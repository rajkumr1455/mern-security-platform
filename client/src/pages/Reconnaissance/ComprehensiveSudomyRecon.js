import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Download as DownloadIcon,
  
} from '@mui/icons-material';
  import {
    Security as SecurityIcon,
  } from '@mui/icons-material';
  import {
    DNS as DNSIcon,
  } from '@mui/icons-material';
  import {
    Http as HttpIcon,
  } from '@mui/icons-material';
  import {
    Assessment as ReportIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as CheckIcon,
  } from '@mui/icons-material';
  import {
    Error as ErrorIcon,
  } from '@mui/icons-material';
  import {
    Pending as PendingIcon
  } from '@mui/icons-material';
} from '@mui/icons-material';

const ComprehensiveSudomyRecon = () => {
  const [targetDomain, setTargetDomain] = useState('');
  const [scanStatus, setScanStatus] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanId, setActiveScanId] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [scanOptions, setScanOptions] = useState({
    techniques: ['passive', 'active'],
    wordlistSize: 'medium',
    includeValidation: true,
    socialMedia: false
  });

  // Scan phases for stepper
  const scanPhases = [
    { name: 'Enhanced Enumeration', key: 'enumeration', icon: <SecurityIcon /> },
    { name: 'DNS Analysis', key: 'dns_analysis', icon: <DNSIcon /> },
    { name: 'HTTP/HTTPS Analysis', key: 'http_analysis', icon: <HttpIcon /> },
    { name: 'Report Generation', key: 'reporting', icon: <ReportIcon /> }
  ];

  // Poll for scan progress
  useEffect(() => {
    let interval
    if (activeScanId && isScanning) {
      interval = setInterval(() => {
        fetchScanProgress(activeScanId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeScanId, isScanning]);

  const startComprehensiveScan = async () => {
    if (!targetDomain.trim()) {
      setScanStatus({
        type: 'error',
        message: 'Please enter a domain name'
      });
      return
    }

    try {
      setIsScanning(true);
      setScanStatus({
        type: 'info',
        message: 'Initiating comprehensive scan...'
      });

      const response = await fetch('/api/recon/sudomy/comprehensive-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: targetDomain.trim(),
          options: scanOptions
        })
      });

      const data = await response.json();

      if (data.success) {
        setActiveScanId(data.scanId);
        setScanStatus({
          type: 'success',
          message: 'Comprehensive scan started successfully!'
        });
      } else {
        throw new Error(data.message || 'Failed to start scan');
      }
    } catch (error) {
      // logger.error('Scan start error:', error); // TODO: Implement client-side logging
      setScanStatus({
        type: 'error',
        message: `Failed to start scan: ${error.message}`
      });
      setIsScanning(false);
    }
  };

  const fetchScanProgress = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/comprehensive/${scanId}/progress`);
      const data = await response.json();

      if (data.success) {
        setScanProgress(data);

        if (data.status === 'completed') {
          setIsScanning(false);
          setScanStatus({
            type: 'success',
            message: `Comprehensive scan completed! Security Score: ${data.summary?.security_score || 'N/A'}%`
          });
          fetchScanResults(scanId);
        } else if (data.status === 'failed') {
          setIsScanning(false);
          setScanStatus({
            type: 'error',
            message: 'Comprehensive scan failed'
          });
        }
      }
    } catch (error) {
      // logger.error('Progress fetch error:', error); // TODO: Implement client-side logging
    }
  };

  const fetchScanResults = async (scanId) => {
    try {
      const response = await fetch(`/api/recon/sudomy/comprehensive/${scanId}/results`);
      const data = await response.json();

      if (data.success) {
        setScanResults(data.results);
      }
    } catch (error) {
      // logger.error('Results fetch error:', error); // TODO: Implement client-side logging
    }
  };

  const downloadReport = async (format) => {
    if (!activeScanId) return

    try {
      const response = await fetch(`/api/recon/sudomy/comprehensive/${activeScanId}/report/${format}`);
      const data = await response.json();

      if (data.success) {
        // Create download link
        const blob = new Blob([JSON.stringify(data.data, null, 2)], {
          type: format === 'json' ? 'application/json' : 'text/plain'
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url
        a.download = data.filename
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      // logger.error('Download error:', error); // TODO: Implement client-side logging
    }
  };

  const getPhaseIcon = (phase) => {
    if (!scanProgress?.phases) return <PendingIcon />
    const phaseData = scanProgress.phases[phase.key];
    if (phaseData?.status === 'completed') return <CheckIcon color='success' />
    if (phaseData?.status === 'running') return <PendingIcon color='primary' />
    if (phaseData?.status === 'failed') return <ErrorIcon color='error' />
    return <PendingIcon />
  };

  const renderScanProgress = () => {
    if (!isScanning && !scanProgress) return null

    return (
      <Card sx={{ mt: 2 }}>
        <CardHeader
          title='Comprehensive Scan Progress'
          action={
            <Chip
              label={scanProgress?.status || 'Running'}
              color={scanProgress?.status === 'completed' ? 'success' : 'primary'}
            />
          }
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant='body2' color='text.secondary'>
              Overall Progress: {scanProgress?.overall_progress || 0}%
            </Typography>
            <LinearProgress
              variant='determinate'
              value={scanProgress?.overall_progress || 0}
              sx={{ mt: 1 }}
            />
          </Box>
          <Stepper orientation='vertical'>
            {scanPhases.map((phase, index) => (
              <Step key={phase.key} active={scanProgress?.current_phase === phase.key}>
                <StepLabel icon={getPhaseIcon(phase)}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {phase.icon}
                    <Typography variant='subtitle2'>
                      {phase.name}
                    </Typography>
                    <Chip
                      size='small'
                      label={scanProgress?.phases?.[phase.key]?.status || 'pending'}
                      color={
                        scanProgress?.phases?.[phase.key]?.status === 'completed' ? 'success' :
                        scanProgress?.phases?.[phase.key]?.status === 'running' ? 'primary' : 'default'
                      }
                    />
                  </Box>
                </StepLabel>
                <StepContent>
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress
                      variant='determinate'
                      value={scanProgress?.phases?.[phase.key]?.progress || 0}
                      size='small'
                    />
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {scanProgress?.summary && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant='h6' gutterBottom>Scan Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>Subdomains</Typography>
                  <Typography variant='h6'>{scanProgress.summary.total_subdomains}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>Active</Typography>
                  <Typography variant='h6'>{scanProgress.summary.active_subdomains}</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>Security Score</Typography>
                  <Typography variant='h6'>{scanProgress.summary.security_score}%</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant='body2' color='text.secondary'>Risk Level</Typography>
                  <Chip
                    label={scanProgress.summary.risk_level}
                    color={
                      scanProgress.summary.risk_level === 'Low' ? 'success' :
                      scanProgress.summary.risk_level === 'Medium' ? 'warning' : 'error'
                    }
                    size='small'
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!scanResults) return null

    return (
      <Box sx={{ mt: 3 }}>
        <Card>
          <CardHeader
            title='Comprehensive Scan Results'
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadReport('json')}
                  variant='outlined'
                  size='small'
                >
                  JSON
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadReport('csv')}
                  variant='outlined'
                  size='small'
                >
                  CSV
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadReport('html')}
                  variant='outlined'
                  size='small'
                >
                  HTML
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
              <Tab label='Executive Summary' />
              <Tab label='Enumeration Results' />
              <Tab label='DNS Analysis' />
              <Tab label='HTTP Analysis' />
              <Tab label='Comprehensive Report' />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {currentTab === 0 && renderExecutiveSummary()}
              {currentTab === 1 && renderEnumerationResults()}
              {currentTab === 2 && renderDNSAnalysis()}
              {currentTab === 3 && renderHTTPAnalysis()}
              {currentTab === 4 && renderComprehensiveReport()}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  const renderExecutiveSummary = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='h6' gutterBottom>Asset Discovery</Typography>
            <Typography>Total Subdomains: {scanResults.summary.total_subdomains}</Typography>
            <Typography>Active Subdomains: {scanResults.summary.active_subdomains}</Typography>
            <Typography>Security Score: {scanResults.summary.security_score}%</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={6}>
        <Card variant='outlined'>
          <CardContent>
            <Typography variant='h6' gutterBottom>Security Assessment</Typography>
            <Typography>DNS Vulnerabilities: {scanResults.summary.dns_vulnerabilities}</Typography>
            <Typography>SSL Vulnerabilities: {scanResults.summary.ssl_vulnerabilities}</Typography>
            <Chip
              label={`Risk Level: ${scanResults.summary.risk_level}`}
              color={
                scanResults.summary.risk_level === 'Low' ? 'success' :
                scanResults.summary.risk_level === 'Medium' ? 'warning' : 'error'
              }
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderEnumerationResults = () => {
    const enumeration = scanResults.enumeration
    if (!enumeration) return <Typography>No enumeration data available</Typography>
    return (
      <Box>
        <Typography variant='h6' gutterBottom>Subdomain Enumeration Results</Typography>

        {enumeration.summary && (
          <Card variant='outlined' sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant='subtitle1' gutterBottom>Summary</Typography>
              <Typography>Total Unique Subdomains: {enumeration.summary.total_unique_subdomains}</Typography>
              <Typography>Techniques Used: {enumeration.summary.techniques_used?.join(', ')}</Typography>
            </CardContent>
          </Card>
        )}

        {enumeration.all_subdomains && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subdomain</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enumeration.all_subdomains.slice(0, 20).map((subdomain, index) => (
                  <TableRow key={index}>
                    <TableCell>{subdomain}</TableCell>
                    <TableCell>
                      <Chip
                        label='Discovered'
                        size='small'
                        color='primary'
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    );
  };

  const renderDNSAnalysis = () => {
    const dns = scanResults.dns_analysis
    if (!dns) return <Typography>No DNS analysis data available</Typography>
    return (
      <Box>
        <Typography variant='h6' gutterBottom>DNS Security Analysis</Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>DNS Records</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(dns.records, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Security Assessment</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(dns.security, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Health Metrics</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(dns.health, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderHTTPAnalysis = () => {
    const http = scanResults.http_analysis
    if (!http) return <Typography>No HTTP analysis data available</Typography>
    return (
      <Box>
        <Typography variant='h6' gutterBottom>HTTP/HTTPS Security Analysis</Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Security Headers</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {http.security_headers && (
              <Box>
                <Typography>Security Score: {http.security_headers.security_score?.score}%</Typography>
                <pre>{JSON.stringify(http.security_headers, null, 2)}</pre>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>SSL/TLS Analysis</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(http.ssl_analysis, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Technology Detection</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre>{JSON.stringify(http.technology_detection, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };

  const renderComprehensiveReport = () => {
    const report = scanResults.comprehensive_report
    if (!report) return <Typography>No comprehensive report available</Typography>
    return (
      <Box>
        <Typography variant='h6' gutterBottom>Comprehensive Security Report</Typography>
        <pre>{JSON.stringify(report.data, null, 2)}</pre>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom>
        Comprehensive Sudomy Reconnaissance
      </Typography>
      <Typography variant='body1' color='text.secondary' gutterBottom>
        Advanced subdomain enumeration with DNS analysis, HTTP security assessment, and comprehensive reporting
      </Typography>
      <Card>
        <CardHeader title='Start Comprehensive Scan' />
        <CardContent>
          <Grid container spacing={3} alignItems='center'>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Target Domain'
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder='example.com'
                disabled={isScanning}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant='contained'
                startIcon={<PlayIcon />}
                onClick={startComprehensiveScan}
                disabled={isScanning || !targetDomain.trim()}
                size='large'
              >
                {isScanning ? 'Scanning...' : 'Start Comprehensive Scan'}
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant='subtitle2' gutterBottom>Scan Options</Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Wordlist Size</InputLabel>
                    <Select
                      value={scanOptions.wordlistSize}
                      label='Wordlist Size'
                      onChange={(e) => setScanOptions({...scanOptions, wordlistSize: e.target.value})}
                      disabled={isScanning}
                    >
                      <MenuItem value='small'>Small (~10 words)</MenuItem>
                      <MenuItem value='medium'>Medium (~25 words)</MenuItem>
                      <MenuItem value='large'>Large (~35 words)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scanOptions.includeValidation}
                        onChange={(e) => setScanOptions({...scanOptions, includeValidation: e.target.checked})}
                        disabled={isScanning}
                      />
                    }
                    label='Include Validation'
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={scanOptions.socialMedia}
                        onChange={(e) => setScanOptions({...scanOptions, socialMedia: e.target.checked})}
                        disabled={isScanning}
                      />
                    }
                    label='Social Media Intel'
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          {scanStatus && (
            <Alert severity={scanStatus.type} sx={{ mt: 2 }}>
              {scanStatus.message}
            </Alert>
          )}
        </CardContent>
      </Card>
      {renderScanProgress()}
      {renderResults()}
    </Box>
  );
};

export default ComprehensiveSudomyRecon;