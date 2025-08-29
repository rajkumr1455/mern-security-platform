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
  TextField

} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  
} from '@mui/icons-material';
  import {
    Delete as DeleteIcon,
  } from '@mui/icons-material';
  import {
    Visibility as ViewIcon
  } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [open, setOpen] = useState(false);
  const [newTarget, setNewTarget] = useState({
    name: '',
    url: '',
    description: '',
    type: 'web2'
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch targets from API
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const response = await axios.get('/api/targets');
      const targetsData = response.data.targets || {};

      // Convert backend format to React format
      const targetsArray = Object.entries(targetsData).map(([key, value], index) => ({
        id: index + 1,
        name: key,
        url: value.url || key,
        description: value.description || 'No description available',
        type: value.type || 'web2',
        status: value.status || 'active',
        lastScan: value.lastScan || 'Never'
      }));

      setTargets(targetsArray);
    } catch (error) {
      // logger.error('Error fetching targets:', error); // TODO: Implement client-side logging
      // Fallback to empty array
      setTargets([]);
    }
  };

  const handleAddTarget = async () => {
    try {
      // Validate required fields
      if (!newTarget.name.trim()) {
        alert('Target name is required');
        return
      }
      if (!newTarget.url.trim()) {
        alert('Target URL is required');
        return
      }

      // Add target via backend API
      const response = await axios.post('/api/targets', {
        name: newTarget.name,
        url: newTarget.url,
        description: newTarget.description,
        type: newTarget.type
      });

      // logger.info('Target added successfully:', response.data); // TODO: Implement client-side logging
      setOpen(false);
      setNewTarget({ name: '', url: '', description: '', type: 'web2' });
      fetchTargets();
    } catch (error) {
      // logger.error('Error adding target:', error); // TODO: Implement client-side logging

      // Show more detailed error message
      if (error.response?.data?.details) {
        const validationErrors = error.response.data.details.map(err => err.msg).join(', ');
        alert(`Validation failed: ${validationErrors}`);
      } else if (error.response?.data?.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert('Failed to add target. Please check the console for details.');
      }
    }
  };

  const handleViewTarget = (targetId) => {
    navigate(`/targets/${targetId}`);
  };

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
          <Typography variant='h4' component='h1'>
            Targets
          </Typography>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add Target
          </Button>
        </Box>
        <Grid container spacing={3}>
          {targets.map((target) => (
            <Grid item xs={12} md={6} lg={4} key={target.id}>
              <Card>
                <CardContent>
                  <Typography variant='h6' gutterBottom>
                    {target.name}
                  </Typography>
                  <Typography variant='body2' color='text.secondary' gutterBottom>
                    {target.url}
                  </Typography>
                  <Typography variant='body2' sx={{ mb: 2 }}>
                    {target.description}
                  </Typography>
                  <Box display='flex' gap={1} mb={2}>
                    <Chip
                      label={target.type}
                      color='primary'
                      size='small'
                    />
                    <Chip
                      label={target.status}
                      color={target.status === 'active' ? 'success' : 'default'}
                      size='small'
                    />
                  </Box>
                  <Box display='flex' justifyContent='space-between'>
                    <Typography variant='caption' color='text.secondary'>
                      Last scan: {target.lastScan}
                    </Typography>
                    <Box>
                      <IconButton
                        size='small'
                        onClick={() => handleViewTarget(target.id)}
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
      {/* Add Target Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>Add New Target</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='Target Name'
            fullWidth
            variant='outlined'
            value={newTarget.name}
            onChange={(e) => setNewTarget({ ...newTarget, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='URL'
            fullWidth
            variant='outlined'
            value={newTarget.url}
            onChange={(e) => setNewTarget({ ...newTarget, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='dense'
            label='Description'
            fullWidth
            multiline
            rows={3}
            variant='outlined'
            value={newTarget.description}
            onChange={(e) => setNewTarget({ ...newTarget, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAddTarget} variant='contained'>Add Target</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Targets;