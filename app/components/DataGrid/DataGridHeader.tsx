import React from 'react';
import { Column, SortConfig } from './types';

interface DataGridHeaderProps<T> {
  columns: Column<T>[];
  sortConfig: SortConfig[];
  onSortClick: (field: string) => void;
}

export default function DataGridHeader<T>({
  columns,
  sortConfig,
  onSortClick,
}: DataGridHeaderProps<T>) {
  // Helper to determine sort direction for a column
  const getSortDirection = (field: string): 'asc' | 'desc' | undefined => {
    const sort = sortConfig.find(s => s.field === field);
    return sort?.direction;
  };

  // Helper to determine sort index for multi-sort
  const getSortIndex = (field: string): number => {
    const index = sortConfig.findIndex(s => s.field === field);
    return index >= 0 ? index + 1 : 0;
  };

  return (
    <div className="advanced-data-grid-header">
      <div className="header-row">
        {columns.map(column => {
          const sortDirection = getSortDirection(column.field);
          const sortIndex = getSortIndex(column.field);
          const isSorted = sortDirection !== undefined;
          const sortable = column.sortable !== false;

          return (
            <div 
              key={column.field} 
              className="header-cell" 
              style={{ width: column.width || 'auto' }}
            >
              <div 
                className={`cell-content ${sortable ? 'sortable' : ''}`}
                onClick={() => sortable && onSortClick(column.field)}
              >
                <span>{column.header}</span>
                
                {sortable && (
                  <div className="sort-indicator">
                    {isSorted && (
                      <>
                        <span className="sort-direction">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                        {sortConfig.length > 1 && (
                          <span className="sort-index">{sortIndex}</span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}