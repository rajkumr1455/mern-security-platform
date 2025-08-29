import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Tab,
  Tabs,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider

} from '@mui/material';
import {
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  
} from '@mui/icons-material';
  import {
    Storage as StorageIcon,
  } from '@mui/icons-material';
  import {
    Api as ApiIcon,
  } from '@mui/icons-material';
  import {
    Save as SaveIcon
  } from '@mui/icons-material';

const Settings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    // General Settings
    general: {
      autoScan: true,
      scanTimeout: 3600,
      maxConcurrentScans: 3,
      retainReports: 90,
      enableLogging: true,
      logLevel: 'info'
    },
    // Security Settings
    security: {
      enableRateLimit: true,
      rateLimitWindow: 15,
      rateLimitMax: 100,
      enableAuth: true,
      sessionTimeout: 24,
      enableTwoFactor: false,
      passwordPolicy: 'strong'
    },
    // Notification Settings
    notifications: {
      emailNotifications: true,
      emailAddress: 'admin@example.com',
      slackNotifications: false,
      slackWebhook: '',
      discordNotifications: false,
      discordWebhook: '',
      notifyOnScanComplete: true,
      notifyOnVulnerabilities: true,
      notifyOnErrors: true
    },
    // API Settings
    api: {
      enableApi: true,
      apiRateLimit: 1000,
      enableWebhooks: false,
      webhookUrl: '',
      apiTimeout: 30
    }
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Mock data - in real app, fetch from API
      // logger.info('Settings loaded'); // TODO: Implement client-side logging
    } catch (error) {
      // logger.error('Error fetching settings:', error); // TODO: Implement client-side logging
    }
  };

  const handleSave = async () => {
    try {
      // Save settings via API
      // logger.info('Saving settings:', settings); // TODO: Implement client-side logging
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      // logger.error('Error saving settings:', error); // TODO: Implement client-side logging
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  return (
    <Container maxWidth='lg'>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' component='h1' gutterBottom>
          Settings
        </Typography>
        {saved && (
          <Alert severity='success' sx={{ mb: 3 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label='General' icon={<StorageIcon />} />
              <Tab label='Security' icon={<SecurityIcon />} />
              <Tab label='Notifications' icon={<NotificationsIcon />} />
              <Tab label='API' icon={<ApiIcon />} />
            </Tabs>
          </Box>
          <CardContent>
            {/* General Settings */}
            {tabValue === 0 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  General Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.general.autoScan}
                          onChange={(e) => updateSetting('general', 'autoScan', e.target.checked)}
                        />
                      }
                      label='Enable Auto Scanning'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.general.enableLogging}
                          onChange={(e) => updateSetting('general', 'enableLogging', e.target.checked)}
                        />
                      }
                      label='Enable Logging'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Scan Timeout (seconds)'
                      type='number'
                      value={settings.general.scanTimeout}
                      onChange={(e) => updateSetting('general', 'scanTimeout', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Max Concurrent Scans'
                      type='number'
                      value={settings.general.maxConcurrentScans}
                      onChange={(e) => updateSetting('general', 'maxConcurrentScans', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Retain Reports (days)'
                      type='number'
                      value={settings.general.retainReports}
                      onChange={(e) => updateSetting('general', 'retainReports', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Log Level</InputLabel>
                      <Select
                        value={settings.general.logLevel}
                        label='Log Level'
                        onChange={(e) => updateSetting('general', 'logLevel', e.target.value)}
                      >
                        <MenuItem value='debug'>Debug</MenuItem>
                        <MenuItem value='info'>Info</MenuItem>
                        <MenuItem value='warn'>Warning</MenuItem>
                        <MenuItem value='error'>Error</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Security Settings */}
            {tabValue === 1 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Security Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.enableRateLimit}
                          onChange={(e) => updateSetting('security', 'enableRateLimit', e.target.checked)}
                        />
                      }
                      label='Enable Rate Limiting'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.security.enableTwoFactor}
                          onChange={(e) => updateSetting('security', 'enableTwoFactor', e.target.checked)}
                        />
                      }
                      label='Enable Two-Factor Authentication'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Rate Limit Window (minutes)'
                      type='number'
                      value={settings.security.rateLimitWindow}
                      onChange={(e) => updateSetting('security', 'rateLimitWindow', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Rate Limit Max Requests'
                      type='number'
                      value={settings.security.rateLimitMax}
                      onChange={(e) => updateSetting('security', 'rateLimitMax', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Session Timeout (hours)'
                      type='number'
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Password Policy</InputLabel>
                      <Select
                        value={settings.security.passwordPolicy}
                        label='Password Policy'
                        onChange={(e) => updateSetting('security', 'passwordPolicy', e.target.value)}
                      >
                        <MenuItem value='weak'>Weak (6+ characters)</MenuItem>
                        <MenuItem value='medium'>Medium (8+ characters, mixed case)</MenuItem>
                        <MenuItem value='strong'>Strong (12+ characters, mixed case, numbers, symbols)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Notification Settings */}
            {tabValue === 2 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  Notification Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant='subtitle1' gutterBottom>
                      Email Notifications
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.emailNotifications}
                          onChange={(e) => updateSetting('notifications', 'emailNotifications', e.target.checked)}
                        />
                      }
                      label='Enable Email Notifications'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Email Address'
                      type='email'
                      value={settings.notifications.emailAddress}
                      onChange={(e) => updateSetting('notifications', 'emailAddress', e.target.value)}
                      disabled={!settings.notifications.emailNotifications}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant='subtitle1' gutterBottom>
                      Notification Types
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.notifyOnScanComplete}
                          onChange={(e) => updateSetting('notifications', 'notifyOnScanComplete', e.target.checked)}
                        />
                      }
                      label='Scan Completion'
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.notifyOnVulnerabilities}
                          onChange={(e) => updateSetting('notifications', 'notifyOnVulnerabilities', e.target.checked)}
                        />
                      }
                      label='Vulnerabilities Found'
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.notifications.notifyOnErrors}
                          onChange={(e) => updateSetting('notifications', 'notifyOnErrors', e.target.checked)}
                        />
                      }
                      label='Scan Errors'
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* API Settings */}
            {tabValue === 3 && (
              <Box>
                <Typography variant='h6' gutterBottom>
                  API Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.api.enableApi}
                          onChange={(e) => updateSetting('api', 'enableApi', e.target.checked)}
                        />
                      }
                      label='Enable API Access'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.api.enableWebhooks}
                          onChange={(e) => updateSetting('api', 'enableWebhooks', e.target.checked)}
                        />
                      }
                      label='Enable Webhooks'
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='API Rate Limit (requests/hour)'
                      type='number'
                      value={settings.api.apiRateLimit}
                      onChange={(e) => updateSetting('api', 'apiRateLimit', parseInt(e.target.value))}
                      disabled={!settings.api.enableApi}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='API Timeout (seconds)'
                      type='number'
                      value={settings.api.apiTimeout}
                      onChange={(e) => updateSetting('api', 'apiTimeout', parseInt(e.target.value))}
                      disabled={!settings.api.enableApi}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Webhook URL'
                      value={settings.api.webhookUrl}
                      onChange={(e) => updateSetting('api', 'webhookUrl', e.target.value)}
                      disabled={!settings.api.enableWebhooks}
                      placeholder='https://your-webhook-url.com/endpoint'
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant='contained'
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Settings;