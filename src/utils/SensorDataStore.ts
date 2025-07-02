import type { SensorData, StoreSnapshot } from '../types';
import { performanceMonitor } from './PerformanceMonitor';

// External Store for Sensor Data
export class SensorDataStore {
  private data: SensorData[] = [];
  private listeners = new Set<() => void>();
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;
  private error: string | null = null;
  private cachedSnapshot: StoreSnapshot | null = null;

  constructor() {
    // Generate initial data immediately
    this.generateInitialData();
    // Start the simulation after a short delay to ensure everything is initialized
    setTimeout(() => this.startSimulation(), 100);
  }

  // Generate initial data so users see something immediately
  private generateInitialData = () => {
    try {
      const initialData = Array.from({ length: 5 }, (_, i) =>
        this.generateMetrics(`Sensor-${i + 1}`)
      );
      this.data = initialData;
      this.isConnected = true;
      this.error = null;
      
      // Invalidate cached snapshot
      this.cachedSnapshot = null;
      
      console.log('Initial sensor data generated:', this.data.length, 'readings');
    } catch (err) {
      console.error('Failed to generate initial data:', err);
      this.error = 'Failed to initialize sensor data';
    }
  };

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
      // Clear any existing interval
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }

      console.log('Starting sensor data simulation...');
      
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
          
          console.log('Sensor data updated:', updates.length, 'new readings, total:', this.data.length);
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
      console.log('Sensor simulation started successfully');
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

// Cleanup on page unload and add debug info
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sensorStore.destroy();
  });
  
  // Add global debug function (remove in production if needed)
  (window as any).debugSensorStore = () => {
    const snapshot = sensorStore.getSnapshot();
    console.log('Sensor Store Debug:', {
      dataCount: snapshot.data.length,
      isConnected: snapshot.isConnected,
      error: snapshot.error,
      sampleData: snapshot.data.slice(0, 3)
    });
    return snapshot;
  };
  
  console.log('Sensor store initialized. Use debugSensorStore() in console to check status.');
} 