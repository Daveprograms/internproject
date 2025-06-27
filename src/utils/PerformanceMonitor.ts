// Performance monitoring utility for dashboard metrics
export interface PerformanceMetrics {
  // Render performance
  renderCount: number;
  averageRenderTime: number;
  lastRenderTime: number;
  
  // Memory usage
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null;
  
  // Data processing
  dataProcessingTime: number;
  filteringTime: number;
  sortingTime: number;
  
  // Update frequency
  updateFrequency: number;
  lastUpdateTime: number;
  
  // Bundle and network
  bundleSize: number;
  loadTime: number;
  
  // User interaction
  interactionCount: number;
  averageInteractionTime: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private renderTimes: number[] = [];
  private interactionTimes: number[] = [];
  private startTime: number;
  private lastUpdateTime: number = 0;
  private updateCount: number = 0;

  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: this.getMemoryUsage(),
      dataProcessingTime: 0,
      filteringTime: 0,
      sortingTime: 0,
      updateFrequency: 0,
      lastUpdateTime: 0,
      bundleSize: 0,
      loadTime: 0,
      interactionCount: 0,
      averageInteractionTime: 0,
    };

    // Measure initial load time
    if (document.readyState === 'complete') {
      this.measureLoadTime();
    } else {
      window.addEventListener('load', () => this.measureLoadTime());
    }
  }

  // Measure render performance
  measureRender(callback: () => void): void {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    this.renderTimes.push(renderTime);
    
    // Keep only last 100 measurements
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift();
    }
    
    this.metrics.renderCount++;
    this.metrics.lastRenderTime = renderTime;
    this.metrics.averageRenderTime = 
      this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
  }

  // Measure data processing performance
  measureDataProcessing<T>(operation: () => T, type: 'filtering' | 'sorting' | 'processing'): T {
    const startTime = performance.now();
    const result = operation();
    const endTime = performance.now();
    
    const processingTime = endTime - startTime;
    
    switch (type) {
      case 'filtering':
        this.metrics.filteringTime = processingTime;
        break;
      case 'sorting':
        this.metrics.sortingTime = processingTime;
        break;
      case 'processing':
        this.metrics.dataProcessingTime = processingTime;
        break;
    }
    
    return result;
  }

  // Measure user interaction
  measureInteraction(callback: () => void): void {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    
    const interactionTime = endTime - startTime;
    this.interactionTimes.push(interactionTime);
    
    // Keep only last 50 measurements
    if (this.interactionTimes.length > 50) {
      this.interactionTimes.shift();
    }
    
    this.metrics.interactionCount++;
    this.metrics.averageInteractionTime = 
      this.interactionTimes.reduce((a, b) => a + b, 0) / this.interactionTimes.length;
  }

  // Track data updates
  trackDataUpdate(): void {
    const currentTime = performance.now();
    
    if (this.lastUpdateTime > 0) {
      const timeSinceLastUpdate = currentTime - this.lastUpdateTime;
      this.updateCount++;
      
      // Calculate update frequency (updates per second)
      this.metrics.updateFrequency = 1000 / timeSinceLastUpdate;
    }
    
    this.lastUpdateTime = currentTime;
    this.metrics.lastUpdateTime = currentTime;
  }

  // Get current memory usage
  private getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  // Measure initial load time
  private measureLoadTime(): void {
    if (performance.timing) {
      const timing = performance.timing;
      this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
    }
  }

  // Update memory usage
  updateMemoryUsage(): void {
    this.metrics.memoryUsage = this.getMemoryUsage();
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.updateMemoryUsage();
    return { ...this.metrics };
  }

  // Get performance summary
  getPerformanceSummary(): string {
    const metrics = this.getMetrics();
    const memoryMB = metrics.memoryUsage 
      ? Math.round(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024) 
      : 0;
    
    return `
Performance Metrics Summary:
═══════════════════════════════════════
📊 Render Performance:
   • Total Renders: ${metrics.renderCount}
   • Average Render Time: ${metrics.averageRenderTime.toFixed(2)}ms
   • Last Render Time: ${metrics.lastRenderTime.toFixed(2)}ms

💾 Memory Usage:
   • Used Memory: ${memoryMB}MB
   • Memory Efficiency: ${memoryMB < 50 ? 'Excellent' : memoryMB < 100 ? 'Good' : 'Moderate'}

⚡ Data Processing:
   • Processing Time: ${metrics.dataProcessingTime.toFixed(2)}ms
   • Filtering Time: ${metrics.filteringTime.toFixed(2)}ms
   • Sorting Time: ${metrics.sortingTime.toFixed(2)}ms

🔄 Update Performance:
   • Update Frequency: ${metrics.updateFrequency.toFixed(1)} Hz
   • Total Updates: ${this.updateCount}

👆 User Interactions:
   • Total Interactions: ${metrics.interactionCount}
   • Average Response Time: ${metrics.averageInteractionTime.toFixed(2)}ms

🚀 Load Performance:
   • Initial Load Time: ${metrics.loadTime}ms
   • Load Performance: ${metrics.loadTime < 2000 ? 'Excellent' : metrics.loadTime < 5000 ? 'Good' : 'Needs Improvement'}
`;
  }

  // Performance grade calculator
  getPerformanceGrade(): { grade: string; score: number; feedback: string } {
    const metrics = this.getMetrics();
    let score = 100;
    const feedback: string[] = [];

    // Render performance (25 points)
    if (metrics.averageRenderTime > 16) {
      score -= 10;
      feedback.push('Render time could be improved');
    } else if (metrics.averageRenderTime > 8) {
      score -= 5;
    }

    // Memory usage (25 points)
    const memoryMB = metrics.memoryUsage ? metrics.memoryUsage.usedJSHeapSize / 1024 / 1024 : 0;
    if (memoryMB > 100) {
      score -= 15;
      feedback.push('High memory usage detected');
    } else if (memoryMB > 50) {
      score -= 8;
      feedback.push('Moderate memory usage');
    }

    // Data processing (25 points)
    const totalProcessingTime = metrics.dataProcessingTime + metrics.filteringTime + metrics.sortingTime;
    if (totalProcessingTime > 100) {
      score -= 15;
      feedback.push('Data processing could be optimized');
    } else if (totalProcessingTime > 50) {
      score -= 8;
    }

    // Load time (25 points)
    if (metrics.loadTime > 5000) {
      score -= 20;
      feedback.push('Load time is too slow');
    } else if (metrics.loadTime > 2000) {
      score -= 10;
      feedback.push('Load time could be improved');
    }

    // Determine grade
    let grade: string;
    if (score >= 95) grade = 'A+';
    else if (score >= 90) grade = 'A';
    else if (score >= 85) grade = 'A-';
    else if (score >= 80) grade = 'B+';
    else if (score >= 75) grade = 'B';
    else if (score >= 70) grade = 'B-';
    else if (score >= 65) grade = 'C+';
    else if (score >= 60) grade = 'C';
    else grade = 'C-';

    return {
      grade,
      score,
      feedback: feedback.length > 0 ? feedback.join(', ') : 'Excellent performance!'
    };
  }

  // Reset metrics
  reset(): void {
    this.renderTimes = [];
    this.interactionTimes = [];
    this.updateCount = 0;
    this.lastUpdateTime = 0;
    this.startTime = performance.now();
    
    this.metrics = {
      renderCount: 0,
      averageRenderTime: 0,
      lastRenderTime: 0,
      memoryUsage: this.getMemoryUsage(),
      dataProcessingTime: 0,
      filteringTime: 0,
      sortingTime: 0,
      updateFrequency: 0,
      lastUpdateTime: 0,
      bundleSize: 0,
      loadTime: 0,
      interactionCount: 0,
      averageInteractionTime: 0,
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to log performance to console (development only)
export const logPerformance = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(performanceMonitor.getPerformanceSummary());
    console.log('Performance Grade:', performanceMonitor.getPerformanceGrade());
  }
}; 