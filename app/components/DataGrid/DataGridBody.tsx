import React, { useState } from 'react';
import { Column } from './types';

interface DataGridBodyProps<T> {
  data: T[];
  columns: Column<T>[];
  groupBy: string[];
  keyField: string;
  rowHeight: number;
}

export default function DataGridBody<T extends Record<string, any>>({
  data,
  columns,
  groupBy,
  keyField,
  rowHeight,
}: DataGridBodyProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroupExpansion = (groupPath: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (expandedGroups.has(groupPath)) {
      newExpandedGroups.delete(groupPath);
    } else {
      newExpandedGroups.add(groupPath);
    }
    setExpandedGroups(newExpandedGroups);
  };

  // Helper to get nested value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((prev, curr) => {
      return prev ? prev[curr] : null;
    }, obj);
  };

  // Function to render a data cell
  const renderCell = (row: T, column: Column<T>) => {
    const value = getNestedValue(row, column.field);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else if (value === null || value === undefined) {
      return '-';
    }
    
    return String(value);
  };

  // Group the data
  const groupData = (items: T[], groupFields: string[], currentPath: string = '') => {
    if (!groupFields.length) {
      return (
        <>
          {items.map(row => (
            <div 
              key={row[keyField].toString()} 
              className="data-row"
              style={{ height: `${rowHeight}px` }}
            >
              {columns.map(column => (
                <div 
                  key={`${row[keyField]}-${column.field}`} 
                  className="data-cell"
                  style={{ width: column.width || 'auto' }}
                >
                  {renderCell(row, column)}
                </div>
              ))}
            </div>
          ))}
        </>
      );
    }
    
    const currentGroupField = groupFields[0];
    const remainingGroupFields = groupFields.slice(1);
    
    // Group items by the current group field
    const groups: Record<string, T[]> = {};
    items.forEach(item => {
      const value = getNestedValue(item, currentGroupField);
      const groupKey = value?.toString() || 'null';
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(item);
    });
    
    // Return grouped content
    return (
      <>
        {Object.entries(groups).map(([key, groupItems]) => {
          const groupPath = currentPath ? `${currentPath}/${key}` : key;
          const isExpanded = expandedGroups.has(groupPath);
          const groupColumn = columns.find(col => col.field === currentGroupField);
          const groupHeader = groupColumn?.header || currentGroupField;
          
          return (
            <React.Fragment key={groupPath}>
              <div className="group-row" onClick={() => toggleGroupExpansion(groupPath)}>
                <div className="group-cell">
                  <span className="group-toggle">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <span className="group-label">
                    {groupHeader}: {key} ({groupItems.length} items)
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="group-content">
                  {groupData(groupItems, remainingGroupFields, groupPath)}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </>
    );
  };
  
  return (
    <div className="advanced-data-grid-body">
      {groupBy.length > 0 ? (
        groupData(data, groupBy)
      ) : (
        data.map(row => (
          <div 
            key={row[keyField].toString()} 
            className="data-row"
            style={{ height: `${rowHeight}px` }}
          >
            {columns.map(column => (
              <div 
                key={`${row[keyField]}-${column.field}`} 
                className="data-cell"
                style={{ width: column.width || 'auto' }}
              >
                {renderCell(row, column)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}