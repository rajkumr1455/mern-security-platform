import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Search as SearchIcon,
  
} from '@mui/icons-material';
  import {
    Security as SecurityIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as CheckIcon,
  } from '@mui/icons-material';
  import {
    Error as ErrorIcon,
  } from '@mui/icons-material';
  import {
    Warning as WarningIcon,
  } from '@mui/icons-material';
  import {
    Info as InfoIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    Timeline as TimelineIcon,
  } from '@mui/icons-material';
  import {
    Speed as SpeedIcon,
  } from '@mui/icons-material';
  import {
    BugReport as BugIcon,
  } from '@mui/icons-material';
  import {
    Shield as ShieldIcon
  } from '@mui/icons-material';
import axios from 'axios';

const IntegratedReconToWeb2 = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [domain, setDomain] = useState('');
  const [workflowId, setWorkflowId] = useState(null);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [workflowResults, setWorkflowResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    reconProfile: 'comprehensive',
    web2ScanTypes: ['vulnerability', 'api_security'],
    maxConcurrent: 3
  });
  const [expandedSection, setExpandedSection] = useState(false);

  const steps = [
    {
      label: 'Configuration',
      description: 'Configure domain and scan options',
      icon: <SearchIcon />
    },
    {
      label: 'Reconnaissance',
      description: 'Discover subdomains and gather intelligence',
      icon: <SearchIcon />
    },
    {
      label: 'Target Extraction',
      description: 'Extract and prepare targets for scanning',
      icon: <AssessmentIcon />
    },
    {
      label: 'Web2 Scanning',
      description: 'Execute security scans on discovered targets',
      icon: <SecurityIcon />
    },
    {
      label: 'Results & Correlation',
      description: 'Analyze and correlate findings',
      icon: <AssessmentIcon />
    }
  ];

  // Poll for workflow status updates
  useEffect(() => {
    let interval
    if (workflowId && isRunning) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/workflows/${workflowId}/status`);
          if (response.data.success) {
            setWorkflowStatus(response.data.workflow);

            // Update active step based on workflow phase
            const phases = response.data.workflow.phases
            if (phases.correlation?.status === 'completed') {
              setActiveStep(4);
              setIsRunning(false);
              // Get final results
              fetchWorkflowResults();
            } else if (phases.web2_scanning?.status === 'running' || phases.web2_scanning?.status === 'completed') {
              setActiveStep(3);
            } else if (phases.target_extraction?.status === 'running' || phases.target_extraction?.status === 'completed') {
              setActiveStep(2);
            } else if (phases.reconnaissance?.status === 'running') {
              setActiveStep(1);
            }

            if (response.data.workflow.status === 'completed') {
              setIsRunning(false);
              fetchWorkflowResults();
            } else if (response.data.workflow.status === 'failed') {
              setIsRunning(false);
              setError('Workflow failed: ' + (response.data.workflow.error || 'Unknown error'));
            }
          }
        } catch (error) {
          // logger.error('Error polling workflow status:', error); // TODO: Implement client-side logging
        }
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [workflowId, isRunning]);

  const fetchWorkflowResults = async () => {
    if (!workflowId) return

    try {
      const response = await axios.get(`/api/workflows/${workflowId}/results`);
      if (response.data.success) {
        setWorkflowResults(response.data.results);
      }
    } catch (error) {
      // logger.error('Error fetching workflow results:', error); // TODO: Implement client-side logging
    }
  };

  const startIntegratedWorkflow = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return
    }

    setError(null);
    setIsRunning(true);
    setActiveStep(1);

    try {
      const response = await axios.post('/api/workflows/recon-to-web2', {
        domain: domain.trim(),
        options
      });

      if (response.data.success) {
        setWorkflowId(response.data.workflowId);
        setWorkflowResults(response.data.results);

        // If workflow completed immediately (cached results)
        if (response.data.results?.correlatedFindings) {
          setActiveStep(4);
          setIsRunning(false);
        }
      } else {
        setError(response.data.error || 'Failed to start workflow');
        setIsRunning(false);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to start integrated workflow');
      setIsRunning(false);
    }
  };

  const resetWorkflow = () => {
    setActiveStep(0);
    setWorkflowId(null);
    setWorkflowStatus(null);
    setWorkflowResults(null);
    setIsRunning(false);
    setError(null);
    setDomain('');
  };

  const getStepIcon = (stepIndex, stepStatus) => {
    if (stepStatus === 'completed') return <CheckIcon color='success' />
    if (stepStatus === 'failed') return <ErrorIcon color='error' />
    if (stepStatus === 'running') return <CircularProgress size={24} />
    return steps[stepIndex].icon
  };

  const getPhaseStatus = (phaseName) => {
    if (!workflowStatus?.phases) return 'pending';
    return workflowStatus.phases[phaseName]?.status || 'pending';
  };

  const renderConfigurationStep = () => (
    <Box>
      <Typography variant='h6' gutterBottom>
        Configure Integrated Workflow
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label='Target Domain'
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder='example.com'
            disabled={isRunning}
            helperText='Enter the domain to perform reconnaissance and security scanning'
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth disabled={isRunning}>
            <InputLabel>Reconnaissance Profile</InputLabel>
            <Select
              value={options.reconProfile}
              onChange={(e) => setOptions({...options, reconProfile: e.target.value})}
            >
              <MenuItem value='quick'>Quick Scan (2-5 minutes)</MenuItem>
              <MenuItem value='comprehensive'>Comprehensive Scan (5-15 minutes)</MenuItem>
              <MenuItem value='deep'>Deep Scan (15-30 minutes)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='subtitle2' gutterBottom>
            Web2 Scan Types
          </Typography>
          <Box display='flex' flexWrap='wrap' gap={1}>
            {[
              { value: 'vulnerability', label: 'Vulnerability Scanning' },
              { value: 'api_security', label: 'API Security' },
              { value: 'fuzzing', label: 'Web Fuzzing' },
              { value: 'exploitation', label: 'Safe Exploitation' }
            ].map((scanType) => (
              <FormControlLabel
                key={scanType.value}
                control={
                  <Checkbox
                    checked={options.web2ScanTypes.includes(scanType.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOptions({
                          ...options,
                          web2ScanTypes: [...options.web2ScanTypes, scanType.value]
                        });
                      } else {
                        setOptions({
                          ...options,
                          web2ScanTypes: options.web2ScanTypes.filter(t => t !== scanType.value)
                        });
                      }
                    }}
                    disabled={isRunning}
                  />
                }
                label={scanType.label}
              />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant='contained'
            size='large'
            startIcon={<PlayIcon />}
            onClick={startIntegratedWorkflow}
            disabled={isRunning || !domain.trim()}
            fullWidth
          >
            {isRunning ? 'Running Integrated Workflow...' : 'Start Reconnaissance → Web2 Workflow'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const renderProgressStep = (stepIndex, stepName, description) => (
    <Box>
      <Box display='flex' alignItems='center' mb={2}>
        {getStepIcon(stepIndex, getPhaseStatus(stepName))}
        <Box ml={2}>
          <Typography variant='h6'>{steps[stepIndex].label}</Typography>
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
        </Box>
      </Box>
      {getPhaseStatus(stepName) === 'running' && (
        <LinearProgress sx={{ mt: 2 }} />
      )}

      {workflowStatus?.phases?.[stepName] && (
        <Alert
          severity={
            getPhaseStatus(stepName) === 'completed' ? 'success' :
            getPhaseStatus(stepName) === 'failed' ? 'error' : 'info'
          }
          sx={{ mt: 2 }}
        >
          Status: {getPhaseStatus(stepName)}
          {workflowStatus.phases[stepName].progress > 0 &&
            ` (${workflowStatus.phases[stepName].progress}%)`
          }
        </Alert>
      )}
    </Box>
  );

  const renderResults = () => {
    if (!workflowResults) return null

    const { correlatedFindings } = workflowResults
    if (!correlatedFindings) return null

    return (
      <Box>
        <Typography variant='h6' gutterBottom>
          Integrated Workflow Results
        </Typography>
        {/* Summary Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SearchIcon color='primary' sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant='h4' color='primary'>
                  {correlatedFindings.summary?.totalSubdomains || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Subdomains Discovered
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SecurityIcon color='success' sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant='h4' color='success.main'>
                  {correlatedFindings.summary?.scannedTargets || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Targets Scanned
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <BugIcon color='warning' sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant='h4' color='warning.main'>
                  {correlatedFindings.summary?.totalVulnerabilities || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Vulnerabilities Found
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon color='error' sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant='h4' color='error.main'>
                  {correlatedFindings.summary?.highRiskTargets?.length || 0}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  High-Risk Targets
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* High-Risk Targets */}
        {correlatedFindings.summary?.highRiskTargets?.length > 0 && (
          <Accordion
            expanded={expandedSection === 'high-risk'}
            onChange={() => setExpandedSection(expandedSection === 'high-risk' ? false : 'high-risk')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6' color='error'>
                ⚠️ High-Risk Targets ({correlatedFindings.summary.highRiskTargets.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {correlatedFindings.summary.highRiskTargets.map((target, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <WarningIcon color='error' />
                    </ListItemIcon>
                    <ListItemText
                      primary={target.target}
                      secondary={`${target.vulnerabilities} vulnerabilities found`}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Detailed Findings */}
        <Accordion
          expanded={expandedSection === 'detailed'}
          onChange={() => setExpandedSection(expandedSection === 'detailed' ? false : 'detailed')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant='h6'>
              📊 Detailed Findings ({correlatedFindings.detailedFindings?.length || 0})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Target</TableCell>
                    <TableCell>Vulnerabilities</TableCell>
                    <TableCell>Risk Score</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {correlatedFindings.detailedFindings?.map((finding, index) => (
                    <TableRow key={index}>
                      <TableCell>{finding.target}</TableCell>
                      <TableCell>
                        <Chip
                          label={finding.vulnerabilities?.length || 0}
                          color={finding.vulnerabilities?.length > 0 ? 'warning' : 'success'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={finding.riskScore || 0}
                          color={
                            finding.riskScore > 70 ? 'error' :
                            finding.riskScore > 40 ? 'warning' : 'success'
                          }
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={finding.scanStatus}
                          color='success'
                          size='small'
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        {/* Correlations */}
        {correlatedFindings.summary?.correlations?.length > 0 && (
          <Accordion
            expanded={expandedSection === 'correlations'}
            onChange={() => setExpandedSection(expandedSection === 'correlations' ? false : 'correlations')}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='h6'>
                🔗 Data Correlations ({correlatedFindings.summary.correlations.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {correlatedFindings.summary.correlations.map((correlation, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TimelineIcon color='primary' />
                    </ListItemIcon>
                    <ListItemText
                      primary={correlation.description}
                      secondary={correlation.type}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        <Box mt={3}>
          <Button
            variant='outlined'
            onClick={resetWorkflow}
            startIcon={<PlayIcon />}
          >
            Start New Workflow
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h4' component='h1' fontWeight='bold' mb={1}>
        Integrated Reconnaissance → Web2 Scanning
      </Typography>
      <Typography variant='body1' color='text.secondary' mb={4}>
        Automated workflow that discovers subdomains through reconnaissance and automatically
        performs security scanning on discovered targets
      </Typography>
      {error && (
        <Alert severity='error' sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation='vertical'>
            <Step>
              <StepLabel icon={getStepIcon(0, 'completed')}>
                {steps[0].label}
              </StepLabel>
              <StepContent>
                {renderConfigurationStep()}
              </StepContent>
            </Step>
            <Step>
              <StepLabel icon={getStepIcon(1, getPhaseStatus('reconnaissance'))}>
                {steps[1].label}
              </StepLabel>
              <StepContent>
                {renderProgressStep(1, 'reconnaissance', 'Discovering subdomains and gathering intelligence')}
              </StepContent>
            </Step>
            <Step>
              <StepLabel icon={getStepIcon(2, getPhaseStatus('target_extraction'))}>
                {steps[2].label}
              </StepLabel>
              <StepContent>
                {renderProgressStep(2, 'target_extraction', 'Processing discovered subdomains into scan targets')}
              </StepContent>
            </Step>
            <Step>
              <StepLabel icon={getStepIcon(3, getPhaseStatus('web2_scanning'))}>
                {steps[3].label}
              </StepLabel>
              <StepContent>
                {renderProgressStep(3, 'web2_scanning', 'Executing security scans on discovered targets')}
              </StepContent>
            </Step>
            <Step>
              <StepLabel icon={getStepIcon(4, getPhaseStatus('correlation'))}>
                {steps[4].label}
              </StepLabel>
              <StepContent>
                {activeStep >= 4 && renderResults()}
              </StepContent>
            </Step>
          </Stepper>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IntegratedReconToWeb2;