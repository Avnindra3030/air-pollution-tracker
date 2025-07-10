import React, { useState, useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Alert,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import AirQualityCard from '../components/AirQualityCard';
import AirQualityMap from '../components/AirQualityMap';
import ForecastChart from '../components/ForecastChart';
import HistoricalChart from '../components/HistoricalChart';
import LocationSearch from '../components/LocationSearch';
import IndianCitiesBrowser from '../components/IndianCitiesBrowser';
import { fetchAirQualityData, fetchForecastData } from '../services/api';

// Tab Panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    lat: 40.7128,
    lng: -74.0060,
    name: 'New York, NY'
  });
  
  const [activeTab, setActiveTab] = useState(0);

  const { data: airQualityData, isLoading: aqiLoading, error: aqiError } = useQuery({
    queryKey: ['airQuality', selectedLocation.lat, selectedLocation.lng],
    queryFn: () => fetchAirQualityData(selectedLocation.lat, selectedLocation.lng),
    refetchInterval: 300000, // Refetch every 5 minutes
  });

  const { data: forecastData, isLoading: forecastLoading } = useQuery({
    queryKey: ['forecast', selectedLocation.lat, selectedLocation.lng],
    queryFn: () => fetchForecastData(selectedLocation.lat, selectedLocation.lng),
    refetchInterval: 900000, // Refetch every 15 minutes
  });

  const getAQICategory = useCallback((aqi) => {
    if (aqi <= 50) return { label: 'Good', color: '#009966', severity: 'success' };
    if (aqi <= 100) return { label: 'Moderate', color: '#ffde33', severity: 'warning' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#ff9933', severity: 'warning' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#cc0033', severity: 'error' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#660099', severity: 'error' };
    return { label: 'Hazardous', color: '#7e0023', severity: 'error' };
  }, []);

  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  const handleLocationChange = useCallback((newLocation) => {
    setSelectedLocation(newLocation);
  }, []);

  const handleIndianCitySelect = useCallback((city) => {
    setSelectedLocation({
      lat: city.lat,
      lng: city.lng,
      name: `${city.name}, ${city.state}`
    });
    setActiveTab(0); // Switch to main dashboard
  }, []);

  const handleGlobalCitySelect = useCallback((city) => {
    setSelectedLocation(city);
    setActiveTab(0);
  }, []);

  // Memoize popular cities to prevent re-creation
  const popularGlobalCities = useMemo(() => [
    { name: 'New York, USA', lat: 40.7128, lng: -74.0060 },
    { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
    { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
    { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
    { name: 'Beijing, China', lat: 39.9042, lng: 116.4074 },
    { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
    { name: 'Toronto, Canada', lat: 43.6532, lng: -79.3832 },
    { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
  ], []);

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      {/* Header Section */}
      <Grid item xs={12} sx={{ mb: 3 }}>
        <Paper sx={{ p: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Air Quality Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Real-time monitoring and AI-powered forecasting for {selectedLocation.name}
          </Typography>
        </Paper>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Main Dashboard" />
          <Tab label="Indian Cities" />
          <Tab label="Global Cities" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          {/* Location Search */}
          <Grid item xs={12} md={4}>
            <LocationSearch
              selectedLocation={selectedLocation}
              onLocationChange={handleLocationChange}
            />
          </Grid>

          {/* Current Air Quality */}
          <Grid item xs={12} md={8}>
            <AirQualityCard
              data={airQualityData}
              loading={aqiLoading}
              error={aqiError}
              location={selectedLocation}
            />
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                Air Quality Map
              </Typography>
              <AirQualityMap
                center={[selectedLocation.lat, selectedLocation.lng]}
                airQualityData={airQualityData}
              />
            </Paper>
          </Grid>

          {/* Forecast */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: 400 }}>
              <Typography variant="h6" gutterBottom>
                24-Hour Forecast
              </Typography>
              <ForecastChart
                data={forecastData}
                loading={forecastLoading}
              />
            </Paper>
          </Grid>

          {/* Historical Data */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>
                7-Day Historical Trend
              </Typography>
              <HistoricalChart location={selectedLocation} />
            </Paper>
          </Grid>

          {/* Alerts */}
          {airQualityData && airQualityData.aqi > 100 && (
            <Grid item xs={12}>
              <Alert severity={getAQICategory(airQualityData.aqi).severity} sx={{ mb: 2 }}>
                <Typography variant="h6">
                  Air Quality Alert for {selectedLocation.name}
                </Typography>
                <Typography>
                  Current AQI: {airQualityData.aqi} - {getAQICategory(airQualityData.aqi).label}
                </Typography>
              </Alert>
            </Grid>
          )}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <IndianCitiesBrowser onCitySelect={handleIndianCitySelect} />
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Global Cities
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Use the location search in the Main Dashboard to explore air quality data for cities worldwide.
            The platform supports real-time data from OpenAQ API for global coverage.
          </Typography>
          
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="h6">Global Coverage</Typography>
            <Typography>
              Our platform integrates with OpenAQ API to provide air quality data for cities worldwide.
              Simply use the location search feature to find any city and view its current air quality metrics.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Popular Global Cities:
          </Typography>
          <Grid container spacing={2}>
            {popularGlobalCities.map((city) => (
              <Grid item xs={12} sm={6} md={3} key={city.name}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                  onClick={() => handleGlobalCitySelect(city)}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {city.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to view air quality
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </TabPanel>
    </Container>
  );
};

export default Dashboard; 