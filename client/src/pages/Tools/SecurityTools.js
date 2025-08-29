import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  LinearProgress

} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as VulnIcon,
  
} from '@mui/icons-material';
  import {
    Search as ReconIcon,
  } from '@mui/icons-material';
  import {
    Code as CodeIcon,
  } from '@mui/icons-material';
  import {
    Assessment as AssessmentIcon,
  } from '@mui/icons-material';
  import {
    Speed as SpeedIcon,
  } from '@mui/icons-material';
  import {
    CheckCircle as EnabledIcon,
  } from '@mui/icons-material';
  import {
    Cancel as DisabledIcon
  } from '@mui/icons-material';
import axios from 'axios';

const SecurityTools = () => {
  const [web2Modules, setWeb2Modules] = useState([]);
  const [reconModules, setReconModules] = useState([]);
  const [toolsStatus, setToolsStatus] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllTools();
  }, []);

  const fetchAllTools = async () => {
    try {
      setLoading(true);

      // Fetch Web2 scanning modules
      const web2Response = await axios.get('/api/scan/web2/modules');
      setWeb2Modules(web2Response.data.modules || []);

      // Fetch reconnaissance modules
      const reconResponse = await axios.get('/api/recon/modules');
      setReconModules(reconResponse.data.modules || []);

      // Fetch platform status
      const statusResponse = await axios.get('/api/status');
      setToolsStatus(statusResponse.data);

    } catch (error) {
      // logger.error('Error fetching tools:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getModuleIcon = (moduleId) => {
    if (moduleId?.includes('sql') || moduleId?.includes('xss') || moduleId?.includes('rce')) {
      return <VulnIcon />
    }
    if (moduleId?.includes('subdomain') || moduleId?.includes('dns') || moduleId?.includes('port')) {
      return <ReconIcon />
    }
    return <SecurityIcon />
  };

  if (loading) {
    return (
      <Container maxWidth='lg'>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading security tools...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Security Tools & Modules
        </Typography>
        {/* Platform Status */}
        <Alert
          severity={Object.values(toolsStatus).some(status => status) ? 'success' : 'warning'}
          sx={{ mb: 3 }}
        >
          <Typography variant='h6'>Platform Status</Typography>
          <Box display='flex' gap={2} mt={1}>
            <Chip
              icon={toolsStatus.core_available ? <EnabledIcon /> : <DisabledIcon />}
              label='Core Platform'
              color={toolsStatus.core_available ? 'success' : 'error'}
              size='small'
            />
            <Chip
              icon={toolsStatus.recon_available ? <EnabledIcon /> : <DisabledIcon />}
              label='Reconnaissance'
              color={toolsStatus.recon_available ? 'success' : 'error'}
              size='small'
            />
            <Chip
              icon={toolsStatus.web2_available ? <EnabledIcon /> : <DisabledIcon />}
              label='Web2 Security'
              color={toolsStatus.web2_available ? 'success' : 'error'}
              size='small'
            />
            <Chip
              icon={toolsStatus.web3_available ? <EnabledIcon /> : <DisabledIcon />}
              label='Web3 Analysis'
              color={toolsStatus.web3_available ? 'success' : 'error'}
              size='small'
            />
          </Box>
        </Alert>
        <Grid container spacing={3}>
          {/* Web2 Security Modules */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <SecurityIcon sx={{ mr: 1 }} />
                  Web2 Security Modules ({web2Modules.length})
                </Typography>
                <List>
                  {web2Modules.map((module, index) => (
                    <React.Fragment key={module.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getModuleIcon(module.id)}
                        </ListItemIcon>
                        <ListItemText
                          primary={module.name}
                          secondary={module.description}
                        />
                        <Box display='flex' gap={1}>
                          <Chip
                            label={module.enabled ? 'Enabled' : 'Disabled'}
                            color={module.enabled ? 'success' : 'default'}
                            size='small'
                          />
                          {module.severity && (
                            <Chip
                              label={module.severity}
                              color={getSeverityColor(module.severity)}
                              size='small'
                            />
                          )}
                        </Box>
                      </ListItem>
                      {index < web2Modules.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {web2Modules.length === 0 && (
                  <Typography color='text.secondary' textAlign='center' py={2}>
                    No Web2 modules available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Reconnaissance Modules */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <ReconIcon sx={{ mr: 1 }} />
                  Reconnaissance Modules ({reconModules.length})
                </Typography>
                <List>
                  {reconModules.map((module, index) => (
                    <React.Fragment key={module.id}>
                      <ListItem>
                        <ListItemIcon>
                          {getModuleIcon(module.id)}
                        </ListItemIcon>
                        <ListItemText
                          primary={module.name}
                          secondary={module.description}
                        />
                        <Chip
                          label={module.enabled ? 'Enabled' : 'Disabled'}
                          color={module.enabled ? 'success' : 'default'}
                          size='small'
                        />
                      </ListItem>
                      {index < reconModules.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                {reconModules.length === 0 && (
                  <Typography color='text.secondary' textAlign='center' py={2}>
                    No reconnaissance modules available
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Tool Statistics */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  <AssessmentIcon sx={{ mr: 1 }} />
                  Tool Statistics
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign='center'>
                      <Typography variant='h4' color='primary'>
                        {web2Modules.filter(m => m.enabled).length}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Active Web2 Tools
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign='center'>
                      <Typography variant='h4' color='secondary'>
                        {reconModules.filter(m => m.enabled).length}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Active Recon Tools
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign='center'>
                      <Typography variant='h4' color='success.main'>
                        {web2Modules.filter(m => m.severity === 'high').length}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        High Severity Scanners
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box textAlign='center'>
                      <Typography variant='h4' color='info.main'>
                        {toolsStatus.websocket_connections || 0}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        WebSocket Connections
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Quick Actions
                </Typography>
                <Box display='flex' gap={2} flexWrap='wrap'>
                  <Button
                    variant='contained'
                    startIcon={<ReconIcon />}
                    href='/reconnaissance'
                  >
                    Start Reconnaissance
                  </Button>
                  <Button
                    variant='contained'
                    startIcon={<SecurityIcon />}
                    href='/scans'
                  >
                    Run Security Scan
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<SpeedIcon />}
                    href='/performance'
                  >
                    Check Performance
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<AssessmentIcon />}
                    href='/reports'
                  >
                    View Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SecurityTools;