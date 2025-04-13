import React, { useRef } from 'react';
import { Column, SortConfig, DragColumnEvent } from './types';

interface DataGridHeaderProps<T> {
  columns: Column<T>[];
  columnOrder: string[];
  sortConfig: SortConfig[];
  onSortClick: (field: string) => void;
  onColumnReorder: (event: DragColumnEvent) => void;
}

export default function DataGridHeader<T>({
  columns,
  columnOrder,
  sortConfig,
  onSortClick,
  onColumnReorder,
}: DataGridHeaderProps<T>) {
  const draggedColumn = useRef<string | null>(null);

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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, field: string) => {
    draggedColumn.current = field;
    e.dataTransfer.effectAllowed = 'move';
    // Add a semi-transparent effect to the dragged column
    const target = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => {
      target.style.opacity = '0.5';
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    draggedColumn.current = null;
    // Restore opacity
    const target = e.currentTarget as HTMLElement;
    requestAnimationFrame(() => {
      target.style.opacity = '1';
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetField: string) => {
    e.preventDefault();
    const sourceField = draggedColumn.current;
    
    if (sourceField && sourceField !== targetField) {
      onColumnReorder({
        source: sourceField,
        target: targetField
      });
    }
  };

  // Order columns according to columnOrder
  const orderedColumns = columnOrder
    .map(field => columns.find(col => col.field === field))
    .filter((col): col is Column<T> => col !== undefined);

  return (
    <div className="advanced-data-grid-header">
      <div className="header-row">
        {orderedColumns.map(column => {
          const sortDirection = getSortDirection(column.field);
          const sortIndex = getSortIndex(column.field);
          const isSorted = sortDirection !== undefined;
          const sortable = column.sortable !== false;

          return (
            <div 
              key={column.field} 
              className={`header-cell ${sortable ? 'sortable' : ''}`}
              style={{ width: column.width || 'auto' }}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, column.field)}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.field)}
            >
              <div 
                className="cell-content"
                onClick={() => sortable && onSortClick(column.field)}
              >
                <span className="grip-handle">⋮⋮</span>
                <span className="header-text">{column.header}</span>
                
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