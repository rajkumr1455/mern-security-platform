import IntegratedReconToWeb2 from './IntegratedReconToWeb2';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem

} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Workflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [open, setOpen] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    type: 'automated',
    schedule: 'manual'
  });
  const navigate = useNavigate();
  const [showIntegratedWorkflow, setShowIntegratedWorkflow] = useState(false);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();

      if (data.success) {
        // If no workflows exist, create some default ones
        if (data.workflows.length === 0) {
          setWorkflows([
            {
              id: 1,
              name: 'Daily Security Scan',
              description: 'Automated daily vulnerability scan for all targets',
              type: 'automated',
              schedule: 'daily',
              status: 'active',
              lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              targets: 5,
              created: new Date().toISOString()
            },
            {
              id: 2,
              name: 'Weekly Deep Scan',
              description: 'Comprehensive weekly security assessment',
              type: 'automated',
              schedule: 'weekly',
              status: 'active',
              lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              targets: 3,
              created: new Date().toISOString()
            },
            {
              id: 3,
              name: 'Manual Penetration Test',
              description: 'Manual security testing workflow',
              type: 'manual',
              schedule: 'manual',
              status: 'draft',
              lastRun: null,
              nextRun: null,
              targets: 1,
              created: new Date().toISOString()
            }
          ]);
        } else {
          setWorkflows(data.workflows);
        }
      } else {
        // logger.error('Failed to fetch workflows:', data.error); // TODO: Implement client-side logging
        // Fallback to empty array
        setWorkflows([]);
      }
    } catch (error) {
      // logger.error('Error fetching workflows:', error); // TODO: Implement client-side logging
      // Fallback to empty array on network error
      setWorkflows([]);
    }
  };

  const handleAddWorkflow = async () => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newWorkflow,
          created: new Date().toISOString(),
          status: 'draft',
          targets: 0
        })
      });

      const data = await response.json();

      if (data.success) {
        // logger.info('Workflow created successfully:', data); // TODO: Implement client-side logging
        setOpen(false);
        setNewWorkflow({ name: '', description: '', type: 'automated', schedule: 'manual' });
        fetchWorkflows();
      } else {
        // logger.error('Failed to create workflow:', data.error); // TODO: Implement client-side logging
      }
    } catch (error) {
      // logger.error('Error adding workflow:', error); // TODO: Implement client-side logging
    }
  };

  const handleViewWorkflow = (workflowId) => {
    navigate(`/workflows/${workflowId}`);
  };

  const handleRunWorkflow = (workflowId) => {
    // logger.info('Running workflow:', workflowId); // TODO: Implement client-side logging
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'running': return 'warning';
      case 'draft': return 'default';
      case 'paused': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Security Workflows
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Create Workflow
          </Button>
        </Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Workflows
                </Typography>
                <Typography variant='h4'>
                  {workflows.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Active
                </Typography>
                <Typography variant='h4' color='success.main'>
                  {workflows.filter(w => w.status === 'active').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Automated
                </Typography>
                <Typography variant='h4' color='primary.main'>
                  {workflows.filter(w => w.type === 'automated').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Manual
                </Typography>
                <Typography variant='h4' color='info.main'>
                  {workflows.filter(w => w.type === 'manual').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Featured Integrated Workflow */}
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant='h5' gutterBottom>
              🚀 Integrated Reconnaissance → Web2 Scanning
            </Typography>
            <Typography variant='body1' sx={{ mb: 2, opacity: 0.9 }}>
              Automated workflow that discovers subdomains through reconnaissance and automatically
              performs security scanning on discovered targets. Complete end-to-end security assessment.
            </Typography>
            <Box display='flex' gap={2}>
              <Button
                variant='contained'
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                startIcon={<PlayIcon />}
                onClick={() => setShowIntegratedWorkflow(true)}
              >
                Start Integrated Workflow
              </Button>
              <Chip label='NEW' color='warning' size='small' />
              <Chip label='Automated' color='success' size='small' />
            </Box>
          </CardContent>
        </Card>
        {/* Workflows Grid */}
        <Grid container spacing={3}>
          {workflows.map((workflow) => (
            <Grid item xs={12} md={6} lg={4} key={workflow.id}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    {workflow.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    {workflow.description}
                  </Typography>
                  <Box display='flex' gap={1} mb={2}>
                    <Chip
                      label={workflow.type}
                      color='primary'
                      size='small'
                    />
                    <Chip
                      label={workflow.status}
                      color={getStatusColor(workflow.status)}
                      size='small'
                    />
                    <Chip
                      label={workflow.schedule}
                      variant='outlined'
                      size='small'
                    />
                  </Box>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    Targets: {workflow.targets}
                  </Typography>
                  {workflow.lastRun && (
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Last run: {workflow.lastRun}
                    </Typography>
                  )}

                  {workflow.nextRun && (
                    <Typography variant='body2' color='text.secondary' gutterBottom>
                      Next run: {workflow.nextRun}
                    </Typography>
                  )}

                  <Box display='flex' justifyContent='space-between' mt={2}>
                    <Button
                      size='small'
                      startIcon={<PlayIcon />}
                      onClick={() => handleRunWorkflow(workflow.id)}
                      disabled={workflow.status === 'running'}
                    >
                      Run
                    </Button>
                    <Box>
                      <IconButton
                        size='small'
                        onClick={() => handleViewWorkflow(workflow.id)}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton size='small'>
                        <EditIcon />
                      </IconButton>
                      <IconButton size='small' color='error'>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {/* Add Workflow Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Workflow Name'
            fullWidth
            variant='outlined'
            value={newWorkflow.name}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Description'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={newWorkflow.description}
            onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={newWorkflow.type}
              label='Type'
              onChange={(e) => setNewWorkflow({ ...newWorkflow, type: e.target.value })}
            >
              <MenuItem value='automated'>Automated</MenuItem>
              <MenuItem value='manual'>Manual</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Schedule</InputLabel>
            <Select
              value={newWorkflow.schedule}
              label='Schedule'
              onChange={(e) => setNewWorkflow({ ...newWorkflow, schedule: e.target.value })}
            >
              <MenuItem value='manual'>Manual</MenuItem>
              <MenuItem value='daily'>Daily</MenuItem>
              <MenuItem value='weekly'>Weekly</MenuItem>
              <MenuItem value='monthly'>Monthly</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddWorkflow} variant='contained'>Create Workflow</Button>
        </DialogActions>
      </Dialog>
      {/* Integrated Workflow Dialog */}
      <Dialog
        open={showIntegratedWorkflow}
        onClose={() => setShowIntegratedWorkflow(false)}
        maxWidth='lg'
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Typography variant='h5'>
            🚀 Integrated Reconnaissance → Web2 Scanning Workflow
          </Typography>
        </DialogTitle>
        <DialogContent>
          <IntegratedReconToWeb2 />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowIntegratedWorkflow(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Workflows;