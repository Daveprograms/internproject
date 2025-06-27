import React, { useState, useCallback, useMemo, useSyncExternalStore } from 'react';
import './App.css';

// Import types
import type { FilterState, SortConfig, SensorData } from './types';

// Import components
import { ErrorBoundary, FilterControls, SensorTable, Statistics } from './components';

// Import utilities
import { sensorStore } from './utils';

// Main App Component
const App: React.FC = () => {
  // Use useSyncExternalStore to subscribe to the sensor data
  const storeSnapshot = useSyncExternalStore(
    sensorStore.subscribe,
    sensorStore.getSnapshot,
    // Server snapshot (for SSR) - return empty state
    () => ({ data: [], isConnected: false, error: null })
  );

  const { data: sensorData, isConnected, error } = storeSnapshot;

  const [filters, setFilters] = useState<FilterState>({
    temperatureMin: 0,
    temperatureMax: 0,
    humidityMin: 0,
    humidityMax: 0,
    airQualityMin: 0,
    airQualityMax: 0,
  });
  
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'timestamp',
    direction: 'desc',
  });

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = sensorData;

    // Apply filters
    if (filters.temperatureMin > 0 || filters.temperatureMax > 0) {
      filtered = filtered.filter(sensor => {
        const temp = sensor.temperature;
        const minCheck = filters.temperatureMin === 0 || temp >= filters.temperatureMin;
        const maxCheck = filters.temperatureMax === 0 || temp <= filters.temperatureMax;
        return minCheck && maxCheck;
      });
    }

    if (filters.humidityMin > 0 || filters.humidityMax > 0) {
      filtered = filtered.filter(sensor => {
        const humidity = sensor.humidity;
        const minCheck = filters.humidityMin === 0 || humidity >= filters.humidityMin;
        const maxCheck = filters.humidityMax === 0 || humidity <= filters.humidityMax;
        return minCheck && maxCheck;
      });
    }

    if (filters.airQualityMin > 0 || filters.airQualityMax > 0) {
      filtered = filtered.filter(sensor => {
        const aqi = sensor.airQuality;
        const minCheck = filters.airQualityMin === 0 || aqi >= filters.airQualityMin;
        const maxCheck = filters.airQualityMax === 0 || aqi <= filters.airQualityMax;
        return minCheck && maxCheck;
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];
        
        if (sortConfig.key === 'timestamp') {
          const aTime = new Date(aVal as string).getTime();
          const bTime = new Date(bVal as string).getTime();
          return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
        }
        
        const aStr = String(aVal);
        const bStr = String(bVal);
        return sortConfig.direction === 'asc' 
          ? aStr.localeCompare(bStr) 
          : bStr.localeCompare(aStr);
      });
    }

    return filtered;
  }, [sensorData, filters, sortConfig]);

  const handleSort = useCallback((key: keyof SensorData) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);

  const handleFilterReset = useCallback(() => {
    setFilters({
      temperatureMin: 0,
      temperatureMax: 0,
      humidityMin: 0,
      humidityMax: 0,
      airQualityMin: 0,
      airQualityMax: 0,
    });
  }, []);

  if (error) {
    return (
      <div className="app error-state">
        <div className="error-container">
          <h2>⚠️ Dashboard Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reload Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🌿 Greenhouse Sensor Dashboard</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="data-count">
              {sensorData.length} total readings
            </span>
          </div>
        </header>

        <main className="app-main">
          <Statistics data={filteredAndSortedData} />
          
          <FilterControls
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleFilterReset}
          />

          <div className="table-section">
            <h2>Real-time Sensor Data</h2>
            <p className="table-description">
              Showing {filteredAndSortedData.length} readings, sorted by {sortConfig.key || 'timestamp'} ({sortConfig.direction})
            </p>
            <SensorTable
              data={filteredAndSortedData}
              sortConfig={sortConfig}
              onSort={handleSort}
            />
          </div>
        </main>

        <footer className="app-footer">
          <p>Real-time greenhouse monitoring system • Updates every 2 seconds</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
