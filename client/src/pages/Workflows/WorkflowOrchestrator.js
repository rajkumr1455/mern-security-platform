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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider

} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Pause,
  Refresh,
  Add,
  Visibility,
  GetApp,
  Settings,
  Timeline,
  AccountTree,
  AutoAwesome,
  CheckCircle,
  Error,
  Warning,
  Schedule

} from '@mui/icons-material';
import { workflowAPI } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`workflow-tabpanel-${index}`}
      aria-labelledby={`workflow-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkflowOrchestrator = () => {
  const [tabValue, setTabValue] = useState(0);
  const [workflows, setWorkflows] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeWorkflows, setActiveWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [executeDialog, setExecuteDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);

  // Form states
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [],
    triggers: [],
    parameters: {}
  });

  const [executeForm, setExecuteForm] = useState({
    workflowId: '',
    parameters: {}
  });

  // Workflow results
  const [workflowResults, setWorkflowResults] = useState({});

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      const [workflowsRes, templatesRes, historyRes] = await Promise.all([
        workflowAPI.getWorkflows(),
        workflowAPI.getWorkflowTemplates(),
        workflowAPI.getWorkflowHistory()
      ]);

      setWorkflows(workflowsRes.data);
      setTemplates(templatesRes.data);
      setHistory(historyRes.data);

      // Filter active workflows
      setActiveWorkflows(workflowsRes.data.filter(w => w.status === 'running'));
    } catch (error) {
      // logger.error('Error loading workflow data:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    try {
      await workflowAPI.createWorkflow(newWorkflow);
      setCreateDialog(false);
      setNewWorkflow({
        name: '',
        description: '',
        steps: [],
        triggers: [],
        parameters: {}
      });
      loadWorkflowData();
    } catch (error) {
      // logger.error('Error creating workflow:', error); // TODO: Implement client-side logging
    }
  };

  const handleExecuteWorkflow = async () => {
    try {
      const response = await workflowAPI.executeWorkflow(
        executeForm.workflowId,
        executeForm.parameters
      );
      setExecuteDialog(false);
      loadWorkflowData();
    } catch (error) {
      // logger.error('Error executing workflow:', error); // TODO: Implement client-side logging
    }
  };

  const handleStopWorkflow = async (workflowId) => {
    try {
      await workflowAPI.stopWorkflow(workflowId);
      loadWorkflowData();
    } catch (error) {
      // logger.error('Error stopping workflow:', error); // TODO: Implement client-side logging
    }
  };

  const handleViewResults = async (workflowId) => {
    try {
      const response = await workflowAPI.getWorkflowResults(workflowId);
      setWorkflowResults(prev => ({
        ...prev,
        [workflowId]: response.data
      }));
    } catch (error) {
      // logger.error('Error fetching workflow results:', error); // TODO: Implement client-side logging
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'primary';
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'paused': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <PlayArrow color='primary' />
      case 'completed': return <CheckCircle color='success' />
      case 'failed': return <Error color='error' />
      case 'paused': return <Pause color='warning' />
      case 'pending': return <Schedule color='info' />
      default: return <Warning />
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
          🔄 Workflow Orchestrator
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<Add />}
            onClick={() => setCreateDialog(true)}
            sx={{ mr: 1 }}
          >
            Create Workflow
          </Button>
          <Button
            variant='outlined'
            startIcon={<PlayArrow />}
            onClick={() => setExecuteDialog(true)}
            sx={{ mr: 1 }}
          >
            Execute
          </Button>
          <IconButton onClick={loadWorkflowData}>
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
                <AccountTree color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Total Workflows
                  </Typography>
                  <Typography variant='h4'>
                    {workflows.length}
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
                <PlayArrow color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Active Workflows
                  </Typography>
                  <Typography variant='h4'>
                    {activeWorkflows.length}
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
                <AutoAwesome color='warning' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Templates
                  </Typography>
                  <Typography variant='h4'>
                    {templates.length}
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
                <Timeline color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Executions Today
                  </Typography>
                  <Typography variant='h4'>
                    {history.filter(h =>
                      new Date(h.startTime).toDateString() === new Date().toDateString()
                    ).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label='Active Workflows' />
            <Tab label='All Workflows' />
            <Tab label='Templates' />
            <Tab label='History' />
          </Tabs>
        </Box>
        {/* Active Workflows Tab */}
        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workflow Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Current Step</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activeWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>{workflow.name}</TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        {getStatusIcon(workflow.status)}
                        <Chip
                          label={workflow.status}
                          color={getStatusColor(workflow.status)}
                          size='small'
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        <LinearProgress
                          variant='determinate'
                          value={workflow.progress || 0}
                          sx={{ width: 100, mr: 1 }}
                        />
                        <Typography variant='body2'>
                          {workflow.progress || 0}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{workflow.currentStep || 'N/A'}</TableCell>
                    <TableCell>
                      {workflow.startTime ? new Date(workflow.startTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Results'>
                        <IconButton
                          size='small'
                          onClick={() => handleViewResults(workflow.id)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Stop Workflow'>
                        <IconButton
                          size='small'
                          onClick={() => handleStopWorkflow(workflow.id)}
                        >
                          <Stop />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* All Workflows Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Steps</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>{workflow.name}</TableCell>
                    <TableCell>{workflow.description}</TableCell>
                    <TableCell>{workflow.steps?.length || 0}</TableCell>
                    <TableCell>
                      {workflow.lastRun ? new Date(workflow.lastRun).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>{workflow.successRate || 0}%</TableCell>
                    <TableCell>
                      <Tooltip title='Execute'>
                        <IconButton
                          size='small'
                          onClick={() => {
                            setExecuteForm({ ...executeForm, workflowId: workflow.id });
                            setExecuteDialog(true);
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='View Details'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Settings'>
                        <IconButton size='small'>
                          <Settings />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Templates Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Typography variant='h6' gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography color='textSecondary' paragraph>
                      {template.description}
                    </Typography>
                    <Box display='flex' justifyContent='space-between' alignItems='center'>
                      <Chip
                        label={template.category}
                        size='small'
                        color='primary'
                      />
                      <Button
                        size='small'
                        startIcon={<Add />}
                        onClick={() => {
                          setNewWorkflow({
                            ...template,
                            name: `${template.name} - Copy`
                          });
                          setCreateDialog(true);
                        }}
                      >
                        Use Template
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
        {/* History Tab */}
        <TabPanel value={tabValue} index={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Started</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Results</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((execution) => (
                  <TableRow key={execution.id}>
                    <TableCell>{execution.workflowName}</TableCell>
                    <TableCell>
                      <Chip
                        label={execution.status}
                        color={getStatusColor(execution.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(execution.startTime).toLocaleString()}
                    </TableCell>
                    <TableCell>{execution.duration || 'N/A'}</TableCell>
                    <TableCell>
                      {execution.results ?
                        `${execution.results.success}/${execution.results.total}` :
                        'N/A'
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Results'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Download Report'>
                        <IconButton size='small'>
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
      {/* Create Workflow Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Workflow Name'
                value={newWorkflow.name}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={3}
                value={newWorkflow.description}
                onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateWorkflow} variant='contained'>
            Create Workflow
          </Button>
        </DialogActions>
      </Dialog>
      {/* Execute Workflow Dialog */}
      <Dialog open={executeDialog} onClose={() => setExecuteDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Execute Workflow</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Select Workflow</InputLabel>
                <Select
                  value={executeForm.workflowId}
                  onChange={(e) => setExecuteForm({ ...executeForm, workflowId: e.target.value })}
                >
                  {workflows.map((workflow) => (
                    <MenuItem key={workflow.id} value={workflow.id}>
                      {workflow.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExecuteDialog(false)}>Cancel</Button>
          <Button onClick={handleExecuteWorkflow} variant='contained'>
            Execute
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowOrchestrator;