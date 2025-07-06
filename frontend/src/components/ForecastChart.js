import React from 'react';
import {
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { format, addHours } from 'date-fns';

const ForecastChart = ({ data, loading }) => {
  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#009966';
    if (aqi <= 100) return '#ffde33';
    if (aqi <= 150) return '#ff9933';
    if (aqi <= 200) return '#cc0033';
    if (aqi <= 300) return '#660099';
    return '#7e0023';
  };

  const getAQICategory = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const aqi = payload[0].value;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {label}
          </Typography>
          <Typography variant="body2" sx={{ color: getAQIColor(aqi) }}>
            AQI: {aqi}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {getAQICategory(aqi)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !data.forecast) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Alert severity="info">
          No forecast data available
        </Alert>
      </Box>
    );
  }

  // Generate 24-hour forecast data
  const forecastData = Array.from({ length: 24 }, (_, i) => {
    const hour = addHours(new Date(), i);
    const aqi = data.forecast[i] || Math.floor(Math.random() * 100) + 20; // Fallback data
    return {
      time: format(hour, 'HH:mm'),
      aqi: aqi,
      category: getAQICategory(aqi),
    };
  });

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={forecastData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 300]}
            tick={{ fontSize: 12 }}
            label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="aqi"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#aqiGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <Box display="flex" justifyContent="center" mt={1} gap={1}>
        <Typography variant="caption" sx={{ color: '#009966' }}>Good</Typography>
        <Typography variant="caption" sx={{ color: '#ffde33' }}>Moderate</Typography>
        <Typography variant="caption" sx={{ color: '#ff9933' }}>Unhealthy</Typography>
        <Typography variant="caption" sx={{ color: '#cc0033' }}>Very Unhealthy</Typography>
      </Box>
    </Box>
  );
};

export default ForecastChart; 