import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { format, subDays } from 'date-fns';

const HistoricalChart = ({ location }) => {
  // Generate mock historical data for 7 days
  const generateHistoricalData = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MMM dd'),
        aqi: Math.floor(Math.random() * 150) + 30,
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 15,
        o3: Math.floor(Math.random() * 60) + 20,
      };
    });
  };

  const data = generateHistoricalData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="aqi"
            stroke="#8884d8"
            strokeWidth={3}
            name="AQI"
            dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pm25"
            stroke="#82ca9d"
            strokeWidth={2}
            name="PM2.5"
            dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="pm10"
            stroke="#ffc658"
            strokeWidth={2}
            name="PM10"
            dot={{ fill: '#ffc658', strokeWidth: 2, r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="o3"
            stroke="#ff7300"
            strokeWidth={2}
            name="O₃"
            dot={{ fill: '#ff7300', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default HistoricalChart; 