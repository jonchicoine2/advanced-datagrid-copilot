import React, { useState } from 'react';
import { Column, SortConfig } from './types';

interface DataGridToolbarProps<T> {
  columns: Column<T>[];
  visibleColumns: string[];
  sortConfig: SortConfig[];
  groupBy: string[];
  toggleColumnVisibility: (field: string) => void;
  toggleGroupBy: (field: string) => void;
  onSaveLayoutClick: () => void;
  onLoadLayoutClick: () => void;
}

export default function DataGridToolbar<T>({
  columns,
  visibleColumns,
  sortConfig,
  groupBy,
  toggleColumnVisibility,
  toggleGroupBy,
  onSaveLayoutClick,
  onLoadLayoutClick,
}: DataGridToolbarProps<T>) {
  const [showColumnList, setShowColumnList] = useState(false);
  const [showGroupByList, setShowGroupByList] = useState(false);
  
  // Get all columns eligible for grouping
  const groupableColumns = columns.filter(col => col.groupable !== false);

  return (
    <div className="advanced-data-grid-toolbar">
      <div className="toolbar-section">
        <div className="dropdown">
          <button 
            className="dropdown-toggle"
            onClick={() => setShowColumnList(!showColumnList)}
          >
            Columns
          </button>
          
          {showColumnList && (
            <div className="dropdown-menu">
              {columns.map(column => (
                <label key={column.field} className="dropdown-item">
                  <input 
                    type="checkbox"
                    checked={visibleColumns.includes(column.field)}
                    onChange={() => toggleColumnVisibility(column.field)}
                  />
                  <span>{column.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        
        <div className="dropdown">
          <button 
            className="dropdown-toggle"
            onClick={() => setShowGroupByList(!showGroupByList)}
          >
            Group By
          </button>
          
          {showGroupByList && (
            <div className="dropdown-menu">
              {groupableColumns.map(column => (
                <label key={column.field} className="dropdown-item">
                  <input 
                    type="checkbox"
                    checked={groupBy.includes(column.field)}
                    onChange={() => toggleGroupBy(column.field)}
                  />
                  <span>{column.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="toolbar-section">
        <button onClick={onSaveLayoutClick} className="save-layout-button">
          Save Layout
        </button>
        
        <button onClick={onLoadLayoutClick} className="load-layout-button">
          Load Layout
        </button>
      </div>
      
      <div className="toolbar-section">
        <div className="active-filters">
          {sortConfig.length > 0 && (
            <div className="filter-section">
              <span className="filter-label">Sort:</span>
              {sortConfig.map((sort, index) => {
                const column = columns.find(c => c.field === sort.field);
                return (
                  <span key={sort.field} className="filter-tag">
                    {column?.header || sort.field} ({sort.direction})
                    {index < sortConfig.length - 1 ? ', ' : ''}
                  </span>
                );
              })}
            </div>
          )}
          
          {groupBy.length > 0 && (
            <div className="filter-section">
              <span className="filter-label">Group by:</span>
              {groupBy.map((field, index) => {
                const column = columns.find(c => c.field === field);
                return (
                  <span key={field} className="filter-tag">
                    {column?.header || field}
                    {index < groupBy.length - 1 ? ' > ' : ''}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}