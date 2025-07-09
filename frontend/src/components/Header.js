import React, { useState } from 'react';
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

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [addLocationOpen, setAddLocationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newLocation, setNewLocation] = useState({ name: '', lat: '', lng: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
      <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Notifications</Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Enable push notifications"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="AQI alerts"
            />
            <FormControlLabel
              control={<Switch />}
              label="Daily air quality reports"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Display</Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Dark mode"
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Show AQI on map"
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="h6" gutterBottom>Data</Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Auto-refresh data"
            />
            <FormControlLabel
              control={<Switch />}
              label="Save search history"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsClose}>Close</Button>
          <Button onClick={handleSettingsClose} variant="contained">
            Save Settings
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