import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { fetchIndianCities } from '../services/api';

const IndianCitiesBrowser = ({ onCitySelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [expandedStates, setExpandedStates] = useState([]);

  // Fetch Indian cities
  const { data: citiesData, isLoading, error } = useQuery({
    queryKey: ['indian-cities', selectedState, searchTerm],
    queryFn: () => fetchIndianCities(selectedState || null, searchTerm || null),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get unique states for filter dropdown
  const states = React.useMemo(() => {
    if (!citiesData?.cities) return [];
    const uniqueStates = [...new Set(citiesData.cities.map(city => city.state))];
    return uniqueStates.sort();
  }, [citiesData]);

  // Group cities by state
  const citiesByState = React.useMemo(() => {
    if (!citiesData?.cities) return {};
    
    return citiesData.cities.reduce((acc, city) => {
      if (!acc[city.state]) {
        acc[city.state] = [];
      }
      acc[city.state].push(city);
      return acc;
    }, {});
  }, [citiesData]);

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
  };

  const handleStateExpand = (state) => {
    setExpandedStates(prev => 
      prev.includes(state) 
        ? prev.filter(s => s !== state)
        : [...prev, state]
    );
  };

  const handleCityClick = (city) => {
    if (onCitySelect) {
      onCitySelect(city);
    }
  };



  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading Indian cities: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Indian Cities Air Quality
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse and search through {citiesData?.total_count || 0} Indian districts and towns to check their air quality.
      </Typography>

      {/* Search and Filter Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search cities"
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                placeholder="Enter city name..."
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter by State</InputLabel>
                <Select
                  value={selectedState}
                  label="Filter by State"
                  onChange={handleStateChange}
                >
                  <MenuItem value="">All States</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box display="flex" gap={1}>
                <Tooltip title="Clear all filters">
                  <IconButton 
                    onClick={clearFilters}
                    disabled={!searchTerm && !selectedState}
                    color="primary"
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
                
                <Chip 
                  label={`${citiesData?.total_count || 0} cities`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Cities by State */}
      {Object.keys(citiesByState).length > 0 ? (
        <Box>
          {Object.entries(citiesByState).map(([state, cities]) => (
            <Accordion 
              key={state}
              expanded={expandedStates.includes(state)}
              onChange={() => handleStateExpand(state)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography variant="h6">{state}</Typography>
                  <Chip 
                    label={`${cities.length} cities`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <List dense>
                  {cities.map((city, index) => (
                    <React.Fragment key={city.name}>
                      <ListItem disablePadding>
                        <ListItemButton onClick={() => handleCityClick(city)}>
                          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                          <ListItemText
                            primary={city.name}
                            secondary={`${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}`}
                          />
                          <Chip
                            label={city.type}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        </ListItemButton>
                      </ListItem>
                      {index < cities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          No cities found matching your search criteria.
        </Alert>
      )}

      {/* Usage Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to use:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Use the search box to find specific cities by name
            • Use the state filter to view cities from a particular state
            • Click on any city to view its current air quality data
            • Expand state sections to see all cities in that state
            • The platform will fetch real-time air quality data from OpenAQ API when available
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IndianCitiesBrowser; 