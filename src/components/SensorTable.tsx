import React from 'react';
import type { SensorData, SortConfig, AirQualityInfo } from '../types';

interface SensorTableProps {
  data: SensorData[];
  sortConfig: SortConfig;
  onSort: (key: keyof SensorData) => void;
}

// Sensor Table Component
export const SensorTable: React.FC<SensorTableProps> = ({ 
  data, 
  sortConfig, 
  onSort 
}) => {
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAirQualityLevel = (aqi: number): AirQualityInfo => {
    if (aqi <= 50) return { level: 'Good', className: 'aqi-good' };
    if (aqi <= 100) return { level: 'Moderate', className: 'aqi-moderate' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive', className: 'aqi-sensitive' };
    if (aqi <= 200) return { level: 'Unhealthy', className: 'aqi-unhealthy' };
    return { level: 'Very Unhealthy', className: 'aqi-very-unhealthy' };
  };

  const getSortIcon = (columnKey: keyof SensorData) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (data.length === 0) {
    return (
      <div className="no-data">
        <p>No sensor data available. Waiting for real-time updates...</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="sensor-table">
        <thead>
          <tr>
            <th onClick={() => onSort('sensorId')}>
              Sensor ID {getSortIcon('sensorId')}
            </th>
            <th onClick={() => onSort('timestamp')}>
              Timestamp {getSortIcon('timestamp')}
            </th>
            <th onClick={() => onSort('temperature')}>
              Temperature (°C) {getSortIcon('temperature')}
            </th>
            <th onClick={() => onSort('humidity')}>
              Humidity (%) {getSortIcon('humidity')}
            </th>
            <th onClick={() => onSort('airQuality')}>
              Air Quality (AQI) {getSortIcon('airQuality')}
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((sensor, index) => {
            const aqiInfo = getAirQualityLevel(sensor.airQuality);
            return (
              <tr key={`${sensor.sensorId}-${sensor.timestamp}-${index}`}>
                <td className="sensor-id">{sensor.sensorId}</td>
                <td className="timestamp">{formatTimestamp(sensor.timestamp)}</td>
                <td className="temperature">{sensor.temperature}°C</td>
                <td className="humidity">{sensor.humidity}%</td>
                <td className={`air-quality ${aqiInfo.className}`}>
                  {sensor.airQuality} ({aqiInfo.level})
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}; 