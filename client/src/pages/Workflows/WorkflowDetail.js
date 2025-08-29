import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider

} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  MyLocation as TargetIcon,
  History as HistoryIcon,
    Settings as SettingsIcon
  } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const WorkflowDetail = () => {
  const { id } = useParams();
  const [workflow, setWorkflow] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [executions, setExecutions] = useState([]);

  useEffect(() => {
    fetchWorkflowDetails();
    fetchExecutions();
  }, [id]);

  const fetchWorkflowDetails = async () => {
    try {
      // Mock data for now
      setWorkflow({
        id: id,
        name: 'Daily Security Scan',
        description: 'Automated daily vulnerability scan for all targets',
        type: 'automated',
        schedule: 'daily',
        status: 'active',
        lastRun: '2024-01-15 10:30:00',
        nextRun: '2024-01-16 10:30:00',
        targets: [
          { id: 1, name: 'example.com', url: 'https://example.com' },
          { id: 2, name: 'test.com', url: 'https://test.com' },
          { id: 3, name: 'demo.com', url: 'https://demo.com' }
        ],
        steps: [
          { id: 1, name: 'Target Discovery', type: 'recon', enabled: true },
          { id: 2, name: 'Port Scanning', type: 'scan', enabled: true },
          { id: 3, name: 'Vulnerability Assessment', type: 'scan', enabled: true },
          { id: 4, name: 'Report Generation', type: 'report', enabled: true }
        ],
        settings: {
          timeout: 3600,
          maxConcurrent: 3,
          notifications: true,
          emailReports: true
        }
      });
    } catch (error) {
      // logger.error('Error fetching workflow details:', error); // TODO: Implement client-side logging
    }
  };

  const fetchExecutions = async () => {
    try {
      // Mock data for now
      setExecutions([
        {
          id: 1,
          startTime: '2024-01-15 10:30:00',
          endTime: '2024-01-15 11:45:00',
          status: 'completed',
          duration: '1h 15m',
          targetsScanned: 3,
          vulnerabilities: 5
        },
        {
          id: 2,
          startTime: '2024-01-14 10:30:00',
          endTime: '2024-01-14 11:20:00',
          status: 'completed',
          duration: '50m',
          targetsScanned: 3,
          vulnerabilities: 2
        },
        {
          id: 3,
          startTime: '2024-01-13 10:30:00',
          endTime: null,
          status: 'failed',
          duration: '15m',
          targetsScanned: 1,
          vulnerabilities: 0
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching executions:', error); // TODO: Implement client-side logging
    }
  };

  const handleRunWorkflow = () => {
    // logger.info('Running workflow:', id); // TODO: Implement client-side logging
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  if (!workflow) {
    return <Typography>Loading workflow details...</Typography>
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            {workflow.name}
          </Typography>
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              variant='contained'
              startIcon={<PlayIcon />}
              onClick={handleRunWorkflow}
              disabled={workflow.status === 'running'}
            >
              Run Workflow
            </Button>
          </Box>
        </Box>
        {/* Workflow Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Workflow Information
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Description:</strong> {workflow.description}
                </Typography>
                <Box display='flex' gap={1} mt={2}>
                  <Chip label={workflow.type} color='primary' />
                  <Chip
                    label={workflow.status}
                    color={workflow.status === 'active' ? 'success' : 'default'}
                  />
                  <Chip label={workflow.schedule} variant='outlined' />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Schedule Information
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Last Run
                </Typography>
                <Typography variant='body1' gutterBottom>
                  {workflow.lastRun}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Next Run
                </Typography>
                <Typography variant='body1'>
                  {workflow.nextRun}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label='Targets' icon={<TargetIcon />} />
              <Tab label='Steps' icon={<SettingsIcon />} />
              <Tab label='Execution History' icon={<HistoryIcon />} />
            </Tabs>
          </Box>
          <CardContent>
            {tabValue === 0 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Target List ({workflow.targets.length})
                </Typography>
                <List>
                  {workflow.targets.map((target, index) => (
                    <React.Fragment key={target.id}>
                      <ListItem>
                        <ListItemIcon>
                          <TargetIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={target.name}
                          secondary={target.url}
                        />
                      </ListItem>
                      {index < workflow.targets.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Workflow Steps
                </Typography>
                <List>
                  {workflow.steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <ListItem>
                        <ListItemIcon>
                          <ScheduleIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${index + 1}. ${step.name}`}
                          secondary={`Type: ${step.type}`}
                        />
                        <Chip
                          label={step.enabled ? 'Enabled' : 'Disabled'}
                          color={step.enabled ? 'success' : 'default'}
                          size='small'
                        />
                      </ListItem>
                      {index < workflow.steps.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Recent Executions
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Targets</TableCell>
                        <TableCell>Vulnerabilities</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {executions.map((execution) => (
                        <TableRow key={execution.id}>
                          <TableCell>{execution.startTime}</TableCell>
                          <TableCell>{execution.endTime || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip
                              label={execution.status}
                              color={getStatusColor(execution.status)}
                              size='small'
                            />
                          </TableCell>
                          <TableCell>{execution.duration}</TableCell>
                          <TableCell>{execution.targetsScanned}</TableCell>
                          <TableCell>
                            <Chip
                              label={execution.vulnerabilities}
                              color={execution.vulnerabilities > 0 ? 'error' : 'success'}
                              size='small'
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default WorkflowDetail;