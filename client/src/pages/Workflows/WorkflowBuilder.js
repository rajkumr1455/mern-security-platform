import React, { useState, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
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
  DragIndicator as DragIcon,
  Add as AddIcon,
  
} from '@mui/icons-material';
  import {
    Delete as DeleteIcon,
  } from '@mui/icons-material';
  import {
    Edit as EditIcon,
  } from '@mui/icons-material';
  import {
    Save as SaveIcon,
  } from '@mui/icons-material';
  import {
    PlayArrow as PlayIcon,
  } from '@mui/icons-material';
  import {
    ExpandMore as ExpandMoreIcon,
  } from '@mui/icons-material';
  import {
    Security as SecurityIcon,
  } from '@mui/icons-material';
  import {
    Search as SearchIcon,
  } from '@mui/icons-material';
  import {
    Code as CodeIcon,
  } from '@mui/icons-material';
  import {
    Cloud as CloudIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    BugReport as BugIcon,
  } from '@mui/icons-material';
  import {
    Schedule as ScheduleIcon,
  } from '@mui/icons-material';
  import {
    Settings as SettingsIcon
  } from '@mui/icons-material';
} from '@mui/icons-material';

const WorkflowBuilder = () => {
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [selectedModule, setSelectedModule] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  // Available modules for building workflows
  const availableModules = [
    {
      id: 'subdomain_discovery',
      name: 'Subdomain Discovery',
      category: 'reconnaissance',
      description: 'Discover subdomains using multiple techniques',
      icon: SearchIcon,
      color: '#4CAF50',
      estimatedTime: '5-15 minutes',
      inputs: ['domain'],
      outputs: ['subdomains_list', 'dns_records'],
      config: {
        tools: ['sublist3r', 'amass', 'subfinder'],
        wordlists: ['common', 'comprehensive'],
        timeout: 300,
        passive_only: false
      }
    },
    {
      id: 'port_scanning',
      name: 'Port Scanning',
      category: 'reconnaissance',
      description: 'Scan for open ports and services',
      icon: SecurityIcon,
      color: '#2196F3',
      estimatedTime: '10-30 minutes',
      inputs: ['target_list'],
      outputs: ['open_ports', 'service_fingerprints'],
      config: {
        scan_type: 'tcp_connect',
        ports: 'top_1000',
        timing: 'normal',
        service_detection: true
      }
    },
    {
      id: 'vulnerability_scanning',
      name: 'Vulnerability Scanning',
      category: 'scanning',
      description: 'Automated vulnerability detection',
      icon: BugIcon,
      color: '#FF9800',
      estimatedTime: '20-60 minutes',
      inputs: ['target_list', 'open_ports'],
      outputs: ['vulnerabilities', 'risk_assessment'],
      config: {
        scan_intensity: 'normal',
        vulnerability_types: ['web', 'network', 'ssl'],
        false_positive_reduction: true
      }
    },
    {
      id: 'web_crawling',
      name: 'Web Application Crawling',
      category: 'web_testing',
      description: 'Crawl and map web application structure',
      icon: CodeIcon,
      color: '#9C27B0',
      estimatedTime: '15-45 minutes',
      inputs: ['web_targets'],
      outputs: ['url_map', 'forms', 'parameters'],
      config: {
        max_depth: 3,
        follow_redirects: true,
        javascript_rendering: false,
        rate_limit: 'moderate'
      }
    },
    {
      id: 'api_discovery',
      name: 'API Discovery',
      category: 'api_testing',
      description: 'Discover and enumerate API endpoints',
      icon: CodeIcon,
      color: '#607D8B',
      estimatedTime: '10-30 minutes',
      inputs: ['web_targets'],
      outputs: ['api_endpoints', 'swagger_specs'],
      config: {
        discovery_methods: ['directory_bruteforce', 'swagger_discovery'],
        wordlists: ['api_common', 'rest_endpoints'],
        authentication_bypass: true
      }
    },
    {
      id: 'sql_injection_testing',
      name: 'SQL Injection Testing',
      category: 'web_testing',
      description: 'Test for SQL injection vulnerabilities',
      icon: SecurityIcon,
      color: '#F44336',
      estimatedTime: '30-90 minutes',
      inputs: ['forms', 'parameters'],
      outputs: ['sql_vulnerabilities', 'injection_points'],
      config: {
        injection_types: ['union', 'boolean', 'time_based'],
        database_types: ['mysql', 'postgresql', 'mssql'],
        payload_complexity: 'medium'
      }
    },
    {
      id: 'xss_testing',
      name: 'XSS Testing',
      category: 'web_testing',
      description: 'Test for Cross-Site Scripting vulnerabilities',
      icon: CodeIcon,
      color: '#E91E63',
      estimatedTime: '20-60 minutes',
      inputs: ['forms', 'parameters'],
      outputs: ['xss_vulnerabilities', 'payload_results'],
      config: {
        xss_types: ['reflected', 'stored', 'dom'],
        payload_sets: ['basic', 'advanced', 'waf_bypass'],
        browser_verification: true
      }
    },
    {
      id: 'authentication_testing',
      name: 'Authentication Testing',
      category: 'web_testing',
      description: 'Test authentication mechanisms',
      icon: SecurityIcon,
      color: '#795548',
      estimatedTime: '30-60 minutes',
      inputs: ['login_forms', 'auth_endpoints'],
      outputs: ['auth_vulnerabilities', 'session_analysis'],
      config: {
        tests: ['brute_force', 'bypass_attempts', 'session_fixation'],
        credential_lists: ['common_passwords', 'default_credentials'],
        rate_limiting: 'respect'
      }
    },
    {
      id: 'web3_analysis',
      name: 'Web3 Security Analysis',
      category: 'web3',
      description: 'Analyze Web3 applications and smart contracts',
      icon: CloudIcon,
      color: '#3F51B5',
      estimatedTime: '60-180 minutes',
      inputs: ['contract_addresses', 'web3_endpoints'],
      outputs: ['contract_vulnerabilities', 'defi_risks'],
      config: {
        blockchain_networks: ['ethereum', 'bsc', 'polygon'],
        analysis_tools: ['slither', 'mythril'],
        transaction_analysis: true
      }
    },
    {
      id: 'report_generation',
      name: 'Report Generation',
      category: 'reporting',
      description: 'Generate comprehensive security reports',
      icon: AssessmentIcon,
      color: '#009688',
      estimatedTime: '5-15 minutes',
      inputs: ['vulnerabilities', 'risk_assessment'],
      outputs: ['security_report', 'executive_summary'],
      config: {
        report_format: 'comprehensive',
        include_remediation: true,
        risk_scoring: 'cvss',
        export_formats: ['pdf', 'html', 'json']
      }
    }
  ];

  const categories = [
    { id: 'reconnaissance', name: 'Reconnaissance', color: '#4CAF50' },
    { id: 'scanning', name: 'Scanning', color: '#2196F3' },
    { id: 'web_testing', name: 'Web Testing', color: '#FF9800' },
    { id: 'api_testing', name: 'API Testing', color: '#9C27B0' },
    { id: 'web3', name: 'Web3', color: '#3F51B5' },
    { id: 'reporting', name: 'Reporting', color: '#009688' }
  ];

  const handleDragStart = (e, module) => {
    setDraggedItem(module);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedItem) {
      addStepToWorkflow(draggedItem);
      setDraggedItem(null);
    }
  };

  const addStepToWorkflow = (module) => {
    const newStep = {
      id: `${module.id}_${Date.now()}`,
      moduleId: module.id,
      name: module.name,
      category: module.category,
      description: module.description,
      icon: module.icon,
      color: module.color,
      estimatedTime: module.estimatedTime,
      config: { ...module.config },
      order: workflowSteps.length + 1,
      enabled: true
    };

    setWorkflowSteps([...workflowSteps, newStep]);
  };

  const removeStep = (stepId) => {
    setWorkflowSteps(workflowSteps.filter(step => step.id !== stepId)
  };

  const moveStep = (stepId, direction) => {
    const currentIndex = workflowSteps.findIndex(step => step.id === stepId);
    if (
      (direction === 'up' && currentIndex > 0) ||
      (direction === 'down' && currentIndex < workflowSteps.length - 1)
    ) {
      const newSteps = [...workflowSteps];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      [newSteps[currentIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[currentIndex]];

      // Update order numbers
      newSteps.forEach((step, index) => {
        step.order = index + 1
      });

      setWorkflowSteps(newSteps);
    }
  };

  const openStepConfig = (step) => {
    setSelectedModule(step);
    setConfigDialog(true);
  };

  const saveStepConfig = (stepId, newConfig) => {
    setWorkflowSteps(workflowSteps.map(step =>
      step.id === stepId ? { ...step, config: newConfig } : step
    ));
    setConfigDialog(false);
    setSelectedModule(null);
  };

  const saveWorkflow = () => {
    const workflow = {
      name: workflowName,
      description: workflowDescription,
      steps: workflowSteps,
      created: new Date().toISOString(),
      estimatedDuration: calculateTotalDuration()
    };

    // logger.info('Saving workflow:', workflow); // TODO: Implement client-side logging
    // Implement save logic
  };

  const executeWorkflow = () => {
    if (workflowSteps.length === 0) {
      alert('Please add at least one step to the workflow');
      return
    }

    console.log('Executing workflow:', {
      name: workflowName,
      steps: workflowSteps
    });
    // Implement execution logic
  };

  const calculateTotalDuration = () => {
    // Simple duration calculation - in reality, this would be more sophisticated
    const totalMinutes = workflowSteps.reduce((total, step) => {
      const timeRange = step.estimatedTime.match(/(\d+)-(\d+)/);
      if (timeRange) {
        return total + parseInt(timeRange[2]); // Use max time
      }
      return total + 30; // Default
    }, 0);

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Custom Workflow Builder
          </Typography>
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              startIcon={<SaveIcon />}
              onClick={saveWorkflow}
              disabled={!workflowName || workflowSteps.length === 0}
            >
              Save Workflow
            </Button>
            <Button
              variant='contained'
              startIcon={<PlayIcon />}
              onClick={executeWorkflow}
              disabled={workflowSteps.length === 0}
            >
              Execute Workflow
            </Button>
          </Box>
        </Box>
        {/* Workflow Configuration */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant='h6' gutterBottom>
            Workflow Configuration
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='Workflow Name'
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                placeholder='My Custom Security Workflow'
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant='body2' color='text.secondary'>
                Estimated Duration: {calculateTotalDuration()}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Steps: {workflowSteps.length}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label='Description'
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                placeholder='Describe what this workflow does...'
              />
            </Grid>
          </Grid>
        </Paper>
        <Grid container spacing={3}>
          {/* Available Modules */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 'fit-content' }}>
              <Typography variant='h6' gutterBottom>
                Available Modules
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Drag modules to the workflow builder to create your custom security testing workflow.
              </Typography>
              {categories.map((category) => (
                <Accordion key={category.id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display='flex' alignItems='center'>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.color,
                          mr: 1
                        }}
                      />
                      <Typography variant='subtitle2'>
                        {category.name}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    {availableModules
                      .filter(module => module.category === category.id)
                      .map((module) => {
                        const IconComponent = module.icon
                        return (
                          <Card
                            key={module.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, module)}
                            sx={{
                              mb: 1,
                              cursor: 'grab',
                              '&:hover': { boxShadow: 2 },
                              '&:active': { cursor: 'grabbing' }
                            }}
                          >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box display='flex' alignItems='center' mb={1}>
                                <Box
                                  sx={{
                                    p: 0.5,
                                    borderRadius: 1,
                                    backgroundColor: module.color,
                                    color: 'white',
                                    mr: 1,
                                    display: 'flex'
                                  }}
                                >
                                  <IconComponent fontSize='small' />
                                </Box>
                                <Typography variant='subtitle2' noWrap>
                                  {module.name}
                                </Typography>
                              </Box>
                              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.75rem' }}>
                                {module.description}
                              </Typography>
                              <Typography variant='body2' color='text.secondary' sx={{ fontSize: '0.7rem', mt: 0.5 }}>
                                {module.estimatedTime}
                              </Typography>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </Grid>
          {/* Workflow Builder */}
          <Grid item xs={12} md={8}>
            <Paper
              sx={{
                p: 3,
                minHeight: 400,
                border: '2px dashed #ccc',
                borderRadius: 2
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Typography variant='h6' gutterBottom>
                Workflow Steps
              </Typography>
              {workflowSteps.length === 0 ? (
                <Box
                  display='flex'
                  flexDirection='column'
                  alignItems='center'
                  justifyContent='center'
                  sx={{ minHeight: 300, color: 'text.secondary' }}
                >
                  <DragIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant='h6' gutterBottom>
                    Drag modules here to build your workflow
                  </Typography>
                  <Typography variant='body2'>
                    Start by dragging a reconnaissance module from the left panel
                  </Typography>
                </Box>
              ) : (
                <Stepper orientation='vertical'>
                  {workflowSteps.map((step, index) => {
                    const IconComponent = step.icon
                    return (
                      <Step key={step.id} active>
                        <StepLabel>
                          <Box display='flex' alignItems='center' justifyContent='space-between' width='100%'>
                            <Box display='flex' alignItems='center'>
                              <Box
                                sx={{
                                  p: 0.5,
                                  borderRadius: 1,
                                  backgroundColor: step.color,
                                  color: 'white',
                                  mr: 1,
                                  display: 'flex'
                                }}
                              >
                                <IconComponent fontSize='small' />
                              </Box>
                              <Box>
                                <Typography variant='subtitle1'>
                                  {step.name}
                                </Typography>
                                <Typography variant='body2' color='text.secondary'>
                                  {step.estimatedTime}
                                </Typography>
                              </Box>
                            </Box>
                            <Box display='flex' gap={1}>
                              <Tooltip title='Configure'>
                                <IconButton
                                  size='small'
                                  onClick={() => openStepConfig(step)}
                                >
                                  <SettingsIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Move Up'>
                                <IconButton
                                  size='small'
                                  onClick={() => moveStep(step.id, 'up')}
                                  disabled={index === 0}
                                >
                                  ↑;
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Move Down'>
                                <IconButton
                                  size='small'
                                  onClick={() => moveStep(step.id, 'down')}
                                  disabled={index === workflowSteps.length - 1}
                                >
                                  ↓;
                                </IconButton>
                              </Tooltip>
                              <Tooltip title='Remove'>
                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => removeStep(step.id)}
                                >
                                  <DeleteIcon fontSize='small' />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </StepLabel>
                        <StepContent>
                          <Typography variant='body2' color='text.secondary'>
                            {step.description}
                          </Typography>
                          <Box display='flex' gap={1} mt={1}>
                            <Chip
                              label={step.category}
                              size='small'
                              variant='outlined'
                            />
                            <Chip
                              label={step.enabled ? 'Enabled' : 'Disabled'}
                              size='small'
                              color={step.enabled ? 'success' : 'default'}
                            />
                          </Box>
                        </StepContent>
                      </Step>
                    );
                  })}
                </Stepper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
      {/* Step Configuration Dialog */}
      <Dialog
        open={configDialog}
        onClose={() => setConfigDialog(false)}
        maxWidth='md'
        fullWidth
      >
        {selectedModule && (
          <>
            <DialogTitle>
              Configure: {selectedModule.name}
            </DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' paragraph>
                {selectedModule.description}
              </Typography>
              <Typography variant='h6' gutterBottom sx={{ mt: 2 }}>
                Configuration Options
              </Typography>
              {/* Dynamic configuration form based on module type */}
              <Grid container spacing={2}>
                {Object.entries(selectedModule.config).map(([key, value]) => (
                  <Grid item xs={12} md={6} key={key}>
                    <TextField
                      fullWidth
                      label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      value={typeof value === 'object' ? JSON.stringify(value) : value}
                      variant='outlined'
                      size='small'
                    />
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfigDialog(false)}>
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={() => saveStepConfig(selectedModule.id, selectedModule.config)}
              >
                Save Configuration
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default WorkflowBuilder;