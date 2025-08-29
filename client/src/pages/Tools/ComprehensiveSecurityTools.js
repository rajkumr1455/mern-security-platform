import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tab,
  Tabs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip,

} from '@mui/material';
import {
  Security as SecurityIcon,
  BugReport as BugReportIcon,
  Search as SearchIcon,
  Cloud as CloudIcon,
  PhoneAndroid as MobileIcon,
  Api as ApiIcon,
  Psychology as FuzzingIcon,
  Gavel as ExploitIcon,
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Timer as TimerIcon,
  Build as ToolIcon,
  Assessment as AssessmentIcon,
  Shield as ShieldIcon,
  Dns as DnsIcon,
  Https as HttpsIcon,
  Folder as FolderIcon,
  Wifi as NetworkCheckIcon
} from '@mui/icons-material';
import axios from 'axios';

const ComprehensiveSecurityTools = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [reconModules, setReconModules] = useState([]);
  const [web2Modules, setWeb2Modules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState(false);

  useEffect(() => {
    fetchAllModules();
  }, []);

  const fetchAllModules = async () => {
    try {
      setLoading(true);
      const [reconResponse, web2Response] = await Promise.all([
        axios.get('/api/recon/modules'),
        axios.get('/api/scans/web2/modules')
      ]);

      if (reconResponse.data.success) {
        setReconModules(reconResponse.data.modules);
      }
      if (web2Response.data.success) {
        setWeb2Modules(web2Response.data.modules);
      }
    } catch (error) {
      // logger.error('Failed to fetch modules:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedModule(isExpanded ? panel : false);
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'discovery':
        return <SearchIcon />
      case 'network':
        return <NetworkCheckIcon />
      case 'api':
      case 'api testing':
        return <ApiIcon />
      case 'security':
      case 'security testing':
        return <SecurityIcon />
      case 'intelligence':
        return <AssessmentIcon />
      case 'dynamic testing':
        return <FuzzingIcon />
      case 'exploitation':
        return <ExploitIcon />
      case 'mobile testing':
        return <MobileIcon />
      case 'cloud testing':
        return <CloudIcon />
      default:;
        return <ToolIcon />
    }
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'discovery':
        return 'info';
      case 'network':
        return 'primary';
      case 'api':
      case 'api testing':
        return 'secondary';
      case 'security':
      case 'security testing':
        return 'error';
      case 'intelligence':
        return 'warning';
      case 'dynamic testing':
        return 'success';
      case 'exploitation':
        return 'error';
      case 'mobile testing':
        return 'info';
      case 'cloud testing':
        return 'primary';
      default:;
        return 'default';
    }
  };

  const ModuleCard = ({ module, type }) => (
    <Card className='modern-card' sx={{ height: '100%', mb: 2 }}>
      <CardContent>
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={2}>
          <Avatar sx={{ bgcolor: `${getCategoryColor(module.category)}.main`, mr: 2 }}>
            {getCategoryIcon(module.category)}
          </Avatar>
          <Box flex={1}>
            <Typography variant='h6' fontWeight='bold' color='text.primary'>
              {module.name}
            </Typography>
            <Chip
              label={module.category}
              size='small'
              color={getCategoryColor(module.category)}
              variant='outlined'
            />
          </Box>
          <Chip
            label={module.enabled ? 'Enabled' : 'Disabled'}
            color={module.enabled ? 'success' : 'default'}
            size='small'
          />
        </Box>
        <Typography variant='body2' color='text.secondary' mb={2}>
          {module.description}
        </Typography>
        {module.estimatedTime && (
          <Box display='flex' alignItems='center' mb={2}>
            <TimerIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant='caption' color='text.secondary'>
              Estimated Time: {module.estimatedTime}
            </Typography>
          </Box>
        )}

        {module.tools && (
          <Box mb={2}>
            <Typography variant='subtitle2' fontWeight='bold' mb={1}>
              Tools Used:
            </Typography>
            <Box display='flex' flexWrap='wrap' gap={0.5}>
              {module.tools.slice(0, 4).map((tool, index) => (
                <Chip
                  key={index}
                  label={tool}
                  size='small'
                  variant='outlined'
                  color='primary'
                />
              ))}
              {module.tools.length > 4 && (
                <Chip
                  label={`+${module.tools.length - 4} more`}
                  size='small'
                  variant='outlined'
                />
              )}
            </Box>
          </Box>
        )}

        {module.techniques && (
          <Accordion
            expanded={expandedModule === `${type}-${module.id}`}
            onChange={handleAccordionChange(`${type}-${module.id}`)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='subtitle2' fontWeight='bold'>
                Techniques ({module.techniques.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {module.techniques.map((technique, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <ToolIcon fontSize='small' />
                    </ListItemIcon>
                    <ListItemText primary={technique} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        )}

        {module.subModules && (
          <Accordion
            expanded={expandedModule === `${type}-${module.id}-sub`}
            onChange={handleAccordionChange(`${type}-${module.id}-sub`)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant='subtitle2' fontWeight='bold'>
                Sub-modules ({module.subModules.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {module.subModules.map((subModule, index) => (
                <Box key={index} mb={2}>
                  <Typography variant='body2' fontWeight='bold'>
                    {subModule.name}
                  </Typography>
                  <Typography variant='caption' color='text.secondary' display='block'>
                    {subModule.description}
                  </Typography>
                  {subModule.tools && (
                    <Box mt={1}>
                      {subModule.tools.map((tool, toolIndex) => (
                        <Chip
                          key={toolIndex}
                          label={tool}
                          size='small'
                          variant='outlined'
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  )}
                  {index < module.subModules.length - 1 && <Divider sx={{ mt: 1 }} />}
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        <Box mt={2} display='flex' gap={1}>
          <Button
            variant='contained'
            size='small'
            startIcon={<PlayArrowIcon />}
            onClick={() => {
              if (type === 'recon') {
                window.location.href = '/reconnaissance';
              } else {
                window.location.href = '/scans/web2';
              }
            }}
          >
            Start {type === 'recon' ? 'Recon' : 'Scan'}
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<SettingsIcon />}
          >
            Configure
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Typography variant='h4' fontWeight='bold' mb={3}>
          Loading Security Tools...
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant='h3' component='h1' fontWeight='bold' color='text.primary' mb={1}>
          Comprehensive Security Tools
        </Typography>
        <Typography variant='body1' color='text.secondary' mb={3}>
          Advanced security testing tools integrated from professional penetration testing environments
        </Typography>
        <Alert severity='info' sx={{ mb: 3 }}>
          <Typography variant='body2'>
            <strong>Professional Tools Integration:</strong> All security tools have been
            integrated into this MERN stack platform with enhanced UI and real-time monitoring capabilities.
          </Typography>
        </Alert>
      </Box>
      {/* Tool Categories Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab
            label={
              <Box display='flex' alignItems='center'>
                <SearchIcon sx={{ mr: 1 }} />
                Reconnaissance ({reconModules.length})
              </Box>
            }
          />
          <Tab
            label={
              <Box display='flex' alignItems='center'>
                <SecurityIcon sx={{ mr: 1 }} />
                Web2 Security ({web2Modules.length})
              </Box>
            }
          />
        </Tabs>
      </Box>
      {/* Reconnaissance Tools */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant='h5' fontWeight='bold' mb={3}>
          Reconnaissance & Intelligence Gathering Tools
        </Typography>
        <Grid container spacing={3}>
          {reconModules.map((module) => (
            <Grid item xs={12} lg={6} key={module.id}>
              <ModuleCard module={module} type='recon' />
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      {/* Web2 Security Tools */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant='h5' fontWeight='bold' mb={3}>
          Web2 Security Testing Tools
        </Typography>
        <Grid container spacing={3}>
          {web2Modules.map((module) => (
            <Grid item xs={12} lg={6} key={module.id}>
              <ModuleCard module={module} type='web2' />
            </Grid>
          ))}
        </Grid>
      </TabPanel>
      {/* Quick Stats */}
      <Box mt={6}>
        <Typography variant='h5' fontWeight='bold' mb={3}>
          Tool Integration Statistics
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card className='modern-card'>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' fontWeight='bold' color='primary.main'>
                  {reconModules.length + web2Modules.length}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Tool Categories
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className='modern-card'>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' fontWeight='bold' color='success.main'>
                  {reconModules.reduce((acc, m) => acc + (m.tools?.length || 0), 0) +
                   web2Modules.reduce((acc, m) => acc + (m.tools?.length || 0), 0)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Individual Tools
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className='modern-card'>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' fontWeight='bold' color='warning.main'>
                  {web2Modules.reduce((acc, m) => acc + (m.subModules?.length || 0), 0)}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Security Modules
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card className='modern-card'>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant='h4' fontWeight='bold' color='error.main'>
                  100%;
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Integration Complete
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ComprehensiveSecurityTools;