import React from 'react';
import {
  Paper,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';

const LocationSearch = ({ selectedLocation, onLocationChange }) => {
  // const [searchValue, setSearchValue] = useState(''); // unused

  // Mock cities data - in a real app, this would come from an API
  const cities = [
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia, PA', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio, TX', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego, CA', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose, CA', lat: 37.3382, lng: -121.8863 },
    { name: 'Austin, TX', lat: 30.2672, lng: -97.7431 },
    { name: 'Jacksonville, FL', lat: 30.3322, lng: -81.6557 },
    { name: 'Fort Worth, TX', lat: 32.7555, lng: -97.3308 },
    { name: 'Columbus, OH', lat: 39.9612, lng: -82.9988 },
    { name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 },
    { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
    { name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581 },
    { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
    { name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
    { name: 'Delhi, India', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 },
    { name: 'Hyderabad, India', lat: 17.3850, lng: 78.4867 },
    { name: 'Ahmedabad, India', lat: 23.0225, lng: 72.5714 },
    { name: 'Pune, India', lat: 18.5204, lng: 73.8567 },
    { name: 'Jaipur, India', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow, India', lat: 26.8467, lng: 80.9462 },
  ];

  const handleLocationSelect = (event, newValue) => {
    if (newValue) {
      onLocationChange(newValue);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, you would reverse geocode to get the city name
          const newLocation = {
            name: `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            lat: latitude,
            lng: longitude,
          };
          onLocationChange(newLocation);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Handle error - maybe show a snackbar
        }
      );
    }
  };

  return (
    <Paper sx={{ p: 2, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        Search Location
      </Typography>
      
      <Autocomplete
        value={cities.find(city => city.name === selectedLocation.name) || null}
        onChange={handleLocationSelect}
        options={cities}
        getOptionLabel={(option) => option.name}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter city name"
            variant="outlined"
            size="small"
            fullWidth
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
            {option.name}
          </Box>
        )}
        sx={{ mb: 2 }}
      />

      <Button
        variant="outlined"
        startIcon={<LocationIcon />}
        onClick={handleCurrentLocation}
        fullWidth
        sx={{ mb: 2 }}
      >
        Use Current Location
      </Button>

      <Typography variant="subtitle2" gutterBottom>
        Recent Locations
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1}>
        {cities.slice(0, 5).map((city) => (
          <Chip
            key={city.name}
            label={city.name}
            size="small"
            onClick={() => onLocationChange(city)}
            variant={selectedLocation.name === city.name ? 'filled' : 'outlined'}
            color={selectedLocation.name === city.name ? 'primary' : 'default'}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default LocationSearch; 