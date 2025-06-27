import React, { useMemo } from 'react';
import type { SensorData } from '../types';

interface StatisticsProps {
  data: SensorData[];
}

interface StatValues {
  avg: string;
  min: string;
  max: string;
}

interface AllStats {
  temperature: StatValues;
  humidity: StatValues;
  airQuality: StatValues;
}

// Statistics Component
export const Statistics: React.FC<StatisticsProps> = ({ data }) => {
  const stats: AllStats | null = useMemo(() => {
    if (data.length === 0) return null;

    const temperatures = data.map(d => d.temperature);
    const humidities = data.map(d => d.humidity);
    const airQualities = data.map(d => d.airQuality);

    return {
      temperature: {
        avg: (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(1),
        min: Math.min(...temperatures).toFixed(1),
        max: Math.max(...temperatures).toFixed(1),
      },
      humidity: {
        avg: (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1),
        min: Math.min(...humidities).toFixed(1),
        max: Math.max(...humidities).toFixed(1),
      },
      airQuality: {
        avg: (airQualities.reduce((a, b) => a + b, 0) / airQualities.length).toFixed(1),
        min: Math.min(...airQualities).toFixed(1),
        max: Math.max(...airQualities).toFixed(1),
      },
    };
  }, [data]);

  if (!stats) return null;

  return (
    <div className="statistics">
      <h3>Current Statistics ({data.length} sensors)</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Temperature (°C)</h4>
          <p>Avg: {stats.temperature.avg}</p>
          <p>Range: {stats.temperature.min} - {stats.temperature.max}</p>
        </div>
        <div className="stat-card">
          <h4>Humidity (%)</h4>
          <p>Avg: {stats.humidity.avg}</p>
          <p>Range: {stats.humidity.min} - {stats.humidity.max}</p>
        </div>
        <div className="stat-card">
          <h4>Air Quality (AQI)</h4>
          <p>Avg: {stats.airQuality.avg}</p>
          <p>Range: {stats.airQuality.min} - {stats.airQuality.max}</p>
        </div>
      </div>
    </div>
  );
}; 