import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Typography as MuiTypography,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Air as AirIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getUserSettings, updateUserSettings } from '../services/api';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', lat: '', lng: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Settings state
  const [settings, setSettings] = useState({
    aqi_threshold: 100,
    enable_notifications: true,
    notification_frequency: 'daily',
    preferred_units: 'metric',
    theme: 'light',
    language: 'en'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Sample notifications data
  const notifications = [
    {
      id: 1,
      type: 'warning',
      title: 'High AQI Alert',
      message: 'Air quality in Delhi is currently unhealthy (AQI: 156)',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'info',
      title: 'Data Update',
      message: 'New air quality data available for Mumbai',
      time: '4 hours ago'
    },
    {
      id: 3,
      type: 'success',
      title: 'Location Added',
      message: 'Bangalore has been added to your favorites',
      time: '1 day ago'
    }
  ];

  // Load settings when settings dialog opens
  useEffect(() => {
    if (settingsOpen) {
      loadUserSettings();
    }
  }, [settingsOpen]);

  const loadUserSettings = async () => {
    try {
      setSettingsLoading(true);
      const userSettings = await getUserSettings();
      if (userSettings) {
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load settings',
        severity: 'error'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      await updateUserSettings(settings);
      setSnackbar({
        open: true,
        message: 'Settings saved successfully!',
        severity: 'success'
      });
      handleSettingsClose();
    } catch (error) {
      console.error('Error saving settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save settings',
        severity: 'error'
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationsMenu = (event) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchor(null);
  };

  const handleAddLocation = () => {
    setAddLocationOpen(true);
  };

  const handleAddLocationClose = () => {
    setAddLocationOpen(false);
    setNewLocation({ name: '', lat: '', lng: '' });
  };

  const handleAddLocationSubmit = () => {
    if (newLocation.name && newLocation.lat && newLocation.lng) {
      // Here you would typically save to localStorage or send to backend
      setSnackbar({
        open: true,
        message: `Location "${newLocation.name}" added successfully!`,
        severity: 'success'
      });
      handleAddLocationClose();
    } else {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
    }
  };

  const handleSettings = () => {
    setSettingsOpen(true);
    handleClose();
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <Toolbar>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <AirIcon sx={{ color: '#1976d2', mr: 1, fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Air Pollution Monitor
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddLocation}
              sx={{ 
                color: '#1976d2', 
                borderColor: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.04)'
                }
              }}
            >
              Add Location
            </Button>
            
            <IconButton
              size="large"
              aria-label="show notifications"
              color="primary"
              onClick={handleNotificationsMenu}
            >
              <Badge badgeContent={notifications.length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Menu
              anchorEl={notificationsAnchor}
              open={Boolean(notificationsAnchor)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: { width: 350, maxHeight: 400 }
              }}
            >
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Notifications</Typography>
              </Box>
              <List sx={{ p: 0 }}>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem>
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={notification.title}
                        secondary={
                          <Box>
                            <Typography variant="body2">{notification.message}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {notification.time}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Menu>

            <IconButton
              size="large"
              aria-label="settings"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="primary"
            >
              <SettingsIcon />
            </IconButton>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleSettings}>Settings</MenuItem>
              <MenuItem onClick={handleClose}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add Location Dialog */}
      <Dialog open={addLocationOpen} onClose={handleAddLocationClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 1 }} />
            Add New Location
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Location Name"
            fullWidth
            variant="outlined"
            value={newLocation.name}
            onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Latitude"
            type="number"
            fullWidth
            variant="outlined"
            value={newLocation.lat}
            onChange={(e) => setNewLocation({ ...newLocation, lat: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Longitude"
            type="number"
            fullWidth
            variant="outlined"
            value={newLocation.lng}
            onChange={(e) => setNewLocation({ ...newLocation, lng: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddLocationClose}>Cancel</Button>
          <Button onClick={handleAddLocationSubmit} variant="contained">
            Add Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="md" fullWidth>
        <DialogTitle>User Settings</DialogTitle>
        <DialogContent>
          {settingsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <Typography>Loading settings...</Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              {/* AQI Threshold */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>AQI Alert Threshold</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={settings.aqi_threshold}
                    onChange={(e, value) => handleSettingChange('aqi_threshold', value)}
                    min={0}
                    max={500}
                    step={10}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 100, label: '100' },
                      { value: 200, label: '200' },
                      { value: 300, label: '300' },
                      { value: 500, label: '500' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                  <Typography variant="body2" color="text.secondary">
                    You'll receive alerts when AQI exceeds {settings.aqi_threshold}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Notifications */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Notifications</Typography>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={settings.enable_notifications}
                      onChange={(e) => handleSettingChange('enable_notifications', e.target.checked)}
                    />
                  }
                  label="Enable notifications"
                />
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Notification Frequency</InputLabel>
                  <Select
                    value={settings.notification_frequency}
                    onChange={(e) => handleSettingChange('notification_frequency', e.target.value)}
                    label="Notification Frequency"
                  >
                    <MenuItem value="hourly">Hourly</MenuItem>
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Display Settings */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Display</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    label="Theme"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Units</InputLabel>
                  <Select
                    value={settings.preferred_units}
                    onChange={(e) => handleSettingChange('preferred_units', e.target.value)}
                    label="Units"
                  >
                    <MenuItem value="metric">Metric</MenuItem>
                    <MenuItem value="imperial">Imperial</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Language */}
              <Box>
                <Typography variant="h6" gutterBottom>Language</Typography>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    label="Language"
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="ta">Tamil</MenuItem>
                    <MenuItem value="te">Telugu</MenuItem>
                    <MenuItem value="bn">Bengali</MenuItem>
                    <MenuItem value="mr">Marathi</MenuItem>
                    <MenuItem value="gu">Gujarati</MenuItem>
                    <MenuItem value="kn">Kannada</MenuItem>
                    <MenuItem value="ml">Malayalam</MenuItem>
                    <MenuItem value="pa">Punjabi</MenuItem>
                    <MenuItem value="or">Odia</MenuItem>
                    <MenuItem value="as">Assamese</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Cancel</Button>
          <Button 
            onClick={handleSaveSettings} 
            variant="contained"
            disabled={settingsLoading}
          >
            {settingsLoading ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setSnackbar({ ...snackbar, open: false })}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Header; 