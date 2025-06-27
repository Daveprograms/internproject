import React from 'react';
import type { FilterState } from '../types';

interface FilterControlsProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

// Filter Controls Component
export const FilterControls: React.FC<FilterControlsProps> = ({ 
  filters, 
  onFilterChange, 
  onReset 
}) => {
  const handleInputChange = (field: keyof FilterState, value: string) => {
    const numValue = parseFloat(value) || 0;
    onFilterChange({ ...filters, [field]: numValue });
  };

  return (
    <div className="filter-controls">
      <h3>Filter Controls</h3>
      <div className="filter-grid">
        <div className="filter-group">
          <label>Temperature (°C)</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.temperatureMin || ''}
              onChange={(e) => handleInputChange('temperatureMin', e.target.value)}
              step="0.1"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.temperatureMax || ''}
              onChange={(e) => handleInputChange('temperatureMax', e.target.value)}
              step="0.1"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Humidity (%)</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.humidityMin || ''}
              onChange={(e) => handleInputChange('humidityMin', e.target.value)}
              step="0.1"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.humidityMax || ''}
              onChange={(e) => handleInputChange('humidityMax', e.target.value)}
              step="0.1"
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Air Quality (AQI)</label>
          <div className="range-inputs">
            <input
              type="number"
              placeholder="Min"
              value={filters.airQualityMin || ''}
              onChange={(e) => handleInputChange('airQualityMin', e.target.value)}
              step="0.1"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.airQualityMax || ''}
              onChange={(e) => handleInputChange('airQualityMax', e.target.value)}
              step="0.1"
            />
          </div>
        </div>

        <button className="reset-button" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </div>
  );
}; 