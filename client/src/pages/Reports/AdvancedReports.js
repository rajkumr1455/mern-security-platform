import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert

} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Assessment as ReportIcon,
  BugReport as BugIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { reportAPI } from '../../services/api';

const AdvancedReports = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'comprehensive',
    format: 'pdf',
    includeScreenshots: true,
    includeTechnicalDetails: true,
    includeExecutiveSummary: true,
    includeRemediation: true
  });

  const reportTypes = [
    { value: 'comprehensive', label: 'Comprehensive Security Report' },
    { value: 'vulnerability', label: 'Vulnerability Assessment Report' },
    { value: 'penetration', label: 'Penetration Testing Report' },
    { value: 'compliance', label: 'Compliance Report' },
    { value: 'executive', label: 'Executive Summary' },
    { value: 'technical', label: 'Technical Deep Dive' },
    { value: 'bug_bounty', label: 'Bug Bounty Report' }
  ];

  const reportFormats = [
    { value: 'pdf', label: 'PDF Document' },
    { value: 'html', label: 'HTML Report' },
    { value: 'docx', label: 'Word Document' },
    { value: 'json', label: 'JSON Data' }
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filter, dateRange]);

  const fetchReports = async () => {
    try {
      const response = await reportAPI.getAllReports();
      setReports(response.data.reports || [
        {
          id: 1,
          name: 'Comprehensive Security Assessment - example.com',
          type: 'comprehensive',
          format: 'PDF',
          size: '2.3 MB',
          generatedDate: '2024-01-15 11:45:00',
          vulnerabilities: 8,
          criticalFindings: 2,
          status: 'completed',
          downloadCount: 5,
          sharedWith: ['security@company.com']
        },
        {
          id: 2,
          name: 'Bug Bounty Report - XSS Vulnerability',
          type: 'bug_bounty',
          format: 'HTML',
          size: '850 KB',
          generatedDate: '2024-01-14 16:30:00',
          vulnerabilities: 1,
          criticalFindings: 0,
          status: 'completed',
          downloadCount: 12,
          sharedWith: ['bounty@platform.com']
        },
        {
          id: 3,
          name: 'Executive Security Summary Q1 2024',
          type: 'executive',
          format: 'PDF',
          size: '1.2 MB',
          generatedDate: '2024-01-13 09:15:00',
          vulnerabilities: 15,
          criticalFindings: 3,
          status: 'completed',
          downloadCount: 25,
          sharedWith: ['ceo@company.com', 'ciso@company.com']
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching reports:', error); // TODO: Implement client-side logging
    }
  };

  const filterReports = () => {
    let filtered = reports

    if (filter !== 'all') {
      filtered = filtered.filter(report => report.type === filter);
    }

    // Apply date range filter
    const now = new Date();
    const cutoffDate = new Date();
    switch (dateRange) {
      case 'last7days':
        cutoffDate.setDate(now.getDate() - 7);
        break
      case 'last30days':
        cutoffDate.setDate(now.getDate() - 30);
        break
      case 'last90days':
        cutoffDate.setDate(now.getDate() - 90);
        break
      default:;
        cutoffDate.setFullYear(2000); // Show all
    }

    filtered = filtered.filter(report =>
      new Date(report.generatedDate) >= cutoffDate
    );

    setFilteredReports(filtered);
  };

  const handleGenerateReport = async () => {
    try {
      // logger.info('Generating report with config:', reportConfig); // TODO: Implement client-side logging
      // Simulate report generation
      alert('Report generation started. You will be notified when complete.');
      setOpenGenerateDialog(false);

      // Reset config
      setReportConfig({
        type: 'comprehensive',
        format: 'pdf',
        includeScreenshots: true,
        includeTechnicalDetails: true,
        includeExecutiveSummary: true,
        includeRemediation: true
      });
    } catch (error) {
      // logger.error('Error generating report:', error); // TODO: Implement client-side logging
    }
  };

  const handleDownload = async (reportId, format) => {
    try {
      const response = await reportAPI.exportReport(reportId, format);
      // Handle blob download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url
      link.setAttribute('download', `report_${reportId}.${format.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // logger.error('Error downloading report:', error); // TODO: Implement client-side logging
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'comprehensive': return 'primary';
      case 'vulnerability': return 'error';
      case 'bug_bounty': return 'success';
      case 'executive': return 'info';
      case 'compliance': return 'warning';
      default: return 'default';
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <PdfIcon />
      case 'html': return <DocIcon />
      case 'docx': return <DocIcon />
      default: return <DocIcon />
    }
  };

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Advanced Security Reports
          </Typography>
          <Button
            variant='contained'
            startIcon={<ReportIcon />}
            onClick={() => setOpenGenerateDialog(true)}
          >
            Generate Report
          </Button>
        </Box>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Reports
                </Typography>
                <Typography variant='h4'>
                  {reports.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Critical Findings
                </Typography>
                <Typography variant='h4' color='error.main'>
                  {reports.reduce((sum, report) => sum + (report.criticalFindings || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Downloads
                </Typography>
                <Typography variant='h4' color='primary.main'>
                  {reports.reduce((sum, report) => sum + (report.downloadCount || 0), 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Shared Reports
                </Typography>
                <Typography variant='h4' color='info.main'>
                  {reports.filter(r => r.sharedWith && r.sharedWith.length > 0).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display='flex' gap={2} alignItems='center'>
              <FilterIcon />
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={filter}
                  label='Report Type'
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Types</MenuItem>
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 150 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label='Date Range'
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value='last7days'>Last 7 Days</MenuItem>
                  <MenuItem value='last30days'>Last 30 Days</MenuItem>
                  <MenuItem value='last90days'>Last 90 Days</MenuItem>
                  <MenuItem value='all'>All Time</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
        {/* Reports Table */}
        <Card>
          <CardContent>
            <Typography variant='h6' gutterBottom>
              Security Reports ({filteredReports.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Generated</TableCell>
                    <TableCell>Findings</TableCell>
                    <TableCell>Downloads</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          {getFormatIcon(report.format)}
                          <Box>
                            <Typography variant='body2' fontWeight='medium'>
                              {report.name}
                            </Typography>
                            <Typography variant='caption' color='text.secondary'>
                              {report.size}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={reportTypes.find(t => t.value === report.type)?.label || report.type}
                          color={getTypeColor(report.type)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.format}
                          variant='outlined'
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {new Date(report.generatedDate).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant='body2'>
                            {report.vulnerabilities} total
                          </Typography>
                          {report.criticalFindings > 0 && (
                            <Chip
                              label={`${report.criticalFindings} critical`}
                              color='error'
                              size='small'
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>
                          {report.downloadCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => {/* logger.info('View report', report.id); // TODO: Implement client-side logging */}}
                          title='View Report'
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDownload(report.id, report.format)}
                          title='Download Report'
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => {/* logger.info('Share report', report.id); // TODO: Implement client-side logging */}}
                          title='Share Report'
                        >
                          <ShareIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
      {/* Generate Report Dialog */}
      <Dialog open={openGenerateDialog} onClose={() => setOpenGenerateDialog(false)} maxWidth='md' fullWidth>
        <DialogTitle>Generate Security Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportConfig.type}
                  label='Report Type'
                  onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
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
                  value={reportConfig.format}
                  label='Format'
                  onChange={(e) => setReportConfig({...reportConfig, format: e.target.value})}
                >
                  {reportFormats.map((format) => (
                    <MenuItem key={format.value} value={format.value}>
                      {format.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='h6' gutterBottom>
                Report Options
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeExecutiveSummary}
                    onChange={(e) => setReportConfig({...reportConfig, includeExecutiveSummary: e.target.checked})}
                  />
                }
                label='Include Executive Summary'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeTechnicalDetails}
                    onChange={(e) => setReportConfig({...reportConfig, includeTechnicalDetails: e.target.checked})}
                  />
                }
                label='Include Technical Details'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeScreenshots}
                    onChange={(e) => setReportConfig({...reportConfig, includeScreenshots: e.target.checked})}
                  />
                }
                label='Include Screenshots'
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeRemediation}
                    onChange={(e) => setReportConfig({...reportConfig, includeRemediation: e.target.checked})}
                  />
                }
                label='Include Remediation Steps'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGenerateDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant='contained'>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdvancedReports;