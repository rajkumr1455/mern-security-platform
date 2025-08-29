import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Code as CodeIcon,
  
} from '@mui/icons-material';
  import {
    Download as DownloadIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as CheckIcon,
  } from '@mui/icons-material';
  import {
    Warning as WarningIcon,
  } from '@mui/icons-material';
  import {
    Info as InfoIcon,
  } from '@mui/icons-material';
  import {
    Assignment as AssignmentIcon
  } from '@mui/icons-material';
} from '@mui/icons-material';

const ImmuneFiPoCGenerator = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [pocData, setPocData] = useState({
    name: '',
    type: 'reentrancy',
    severity: 'high',
    targetContract: '',
    network: 'ethereum',
    description: '',
    impact: '',
    mitigation: ''
  });
  const [generatedPoC, setGeneratedPoC] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);

  const vulnerabilityTypes = [
    { value: 'reentrancy', label: 'Reentrancy Attack', icon: '🔄' },
    { value: 'flashloan', label: 'Flash Loan Attack', icon: '⚡' },
    { value: 'price-manipulation', label: 'Price Manipulation', icon: '📈' },
    { value: 'access-control', label: 'Access Control', icon: '🔐' },
    { value: 'integer-overflow', label: 'Integer Overflow', icon: '🔢' },
    { value: 'front-running', label: 'Front Running', icon: '🏃' },
    { value: 'sandwich-attack', label: 'Sandwich Attack', icon: '🥪' },
    { value: 'governance-attack', label: 'Governance Attack', icon: '🗳️' }
  ];

  const severityLevels = [
    { value: 'critical', label: 'Critical', color: 'error', description: '$1M+ at risk' },
    { value: 'high', label: 'High', color: 'warning', description: '$100K+ at risk' },
    { value: 'medium', label: 'Medium', color: 'info', description: '$10K+ at risk' },
    { value: 'low', label: 'Low', color: 'success', description: '<$10K at risk' }
  ];

  const networks = [
    { value: 'ethereum', label: 'Ethereum', icon: '⟠' },
    { value: 'polygon', label: 'Polygon', icon: '🟣' },
    { value: 'arbitrum', label: 'Arbitrum', icon: '🔵' },
    { value: 'optimism', label: 'Optimism', icon: '🔴' },
    { value: 'avalanche', label: 'Avalanche', icon: '🔺' },
    { value: 'bsc', label: 'BSC', icon: '🟡' }
  ];

  const steps = [
    'Vulnerability Details',
    'Technical Specifications',
    'Impact Assessment',
    'Generate PoC'
  ];

  const handleInputChange = (field, value) => {
    setPocData(prev => ({
      ...prev,
      [field]: value
    })
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const generatePoC = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/immunefi/generate-poc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pocData)
      });

      const result = await response.json();

      if (result.success) {
        setGeneratedPoC(result.data);
        setActiveStep(4); // Move to completion step
      } else {
        // logger.error('PoC generation failed:', result.error); // TODO: Implement client-side logging
      }
    } catch (error) {
      // logger.error('Error generating PoC:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const downloadPoC = () => {
    if (generatedPoC) {
      // Create download link for the generated PoC
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(generatedPoC, null, 2)], {
        type: 'application/json'
      });
      element.href = URL.createObjectURL(file);
      element.download = `immunefi-poc-${pocData.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Vulnerability Name'
                value={pocData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder='e.g., Reentrancy in Withdraw Function'
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Vulnerability Type</InputLabel>
                <Select
                  value={pocData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {vulnerabilityTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={pocData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                >
                  {severityLevels.map((level) => (
                    <MenuItem key={level.value} value={level.value}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <Chip
                          label={level.label}
                          color={level.color}
                          size='small'
                        />
                        <Typography variant='body2' color='textSecondary'>
                          {level.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Vulnerability Description'
                value={pocData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder='Detailed description of the vulnerability...'
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Target Contract Address'
                value={pocData.targetContract}
                onChange={(e) => handleInputChange('targetContract', e.target.value)}
                placeholder='0x1234567890abcdef1234567890abcdef12345678'
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Network</InputLabel>
                <Select
                  value={pocData.network}
                  onChange={(e) => handleInputChange('network', e.target.value)}
                >
                  {networks.map((network) => (
                    <MenuItem key={network.value} value={network.value}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <span>{network.icon}</span>
                        <span>{network.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Impact Assessment'
                value={pocData.impact}
                onChange={(e) => handleInputChange('impact', e.target.value)}
                placeholder='Describe the financial and operational impact...'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label='Recommended Mitigation'
                value={pocData.mitigation}
                onChange={(e) => handleInputChange('mitigation', e.target.value)}
                placeholder='Describe how to fix the vulnerability...'
              />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Typography variant='h6' gutterBottom>
              Review and Generate PoC
            </Typography>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Vulnerability Name
                    </Typography>
                    <Typography variant='body1'>{pocData.name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Type
                    </Typography>
                    <Chip
                      label={vulnerabilityTypes.find(t => t.value === pocData.type)?.label}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Severity
                    </Typography>
                    <Chip
                      label={pocData.severity}
                      color={severityLevels.find(s => s.value === pocData.severity)?.color}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant='subtitle2' color='textSecondary'>
                      Network
                    </Typography>
                    <Typography variant='body1'>{pocData.network}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Button
              variant='contained'
              size='large'
              onClick={generatePoC}
              loading={loading}
              startIcon={<CodeIcon />}
              fullWidth
            >
              {loading ? 'Generating PoC...' : 'Generate Immunefi PoC'}
            </Button>
          </Box>
        );

      default:;
        return null
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant='h4' gutterBottom align='center'>
        🛡️ Immunefi PoC Generator
      </Typography>
      <Typography variant='body1' color='textSecondary' align='center' sx={{ mb: 4 }}>
        Generate professional proof-of-concept templates for Immunefi bug bounty submissions
      </Typography>
      {!generatedPoC ? (
        <Card>
          <CardContent>
            <Stepper activeStep={activeStep} orientation='vertical'>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  <StepContent>
                    {renderStepContent(index)}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant='contained'
                        onClick={index === steps.length - 1 ? generatePoC : handleNext}
                        sx={{ mr: 1 }}
                        disabled={loading}
                      >
                        {index === steps.length - 1 ? 'Generate' : 'Continue'}
                      </Button>
                      {index > 0 && (
                        <Button onClick={handleBack}>
                          Back
                        </Button>
                      )}
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <CheckIcon color='success' />
              <Typography variant='h5'>
                PoC Generated Successfully!
              </Typography>
            </Box>
            <Alert severity='success' sx={{ mb: 3 }}>
              Your Immunefi-compliant proof of concept has been generated and is ready for submission.
            </Alert>
            <Typography variant='h6' gutterBottom>
              Generated Files:
            </Typography>
            <List>
              {[
                'foundry.toml - Foundry configuration',
                'src/Exploit.sol - Main exploit contract',
                'test/ExploitTest.t.sol - Comprehensive tests',
                'script/Deploy.s.sol - Deployment script',
                'README.md - Professional documentation',
                '.env.example - Environment template'
              ].map((file, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary={file} />
                </ListItem>
              ))}
            </List>
            <Box display='flex' gap={2} mt={3}>
              <Button
                variant='contained'
                startIcon={<DownloadIcon />}
                onClick={downloadPoC}
              >
                Download PoC
              </Button>
              <Button
                variant='outlined'
                onClick={() => setPreviewDialog(true)}
              >
                Preview Code
              </Button>
              <Button
                variant='outlined'
                onClick={() => {
                  setGeneratedPoC(null);
                  setActiveStep(0);
                }}
              >
                Generate Another
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth='lg'
        fullWidth
      >
        <DialogTitle>PoC Code Preview</DialogTitle>
        <DialogContent>
          <Typography variant='body2' component='pre' sx={{
            backgroundColor: '#f5f5f5',
            p: 2,
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: 400
          }}>
            {generatedPoC ? JSON.stringify(generatedPoC, null, 2) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImmuneFiPoCGenerator;