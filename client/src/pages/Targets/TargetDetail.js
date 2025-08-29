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
  Paper

} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  History as HistoryIcon,
  
} from '@mui/icons-material';
  import {
    Security as SecurityIcon
  } from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const TargetDetail = () => {
  const { id } = useParams();
  const [target, setTarget] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [scans, setScans] = useState([]);

  useEffect(() => {
    fetchTargetDetails();
    fetchTargetScans();
  }, [id]);

  const fetchTargetDetails = async () => {
    try {
      // Mock data for now
      setTarget({
        id: id,
        name: 'Example Website',
        url: 'https://example.com',
        description: 'Test target for demonstration',
        type: 'web2',
        status: 'active',
        lastScan: '2024-01-15',
        totalScans: 5,
        vulnerabilities: 3
      });
    } catch (error) {
      // logger.error('Error fetching target details:', error); // TODO: Implement client-side logging
    }
  };

  const fetchTargetScans = async () => {
    try {
      // Mock data for now
      setScans([
        {
          id: 1,
          type: 'Full Scan',
          status: 'completed',
          startTime: '2024-01-15 10:30:00',
          duration: '45 minutes',
          vulnerabilities: 3
        },
        {
          id: 2,
          type: 'Quick Scan',
          status: 'completed',
          startTime: '2024-01-14 15:20:00',
          duration: '15 minutes',
          vulnerabilities: 1
        }
      ]);
    } catch (error) {
      // logger.error('Error fetching target scans:', error); // TODO: Implement client-side logging
    }
  };

  const handleStartScan = () => {
    // logger.info('Starting scan for target:', id); // TODO: Implement client-side logging
  };

  if (!target) {
    return <Typography>Loading...</Typography>
  }

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          {target.name}
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Target Information
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>URL:</strong> {target.url}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Description:</strong> {target.description}
                </Typography>
                <Box display='flex' gap={1} mt={2}>
                  <Chip label={target.type} color='primary' />
                  <Chip
                    label={target.status}
                    color={target.status === 'active' ? 'success' : 'default'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Quick Stats
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Total Scans:</strong> {target.totalScans}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Vulnerabilities:</strong> {target.vulnerabilities}
                </Typography>
                <Typography variant='body1' gutterBottom>
                  <strong>Last Scan:</strong> {target.lastScan}
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<PlayIcon />}
                  onClick={handleStartScan}
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Start New Scan
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label='Scan History' icon={<HistoryIcon />} />
              <Tab label='Vulnerabilities' icon={<SecurityIcon />} />
            </Tabs>
          </Box>
          <CardContent>
            {tabValue === 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Scan Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Vulnerabilities</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scans.map((scan) => (
                      <TableRow key={scan.id}>
                        <TableCell>{scan.type}</TableCell>
                        <TableCell>
                          <Chip
                            label={scan.status}
                            color={scan.status === 'completed' ? 'success' : 'warning'}
                            size='small'
                          />
                        </TableCell>
                        <TableCell>{scan.startTime}</TableCell>
                        <TableCell>{scan.duration}</TableCell>
                        <TableCell>{scan.vulnerabilities}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {tabValue === 1 && (
              <Typography>Vulnerability details will be displayed here.</Typography>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default TargetDetail;