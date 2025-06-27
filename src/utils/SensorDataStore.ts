import type { SensorData, StoreSnapshot } from '../types';
import { performanceMonitor } from './PerformanceMonitor';

// External Store for Sensor Data
export class SensorDataStore {
  private data: SensorData[] = [];
  private listeners = new Set<() => void>();
  private intervalId: number | null = null;
  private isConnected = false;
  private error: string | null = null;
  private cachedSnapshot: StoreSnapshot | null = null;

  constructor() {
    this.startSimulation();
  }

  // Generate sensor data (based on provided starter code)
  private generateMetrics = (sensorId: string): SensorData => ({
    sensorId: sensorId,
    timestamp: new Date().toISOString(),
    airQuality: +(Math.random() * 200).toFixed(2), // 0-200 AQI
    temperature: +(10 + Math.random() * 30).toFixed(2), // 10-40°C
    humidity: +(30 + Math.random() * 60).toFixed(2), // 30-90% RH
  });

  private startSimulation = () => {
    try {
      this.intervalId = setInterval(() => {
        try {
          const updates = performanceMonitor.measureDataProcessing(
            () => Array.from({ length: 5 }, (_, i) =>
              this.generateMetrics(`Sensor-${i + 1}`)
            ),
            'processing'
          );
          
          // Keep only the latest 1000 records for performance
          this.data = [...updates, ...this.data].slice(0, 1000);
          this.isConnected = true;
          this.error = null;
          
          // Track data update for performance monitoring
          performanceMonitor.trackDataUpdate();
          
          // Invalidate cached snapshot
          this.cachedSnapshot = null;
          
          // Notify all listeners
          this.listeners.forEach(listener => listener());
        } catch (err) {
          this.error = 'Failed to process sensor data update';
          this.isConnected = false;
          console.error('Data update error:', err);
          
          // Invalidate cached snapshot
          this.cachedSnapshot = null;
          
          this.listeners.forEach(listener => listener());
        }
      }, 2000);
      
      this.isConnected = true;
    } catch (err) {
      this.error = 'Failed to initialize sensor data simulation';
      this.isConnected = false;
      console.error('Simulation initialization error:', err);
      
      // Invalidate cached snapshot
      this.cachedSnapshot = null;
    }
  };

  // Subscribe to store updates
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  // Get current snapshot of data
  getSnapshot = (): StoreSnapshot => {
    if (!this.cachedSnapshot) {
      this.cachedSnapshot = {
        data: this.data,
        isConnected: this.isConnected,
        error: this.error,
      };
    }
    return this.cachedSnapshot;
  };

  // Cleanup method
  destroy = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.listeners.clear();
    this.cachedSnapshot = null;
  };
}

// Create a singleton instance of the store
export const sensorStore = new SensorDataStore();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sensorStore.destroy();
  });
} 