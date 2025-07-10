import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Paper,
  TextField,
  Autocomplete,
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { searchLocations } from '../services/api';

const LocationSearch = ({ selectedLocation, onLocationChange }) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Popular cities for quick access
  const popularCities = useMemo(() => [
    { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
    { name: 'Delhi, India', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai, India', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore, India', lat: 12.9716, lng: 77.5946 },
    { name: 'Chennai, India', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata, India', lat: 22.5726, lng: 88.3639 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
  ], []);

  // Search cities when input changes
  useEffect(() => {
    const searchCities = async () => {
      if (searchValue.length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await searchLocations(searchValue);
        setSearchResults(results || []);
      } catch (err) {
        console.error('Error searching cities:', err);
        setError('Failed to search cities. Please try again.');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchCities, 300);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const handleLocationSelect = useCallback((event, newValue) => {
    if (newValue) {
      onLocationChange(newValue);
      setSearchValue('');
      setInputValue(newValue.name);
      setSearchResults([]);
    }
  }, [onLocationChange]);

  const handleInputChange = useCallback((event, newInputValue) => {
    setInputValue(newInputValue);
    setSearchValue(newInputValue);
  }, []);

  const handleCurrentLocation = useCallback(() => {
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
          setInputValue(newLocation.name);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Failed to get current location. Please check your browser permissions.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  }, [onLocationChange]);

  const handleCityClick = useCallback((city) => {
    onLocationChange(city);
    setInputValue(city.name);
  }, [onLocationChange]);

  // Combine search results with popular cities
  const allOptions = useMemo(() => [...popularCities, ...searchResults], [popularCities, searchResults]);

  return (
    <Paper sx={{ p: 2, height: 'fit-content' }}>
      <Typography variant="h6" gutterBottom>
        Search Location
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Autocomplete
        value={selectedLocation.name ? selectedLocation : null}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleLocationSelect}
        options={allOptions}
        getOptionLabel={(option) => option.name}
        loading={loading}
        filterOptions={(x) => x} // Disable built-in filtering since we're using API
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter city name"
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
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
        Popular Cities
      </Typography>
      
      <Box display="flex" flexWrap="wrap" gap={1}>
        {popularCities.slice(0, 6).map((city) => (
          <Chip
            key={city.name}
            label={city.name}
            size="small"
            onClick={() => handleCityClick(city)}
            variant={selectedLocation.name === city.name ? 'filled' : 'outlined'}
            color={selectedLocation.name === city.name ? 'primary' : 'default'}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default LocationSearch; 