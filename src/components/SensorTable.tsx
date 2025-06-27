import React, { useState, useMemo } from 'react';
import type { SensorData, SortConfig, AirQualityInfo } from '../types';

interface SensorTableProps {
  data: SensorData[];
  sortConfig: SortConfig;
  onSort: (key: keyof SensorData) => void;
}

// Pagination constants
const ITEMS_PER_PAGE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Sensor Table Component with Pagination
export const SensorTable: React.FC<SensorTableProps> = ({ 
  data, 
  sortConfig, 
  onSort 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  // Calculate pagination data
  const paginationData = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentItems = data.slice(startIndex, endIndex);
    
    return {
      currentItems,
      totalItems,
      totalPages,
      startIndex,
      endIndex: Math.min(endIndex, totalItems),
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [data, currentPage, pageSize]);

  // Reset to first page when data changes significantly
  React.useEffect(() => {
    if (currentPage > paginationData.totalPages && paginationData.totalPages > 0) {
      setCurrentPage(1);
    }
  }, [data.length, currentPage, paginationData.totalPages]);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const generatePageNumbers = () => {
    const { totalPages } = paginationData;
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (data.length === 0) {
    return (
      <div className="no-data">
        <p>No sensor data available. Waiting for real-time updates...</p>
      </div>
    );
  }

  const { currentItems, totalItems, totalPages, startIndex, endIndex, hasNextPage, hasPrevPage } = paginationData;

  return (
    <div className="table-container">
      {/* Pagination Controls - Top */}
      <div className="pagination-controls">
        <div className="pagination-info">
          <span>
            Showing {startIndex + 1}-{endIndex} of {totalItems} readings
          </span>
          <select 
            value={pageSize} 
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="page-size-selector"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
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
          {currentItems.map((sensor, index) => {
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

      {/* Pagination Controls - Bottom */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="pagination-btn"
          >
            ← Previous
          </button>
          
          <div className="pagination-numbers">
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    onClick={() => handlePageChange(page as number)}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="pagination-btn"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}; 