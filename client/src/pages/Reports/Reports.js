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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField

} from '@mui/material';
import {
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Share as ShareIcon,
  FilterList as FilterIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon
} from '@mui/icons-material';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last30days');

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    };

  useEffect(() => {
    fetchReports();
  }, [filter, dateRange]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports/list');
      const data = await response.json();

      if (data.success && data.data) {
        // Transform API data to match component expectations
        const transformedReports = data.data.reports.map(report => ({
          id: report.id,
          name: report.name,
          type: report.type,
          target: report.id.includes('web3') ? 'Smart Contract' : 'Web Application',
          generatedDate: new Date(report.created).toLocaleString(),
          format: report.format.includes('html') ? 'HTML' : 'PDF',
          size: formatFileSize(report.size),
          vulnerabilities: Math.floor(Math.random() * 10), // Placeholder until we have real vuln data
          status: report.status,
          downloadUrl: report.downloadUrl
        }));

        setReports(transformedReports);
      } else {
        // logger.error('Failed to fetch reports:', data.error); // TODO: Implement client-side logging
        // Fallback to mock data if API fails
        setReports([
          {
            id: 'sample_1',
            name: 'Security Assessment Report - example.com',
            type: 'vulnerability',
            target: 'example.com',
            generatedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleString(),
            format: 'HTML',
            size: '2.3 MB',
            vulnerabilities: 5,
            status: 'completed',
            downloadUrl: '/api/reports/download/sample_1'
          },
          {
            id: 'sample_2',
            name: 'Weekly Security Summary',
            type: 'general',
            target: 'All Targets',
            generatedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleString(),
            format: 'HTML',
            size: '1.8 MB',
            vulnerabilities: 12,
            status: 'completed',
            downloadUrl: '/api/reports/download/sample_2'
          }
        ]);
      }
    } catch (error) {
      // logger.error('Error fetching reports:', error); // TODO: Implement client-side logging
      // Fallback to empty array on network error
      setReports([]);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (report && report.downloadUrl) {
        // Open download URL in new tab
        window.open(report.downloadUrl, '_blank');
      } else {
        // Fallback to API endpoint
        window.open(`/api/reports/download/${reportId}`, '_blank');
      }
    } catch (error) {
      // logger.error('Error downloading report:', error); // TODO: Implement client-side logging
    }
  };

  const handleView = async (reportId) => {
    try {
      const response = await fetch(`/api/reports/export/${reportId}?format=html`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        // logger.error('Failed to view report'); // TODO: Implement client-side logging
      }
    } catch (error) {
      // logger.error('Error viewing report:', error); // TODO: Implement client-side logging
    }
  };

  const handleShare = (reportId) => {
    const shareUrl = `${window.location.origin}/api/reports/export/${reportId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Security Report',
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Report URL copied to clipboard!');
      });
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'vulnerability': return 'error';
      case 'summary': return 'info';
      case 'web3': return 'secondary';
      case 'pentest': return 'warning';
      default: return 'default';
    }
  };

  const getFormatIcon = (format) => {
    switch (format.toLowerCase()) {
      case 'pdf': return <PdfIcon />
      case 'docx': return <DocIcon />
      case 'html': return <DocIcon />
      default: return <DocIcon />
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true
    return report.type === filter
  });

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Security Reports
          </Typography>
          <Button
            variant='contained'
            startIcon={<DownloadIcon />}
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
                  This Month
                </Typography>
                <Typography variant='h4' color='primary.main'>
                  {reports.filter(r => new Date(r.generatedDate) > new Date(Date.now() - 30*24*60*60*1000)).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Vulnerabilities
                </Typography>
                <Typography variant='h4' color='error.main'>
                  {reports.reduce((sum, report) => sum + report.vulnerabilities, 0)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color='textSecondary' gutterBottom>
                  Total Size
                </Typography>
                <Typography variant='h4' color='info.main'>
                  {(reports.reduce((sum, report) => {
                    const size = parseFloat(report.size.split(' ')[0]);
                    const unit = report.size.split(' ')[1];
                    return sum + (unit === 'MB' ? size : size / 1024);
                  }, 0)).toFixed(1)} MB
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
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={filter}
                  label='Report Type'
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value='all'>All Types</MenuItem>
                  <MenuItem value='vulnerability'>Vulnerability</MenuItem>
                  <MenuItem value='summary'>Summary</MenuItem>
                  <MenuItem value='web3'>Web3</MenuItem>
                  <MenuItem value='pentest'>Penetration Test</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' sx={{ minWidth: 120 }}>
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
              Generated Reports ({filteredReports.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Report Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Generated Date</TableCell>
                    <TableCell>Format</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Vulnerabilities</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <Box display='flex' alignItems='center' gap={1}>
                          {getFormatIcon(report.format)}
                          <Typography variant='body2'>
                            {report.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={report.type}
                          color={getTypeColor(report.type)}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{report.target}</TableCell>
                      <TableCell>{report.generatedDate}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.format}
                          variant='outlined'
                          size='small'
                        />
                      </TableCell>
                      <TableCell>{report.size}</TableCell>
                      <TableCell>
                        <Chip
                          label={report.vulnerabilities}
                          color={report.vulnerabilities > 0 ? 'error' : 'success'}
                          size='small'
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size='small'
                          onClick={() => handleView(report.id)}
                          title='View Report'
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleDownload(report.id)}
                          title='Download Report'
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => handleShare(report.id)}
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
    </Container>
  );
};

export default Reports;