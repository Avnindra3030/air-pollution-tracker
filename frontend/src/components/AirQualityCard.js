import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Chip,
  Alert,
} from '@mui/material';
import {
  Air as AirIcon,
  Visibility as VisibilityIcon,
  Thermostat as ThermostatIcon,
  Opacity as OpacityIcon,
} from '@mui/icons-material';

const AirQualityCard = ({ data, loading, error, location }) => {
  const getAQICategory = (aqi) => {
    if (aqi <= 50) return { label: 'Good', color: '#009966', severity: 'success' };
    if (aqi <= 100) return { label: 'Moderate', color: '#ffde33', severity: 'warning' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#ff9933', severity: 'warning' };
    if (aqi <= 200) return { label: 'Unhealthy', color: '#cc0033', severity: 'error' };
    if (aqi <= 300) return { label: 'Very Unhealthy', color: '#660099', severity: 'error' };
    return { label: 'Hazardous', color: '#7e0023', severity: 'error' };
  };

  const getHealthAdvice = (aqi) => {
    if (aqi <= 50) return "Air quality is considered satisfactory, and air pollution poses little or no risk.";
    if (aqi <= 100) return "Air quality is acceptable; however, some pollutants may be a concern for a small number of people.";
    if (aqi <= 150) return "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
    if (aqi <= 200) return "Everyone may begin to experience health effects; members of sensitive groups may experience more serious effects.";
    if (aqi <= 300) return "Health warnings of emergency conditions. The entire population is more likely to be affected.";
    return "Health alert: everyone may experience more serious health effects.";
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Alert severity="error">
            Failed to load air quality data. Please try again later.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const aqiCategory = getAQICategory(data.aqi);

  return (
    <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="text.secondary">
            Current Air Quality
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {location.name}
          </Typography>
        </Box>

        {/* Main AQI Display */}
        <Box textAlign="center" mb={3}>
          <Typography variant="h2" sx={{ color: aqiCategory.color, fontWeight: 'bold' }}>
            {data.aqi}
          </Typography>
          <Chip
            label={aqiCategory.label}
            sx={{
              backgroundColor: aqiCategory.color,
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1rem',
              padding: '8px 16px',
            }}
          />
        </Box>

        {/* Pollutant Details */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <AirIcon sx={{ color: '#666', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                PM2.5
              </Typography>
              <Typography variant="h6">
                {data.pm25 || 'N/A'} µg/m³
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <VisibilityIcon sx={{ color: '#666', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                PM10
              </Typography>
              <Typography variant="h6">
                {data.pm10 || 'N/A'} µg/m³
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <OpacityIcon sx={{ color: '#666', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                O₃
              </Typography>
              <Typography variant="h6">
                {data.o3 || 'N/A'} ppb
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box textAlign="center">
              <ThermostatIcon sx={{ color: '#666', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                NO₂
              </Typography>
              <Typography variant="h6">
                {data.no2 || 'N/A'} ppb
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Health Advice */}
        <Alert severity={aqiCategory.severity} sx={{ mt: 2 }}>
          <Typography variant="body2">
            {getHealthAdvice(data.aqi)}
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AirQualityCard; 