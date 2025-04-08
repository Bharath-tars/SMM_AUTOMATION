import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button, Divider, Alert, Snackbar, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { LinkedIn, Notifications, Schedule, Autorenew, Delete, Save, Add, Link as LinkIcon } from '@mui/icons-material';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      performance: true,
      recommendations: true,
    },
    aiOptimization: {
      enabled: true,
      autoReschedule: true,
      contentRecycling: true,
      learningRate: 'medium',
    },
    linkedInAccounts: [
      {
        id: 1,
        name: 'John Doe',
        type: 'Personal',
        connected: true,
        lastSync: '2023-09-10T14:30:00',
      },
    ],
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Handle notification settings change
  const handleNotificationChange = (event) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [event.target.name]: event.target.checked,
      },
    });
  };

  // Handle AI optimization settings change
  const handleAIOptimizationChange = (event) => {
    setSettings({
      ...settings,
      aiOptimization: {
        ...settings.aiOptimization,
        [event.target.name]: event.target.checked,
      },
    });
  };

  // Handle learning rate change
  const handleLearningRateChange = (event) => {
    setSettings({
      ...settings,
      aiOptimization: {
        ...settings.aiOptimization,
        learningRate: event.target.value,
      },
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to a backend service
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  // Handle connect LinkedIn account
  const handleConnectLinkedIn = async () => {
    try {
      // Import LinkedIn service
      const linkedinService = await import('../services/linkedinService').then(module => module.default);
      
      // Get LinkedIn authorization URL
      const authUrl = await linkedinService.getAuthUrl();
      
      // Redirect to LinkedIn authorization page
      window.location.href = authUrl;
    } catch (error) {
      console.error('Failed to connect LinkedIn account:', error);
      
      setSnackbar({
        open: true,
        message: 'Failed to connect LinkedIn account. Please try again.',
        severity: 'error',
      });
    }
  };

  // Handle disconnect LinkedIn account
  const handleDisconnectLinkedIn = (id) => {
    setSettings({
      ...settings,
      linkedInAccounts: settings.linkedInAccounts.filter(account => account.id !== id),
    });

    setSnackbar({
      open: true,
      message: 'LinkedIn account disconnected successfully!',
      severity: 'info',
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 500, mb: 3 }}>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* LinkedIn Account Integration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LinkedIn sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">LinkedIn Account Integration</Typography>
            </Box>
            
            <List>
              {settings.linkedInAccounts.map((account) => (
                <ListItem key={account.id} sx={{ bgcolor: 'rgba(0, 119, 181, 0.05)', borderRadius: 1, mb: 1 }}>
                  <ListItemIcon>
                    <LinkedIn sx={{ color: '#0077b5' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={account.name}
                    secondary={`${account.type} • Last synced: ${new Date(account.lastSync).toLocaleString()}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleDisconnectLinkedIn(account.id)}>
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleConnectLinkedIn}
              sx={{ mt: 2 }}
            >
              Connect LinkedIn Account
            </Button>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Notifications sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">Notification Settings</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.email}
                  onChange={handleNotificationChange}
                  name="email"
                  color="primary"
                />
              }
              label="Email Notifications"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.browser}
                  onChange={handleNotificationChange}
                  name="browser"
                  color="primary"
                />
              }
              label="Browser Notifications"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Notification Types
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.performance}
                  onChange={handleNotificationChange}
                  name="performance"
                  color="primary"
                />
              }
              label="Post Performance Alerts"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications.recommendations}
                  onChange={handleNotificationChange}
                  name="recommendations"
                  color="primary"
                />
              }
              label="AI Recommendations"
              sx={{ display: 'block' }}
            />
          </Paper>
        </Grid>

        {/* AI Optimization Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Autorenew sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">AI Optimization Settings</Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiOptimization.enabled}
                  onChange={handleAIOptimizationChange}
                  name="enabled"
                  color="primary"
                />
              }
              label="Enable AI Optimization"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiOptimization.autoReschedule}
                  onChange={handleAIOptimizationChange}
                  name="autoReschedule"
                  color="primary"
                  disabled={!settings.aiOptimization.enabled}
                />
              }
              label="Auto-Reschedule Underperforming Posts"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.aiOptimization.contentRecycling}
                  onChange={handleAIOptimizationChange}
                  name="contentRecycling"
                  color="primary"
                  disabled={!settings.aiOptimization.enabled}
                />
              }
              label="Evergreen Content Recycling"
              sx={{ display: 'block', mb: 2 }}
            />
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              AI Learning Rate
            </Typography>
            
            <TextField
              select
              fullWidth
              value={settings.aiOptimization.learningRate}
              onChange={handleLearningRateChange}
              disabled={!settings.aiOptimization.enabled}
              SelectProps={{
                native: true,
              }}
              sx={{ mb: 2 }}
            >
              <option value="slow">Slow - Conservative changes</option>
              <option value="medium">Medium - Balanced approach</option>
              <option value="fast">Fast - Aggressive optimization</option>
            </TextField>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              A faster learning rate will adapt quickly to new data but may be more volatile. A slower rate provides more stable recommendations.
            </Alert>
          </Paper>
        </Grid>

        {/* Schedule Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Schedule sx={{ color: '#0077b5', mr: 1 }} />
              <Typography variant="h6">Default Scheduling Settings</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Best Times to Post (Based on AI Analysis)
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={1}>
                      {[
                        { day: 'Monday', time: '10:00 AM' },
                        { day: 'Tuesday', time: '9:00 AM' },
                        { day: 'Wednesday', time: '2:00 PM' },
                        { day: 'Thursday', time: '10:00 AM' },
                        { day: 'Friday', time: '11:00 AM' },
                      ].map((slot, index) => (
                        <Grid item xs={6} key={index}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinkIcon fontSize="small" sx={{ color: '#0077b5', mr: 1 }} />
                            <Typography variant="body2">
                              <strong>{slot.day}:</strong> {slot.time}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Evergreen Content Recycling Defaults
                </Typography>
                
                <TextField
                  select
                  fullWidth
                  label="Default Recycling Frequency"
                  value="monthly"
                  SelectProps={{
                    native: true,
                  }}
                  sx={{ mb: 2 }}
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </TextField>
                
                <FormControlLabel
                  control={<Switch defaultChecked color="primary" />}
                  label="Only Recycle High-Performing Content"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Save />}
              onClick={handleSaveSettings}
              size="large"
            >
              Save Settings
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;