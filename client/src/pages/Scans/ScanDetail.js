import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails

} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Info as InfoIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const ScanDetail = () => {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [vulnerabilities, setVulnerabilities] = useState([]);

  useEffect(() => {
    fetchScanDetails();
    fetchVulnerabilities();
  }, [id]);

  const fetchScanDetails = async () => {
    try {
      // Mock data for now
      setScan({
        id: id,
        name: 'Full Security Scan',
        target: 'example.com',
        type: 'web2',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-15 10:30:00',
        endTime: '2024-01-15 11:15:00',
        duration: '45 minutes',
        vulnerabilities: 3,
        scannedUrls: 150,
        totalRequests: 1250
      });
    } catch (error) {
      // logger.error('Error fetching scan details:', error); // TODO: Implement client-side logging
    }
  };

  const fetchVulnerabilities = async () => {
    try {
      // Mock data for now
      setVulnerabilities([
        {
          id: 1,
          title: 'SQL Injection',
          severity: 'high',
          url: 'https://example.com/login',
          parameter: 'username',
          description: 'SQL injection vulnerability found in login form',
          impact: 'Potential data breach and unauthorized access',
          recommendation: 'Use parameterized queries and input validation'
        },
        {
          id: 2,
          title: 'Cross-Site Scripting (XSS)',
          severity: 'medium',
          url: 'https://example.com/search',
          parameter: 'q',
          description: 'Reflected XSS vulnerability in search functionality',
          impact: 'Session hijacking and malicious script execution',
          recommendation: 'Implement proper output encoding and CSP headers'
        },
        {
          id: 3,
          title: 'Insecure Direct Object Reference',
          severity: 'medium',
          url: 'https://example.com/user/profile',
          parameter: 'id',
          description: 'IDOR vulnerability allows access to other user profiles',
          impact: 'Unauthorized access to sensitive user data',
          recommendation: 'Implement proper authorization checks'
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching vulnerabilities:', error); // TODO: Implement client-side logging
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  if (!scan) {
    return <Typography>Loading scan details...</Typography>
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          {scan.name}
        </Typography>
        {/* Scan Overview */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Scan Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Target
                    </Typography>
                    <Typography variant='body1'>{scan.target}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Type
                    </Typography>
                    <Chip label={scan.type} color='primary' size='small' />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Status
                    </Typography>
                    <Chip
                      label={scan.status}
                      color={scan.status === 'completed' ? 'success' : 'warning'}
                      size='small'
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant='body2' color='text.secondary'>
                      Duration
                    </Typography>
                    <Typography variant='body1'>{scan.duration}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Scan Results
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Vulnerabilities Found
                </Typography>
                <Typography variant='h3' color='error.main' gutterBottom>
                  {scan.vulnerabilities}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  URLs Scanned: {scan.scannedUrls}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Total Requests: {scan.totalRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        {/* Progress Bar */}
        {scan.status === 'running' && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Scan Progress
              </Typography>
              <LinearProgress variant='determinate' value={scan.progress} />
              <Typography variant='body2' sx={{ mt: 1 }}>
                {scan.progress}% Complete
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label='Vulnerabilities' icon={<BugIcon />} />
              <Tab label='Scan Details' icon={<InfoIcon />} />
            </Tabs>
          </Box>
          <CardContent>
            {tabValue === 0 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Discovered Vulnerabilities
                </Typography>
                {vulnerabilities.length === 0 ? (
                  <Alert severity='success'>
                    No vulnerabilities found in this scan.
                  </Alert>
                ) : (
                  vulnerabilities.map((vuln) => (
                    <Accordion key={vuln.id}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display='flex' alignItems='center' gap={2} width='100%'>
                          <Chip
                            label={vuln.severity}
                            color={getSeverityColor(vuln.severity)}
                            size='small'
                          />
                          <Typography variant='h6'>{vuln.title}</Typography>
                          <Typography variant='body2' color='text.secondary' sx={{ ml: 'auto' }}>
                            {vuln.url}
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant='body2' color='text.secondary'>
                              Description
                            </Typography>
                            <Typography variant='body1' gutterBottom>
                              {vuln.description}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                              Impact
                            </Typography>
                            <Typography variant='body1'>
                              {vuln.impact}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant='body2' color='text.secondary'>
                              Recommendation
                            </Typography>
                            <Typography variant='body1'>
                              {vuln.recommendation}
                            </Typography>
                          </Grid>
                          {vuln.parameter && (
                            <Grid item xs={12}>
                              <Typography variant='body2' color='text.secondary'>
                                Vulnerable Parameter
                              </Typography>
                              <Typography variant='body1' sx={{ fontFamily: 'monospace' }}>
                                {vuln.parameter}
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Detailed Scan Information
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Scan ID</strong></TableCell>
                        <TableCell>{scan.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Start Time</strong></TableCell>
                        <TableCell>{scan.startTime}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>End Time</strong></TableCell>
                        <TableCell>{scan.endTime || 'In Progress'}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>URLs Scanned</strong></TableCell>
                        <TableCell>{scan.scannedUrls}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><strong>Total Requests</strong></TableCell>
                        <TableCell>{scan.totalRequests}</TableCell>
                      </TableRow>
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

export default ScanDetail;