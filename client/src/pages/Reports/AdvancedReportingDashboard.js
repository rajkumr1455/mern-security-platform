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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails

} from '@mui/material';
import {
  GetApp,
  Visibility,
  Share,
  Schedule,
  FilterList,
  PictureAsPdf,
  Description,
  TableChart,
  Assessment,
  TrendingUp,
  Security,
  BugReport,
  Timeline,
  ExpandMore,
  Refresh,
  Settings,
  Email,
  Print

} from '@mui/icons-material';
import { reportsAPI } from '../../services/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdvancedReportingDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reports, setReports] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [generateDialog, setGenerateDialog] = useState(false);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);
  const [filterDialog, setFilterDialog] = useState(false);

  // Form states
  const [reportForm, setReportForm] = useState({
    name: '',
    type: 'vulnerability',
    format: 'pdf',
    dateRange: '30',
    includeCharts: true,
    includeDetails: true,
    includeRecommendations: true,
    targets: [],
    scans: [],
    customFilters: {}
  });

  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    reportType: 'vulnerability',
    frequency: 'weekly',
    recipients: '',
    format: 'pdf',
    enabled: true
  });

  // Sample data
  const reportTypes = [
    { value: 'vulnerability', label: 'Vulnerability Assessment' },
    { value: 'penetration', label: 'Penetration Testing' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'technical', label: 'Technical Deep Dive' },
    { value: 'bugbounty', label: 'Bug Bounty Campaign' },
    { value: 'ai-analysis', label: 'AI Security Analysis' },
    { value: 'web3', label: 'Web3 Security Report' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF Document', icon: <PictureAsPdf /> },
    { value: 'docx', label: 'Word Document', icon: <Description /> },
    { value: 'xlsx', label: 'Excel Spreadsheet', icon: <TableChart /> },
    { value: 'html', label: 'HTML Report', icon: <Assessment /> },
    { value: 'json', label: 'JSON Data', icon: <Description /> }
  ];

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      setReports([
        {
          id: 1,
          name: 'Monthly Vulnerability Assessment',
          type: 'vulnerability',
          format: 'pdf',
          status: 'completed',
          createdAt: new Date().toISOString(),
          size: '2.4 MB',
          findings: 15,
          criticalFindings: 3
        },
        {
          id: 2,
          name: 'Executive Security Summary Q4',
          type: 'executive',
          format: 'pdf',
          status: 'generating',
          createdAt: new Date().toISOString(),
          size: '1.8 MB',
          findings: 8,
          criticalFindings: 1
        },
        {
          id: 3,
          name: 'Bug Bounty Campaign Report',
          type: 'bugbounty',
          format: 'html',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          size: '3.2 MB',
          findings: 22,
          criticalFindings: 5
        }
      ]);

      setTemplates([
        {
          id: 1,
          name: 'Standard Vulnerability Report',
          type: 'vulnerability',
          description: 'Comprehensive vulnerability assessment template',
          sections: ['Executive Summary', 'Methodology', 'Findings', 'Recommendations'],
          lastUsed: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Executive Dashboard',
          type: 'executive',
          description: 'High-level security overview for executives',
          sections: ['Risk Overview', 'Key Metrics', 'Action Items'],
          lastUsed: new Date(Date.now() - 172800000).toISOString()
        }
      ]);

      setSchedules([
        {
          id: 1,
          name: 'Weekly Security Summary',
          reportType: 'vulnerability',
          frequency: 'weekly',
          nextRun: new Date(Date.now() + 86400000).toISOString(),
          recipients: 'security-team@company.com',
          enabled: true,
          lastRun: new Date(Date.now() - 604800000).toISOString()
        },
        {
          id: 2,
          name: 'Monthly Executive Report',
          reportType: 'executive',
          frequency: 'monthly',
          nextRun: new Date(Date.now() + 2592000000).toISOString(),
          recipients: 'executives@company.com',
          enabled: true,
          lastRun: new Date(Date.now() - 2592000000).toISOString()
        }
      ]);

    } catch (error) {
      // logger.error('Error loading reporting data:', error); // TODO: Implement client-side logging
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      // Mock API call
      // logger.info('Generating report with config:', reportForm); // TODO: Implement client-side logging
      setGenerateDialog(false);

      // Add new report to list
      const newReport = {
        id: Date.now(),
        name: reportForm.name,
        type: reportForm.type,
        format: reportForm.format,
        status: 'generating',
        createdAt: new Date().toISOString(),
        size: 'Generating...',
        findings: 0,
        criticalFindings: 0
      };

      setReports(prev => [newReport, ...prev]);

      // Simulate report generation
      setTimeout(() => {
        setReports(prev => prev.map(r =>
          r.id === newReport.id
            ? { ...r, status: 'completed', size: '2.1 MB', findings: 12, criticalFindings: 2 }
            : r
        ));
      }, 3000);

    } catch (error) {
      // logger.error('Error generating report:', error); // TODO: Implement client-side logging
    }
  };

  const handleScheduleReport = async () => {
    try {
      // logger.info('Scheduling report:', scheduleForm); // TODO: Implement client-side logging
      setScheduleDialog(false);

      const newSchedule = {
        id: Date.now(),
        ...scheduleForm,
        nextRun: new Date(Date.now() + 86400000).toISOString(),
        lastRun: null
      };

      setSchedules(prev => [newSchedule, ...prev]);

    } catch (error) {
      // logger.error('Error scheduling report:', error); // TODO: Implement client-side logging
    }
  };

  const handleDownloadReport = async (reportId, format) => {
    try {
      // Mock download
      // logger.info(`Downloading report ${reportId} in ${format} format`); // TODO: Implement client-side logging
      // In real implementation, this would trigger a file download
    } catch (error) {
      // logger.error('Error downloading report:', error); // TODO: Implement client-side logging
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'generating': return 'primary';
      case 'failed': return 'error';
      case 'scheduled': return 'info';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'vulnerability': return <Security />
      case 'executive': return <Assessment />
      case 'bugbounty': return <BugReport />
      case 'compliance': return <Description />
      case 'technical': return <Timeline />
      default: return <Description />
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
          📊 Advanced Reporting Dashboard
        </Typography>
        <Box>
          <Button
            variant='contained'
            startIcon={<Assessment />}
            onClick={() => setGenerateDialog(true)}
            sx={{ mr: 1 }}
          >
            Generate Report
          </Button>
          <Button
            variant='outlined'
            startIcon={<Schedule />}
            onClick={() => setScheduleDialog(true)}
            sx={{ mr: 1 }}
          >
            Schedule Report
          </Button>
          <IconButton onClick={loadReportingData}>
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
                <Description color='primary' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant='h4'>
                    {reports.length}
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
                <Schedule color='success' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    Scheduled Reports
                  </Typography>
                  <Typography variant='h4'>
                    {schedules.filter(s => s.enabled).length}
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
                <Assessment color='warning' sx={{ mr: 2 }} />
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
                <TrendingUp color='info' sx={{ mr: 2 }} />
                <Box>
                  <Typography color='textSecondary' gutterBottom>
                    This Month
                  </Typography>
                  <Typography variant='h4'>
                    {reports.filter(r =>
                      new Date(r.createdAt).getMonth() === new Date().getMonth()
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
            <Tab label='Generated Reports' />
            <Tab label='Scheduled Reports' />
            <Tab label='Report Templates' />
            <Tab label='Analytics' />
          </Tabs>
        </Box>
        {/* Generated Reports Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box display='flex' justifyContent='between' alignItems='center' mb={2}>
            <Typography variant='h6'>Recent Reports</Typography>
            <Button startIcon={<FilterList />} onClick={() => setFilterDialog(true)}>
              Filter
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Findings</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Box display='flex' alignItems='center'>
                        {getTypeIcon(report.type)}
                        <Typography sx={{ ml: 1 }}>{report.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={reportTypes.find(t => t.value === report.type)?.label || report.type}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status)}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant='body2'>
                          {report.findings} total
                        </Typography>
                        <Typography variant='caption' color='error'>
                          {report.criticalFindings} critical
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title='View Report'>
                        <IconButton size='small'>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Download'>
                        <IconButton
                          size='small'
                          onClick={() => handleDownloadReport(report.id, report.format)}
                          disabled={report.status !== 'completed'}
                        >
                          <GetApp />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Share'>
                        <IconButton size='small'>
                          <Share />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Scheduled Reports Tab */}
        <TabPanel value={tabValue} index={1}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Schedule Name</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={reportTypes.find(t => t.value === schedule.reportType)?.label}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{schedule.frequency}</TableCell>
                    <TableCell>
                      {new Date(schedule.nextRun).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{schedule.recipients}</TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.enabled ? 'Active' : 'Disabled'}
                        color={schedule.enabled ? 'success' : 'default'}
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title='Edit Schedule'>
                        <IconButton size='small'>
                          <Settings />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='Run Now'>
                        <IconButton size='small'>
                          <Assessment />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        {/* Report Templates Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            {templates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card>
                  <CardContent>
                    <Box display='flex' alignItems='center' mb={2}>
                      {getTypeIcon(template.type)}
                      <Typography variant='h6' sx={{ ml: 1 }}>
                        {template.name}
                      </Typography>
                    </Box>
                    <Typography color='textSecondary' paragraph>
                      {template.description}
                    </Typography>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle2'>
                          Sections ({template.sections.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <List dense>
                          {template.sections.map((section, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <Description fontSize='small' />
                              </ListItemIcon>
                              <ListItemText primary={section} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                    <Box display='flex' justifyContent='space-between' alignItems='center' mt={2}>
                      <Typography variant='caption' color='textSecondary'>
                        Last used: {new Date(template.lastUsed).toLocaleDateString()}
                      </Typography>
                      <Button
                        size='small'
                        startIcon={<Assessment />}
                        onClick={() => {
                          setReportForm({ ...reportForm, type: template.type, name: template.name });
                          setGenerateDialog(true);
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
        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Report Generation Trends
                  </Typography>
                  <Typography color='textSecondary'>
                    Monthly report generation statistics
                  </Typography>
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color='textSecondary'>
                      Chart visualization would go here
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    Most Popular Report Types
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Security /></ListItemIcon>
                      <ListItemText
                        primary='Vulnerability Reports'
                        secondary='45% of all reports'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Assessment /></ListItemIcon>
                      <ListItemText
                        primary='Executive Summaries'
                        secondary='25% of all reports'
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><BugReport /></ListItemIcon>
                      <ListItemText
                        primary='Bug Bounty Reports'
                        secondary='20% of all reports'
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Card>
      {/* Generate Report Dialog */}
      <Dialog open={generateDialog} onClose={() => setGenerateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Generate Custom Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Report Name'
                value={reportForm.name}
                onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportForm.type}
                  onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Format</InputLabel>
                <Select
                  value={reportForm.format}
                  onChange={(e) => setReportForm({ ...reportForm, format: e.target.value })}
                >
                  {formatOptions.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      <Box display='flex' alignItems='center'>
                        {format.icon}
                        <Typography sx={{ ml: 1 }}>{format.label}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='subtitle2' gutterBottom>
                Include Sections
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportForm.includeCharts}
                      onChange={(e) => setReportForm({ ...reportForm, includeCharts: e.target.checked })}
                    />
                  }
                  label='Charts & Graphs'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportForm.includeDetails}
                      onChange={(e) => setReportForm({ ...reportForm, includeDetails: e.target.checked })}
                    />
                  }
                  label='Detailed Findings'
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={reportForm.includeRecommendations}
                      onChange={(e) => setReportForm({ ...reportForm, includeRecommendations: e.target.checked })}
                    />
                  }
                  label='Recommendations'
                />
              </FormGroup>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant='contained'>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
      {/* Schedule Report Dialog */}
      <Dialog open={scheduleDialog} onClose={() => setScheduleDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Schedule Automated Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Schedule Name'
                value={scheduleForm.name}
                onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={scheduleForm.reportType}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, reportType: e.target.value })}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                >
                  <MenuItem value='daily'>Daily</MenuItem>
                  <MenuItem value='weekly'>Weekly</MenuItem>
                  <MenuItem value='monthly'>Monthly</MenuItem>
                  <MenuItem value='quarterly'>Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Email Recipients'
                value={scheduleForm.recipients}
                onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })}
                placeholder='email1@company.com, email2@company.com'
                helperText='Separate multiple emails with commas'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleScheduleReport} variant='contained'>
            Schedule Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedReportingDashboard;