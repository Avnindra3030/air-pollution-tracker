import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Chip } from '@mui/material';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AirQualityMap = ({ center, airQualityData }) => {
  const mapRef = useRef();

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, 12);
    }
  }, [center]);

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

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {airQualityData && (
          <Marker position={center}>
            <Popup>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Air Quality Index
                </Typography>
                <Typography variant="h4" sx={{ color: getAQIColor(airQualityData.aqi), fontWeight: 'bold' }}>
                  {airQualityData.aqi}
                </Typography>
                <Chip
                  label={getAQICategory(airQualityData.aqi)}
                  sx={{
                    backgroundColor: getAQIColor(airQualityData.aqi),
                    color: 'white',
                    fontWeight: 'bold',
                    mt: 1,
                  }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  PM2.5: {airQualityData.pm25 || 'N/A'} µg/m³
                </Typography>
                <Typography variant="body2">
                  PM10: {airQualityData.pm10 || 'N/A'} µg/m³
                </Typography>
                <Typography variant="body2">
                  O₃: {airQualityData.o3 || 'N/A'} ppb
                </Typography>
                <Typography variant="body2">
                  NO₂: {airQualityData.no2 || 'N/A'} ppb
                </Typography>
              </Box>
            </Popup>
          </Marker>
        )}

        {/* Add a circle around the marker to show the monitoring area */}
        {airQualityData && (
          <Circle
            center={center}
            radius={5000} // 5km radius
            pathOptions={{
              color: getAQIColor(airQualityData.aqi),
              fillColor: getAQIColor(airQualityData.aqi),
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </Box>
  );
};

export default AirQualityMap; 