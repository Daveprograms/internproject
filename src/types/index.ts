// Types and Interfaces for the Greenhouse Sensor Dashboard

export interface SensorData {
  sensorId: string;
  timestamp: string;
  airQuality: number;
  temperature: number;
  humidity: number;
}

export interface FilterState {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  airQualityMin: number;
  airQualityMax: number;
}

export interface SortConfig {
  key: keyof SensorData | null;
  direction: 'asc' | 'desc';
}

export interface StoreSnapshot {
  data: SensorData[];
  isConnected: boolean;
  error: string | null;
}

export interface AirQualityInfo {
  level: string;
  className: string;
} 