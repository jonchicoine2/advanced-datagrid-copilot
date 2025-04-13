import { useState, useEffect, useCallback } from 'react';
import { Column, DataGridLayout, SortConfig } from '../components/DataGrid/types';

// A custom hook for managing DataGrid state
export function useDataGrid<T>(
  data: T[],
  columns: Column<T>[],
  defaultLayout?: DataGridLayout,
  onLayoutChange?: (layout: DataGridLayout) => void
) {
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    defaultLayout?.visibleColumns || columns.filter(col => col.visible !== false).map(col => col.field)
  );

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig[]>(defaultLayout?.sort || []);
  
  // Grouping state
  const [groupBy, setGroupBy] = useState<string[]>(defaultLayout?.groupBy || []);

  // Current layout state
  const [currentLayout, setCurrentLayout] = useState<DataGridLayout>({
    visibleColumns,
    sort: sortConfig,
    groupBy,
  });

  // Filtered data after applying sorting and grouping
  const [processedData, setProcessedData] = useState<T[]>([...data]);

  // Update the layout when any component changes
  useEffect(() => {
    const newLayout = {
      ...currentLayout,
      visibleColumns,
      sort: sortConfig,
      groupBy,
    };
    
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
  }, [visibleColumns, sortConfig, groupBy]);

  // Update processed data when source data or configuration changes
  useEffect(() => {
    let result = [...data];

    // Apply sorting
    if (sortConfig.length > 0) {
      result = [...result].sort((a, b) => {
        for (const sort of sortConfig) {
          const { field, direction } = sort;
          const valueA = getNestedValue(a, field);
          const valueB = getNestedValue(b, field);

          if (valueA === valueB) continue;

          // Handle null/undefined values
          if (valueA == null) return direction === 'asc' ? -1 : 1;
          if (valueB == null) return direction === 'asc' ? 1 : -1;

          // Date comparison
          if (valueA instanceof Date && valueB instanceof Date) {
            return direction === 'asc' 
              ? valueA.getTime() - valueB.getTime() 
              : valueB.getTime() - valueA.getTime();
          }

          // String comparison for everything else
          const compareResult = String(valueA).localeCompare(String(valueB));
          return direction === 'asc' ? compareResult : -compareResult;
        }
        return 0;
      });
    }

    setProcessedData(result);
  }, [data, sortConfig, groupBy]);

  // Helper functions
  const toggleColumnVisibility = useCallback((field: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(field)) {
        return prev.filter(col => col !== field);
      }
      return [...prev, field];
    });
  }, []);

  const toggleSort = useCallback((field: string) => {
    setSortConfig(prev => {
      const existingIndex = prev.findIndex(sort => sort.field === field);
      
      if (existingIndex === -1) {
        // Not sorted by this field yet, add ascending sort
        return [...prev, { field, direction: 'asc' }];
      } else if (prev[existingIndex].direction === 'asc') {
        // Field is sorted ascending, switch to descending
        const newSort = [...prev];
        newSort[existingIndex] = { field, direction: 'desc' };
        return newSort;
      } else {
        // Field is sorted descending, remove sort
        return prev.filter(sort => sort.field !== field);
      }
    });
  }, []);

  const toggleGroupBy = useCallback((field: string) => {
    setGroupBy(prev => {
      if (prev.includes(field)) {
        return prev.filter(f => f !== field);
      }
      return [...prev, field];
    });
  }, []);

  const saveLayout = useCallback((name: string) => {
    const layoutToSave = {
      ...currentLayout,
      id: `layout-${Date.now()}`,
      name,
    };

    // Save to localStorage
    const savedLayouts = JSON.parse(localStorage.getItem('dataGridLayouts') || '[]');
    const updatedLayouts = [...savedLayouts, layoutToSave];
    localStorage.setItem('dataGridLayouts', JSON.stringify(updatedLayouts));

    return layoutToSave;
  }, [currentLayout]);

  const loadLayout = useCallback((layoutId: string) => {
    const savedLayouts = JSON.parse(localStorage.getItem('dataGridLayouts') || '[]');
    const layout = savedLayouts.find((layout: DataGridLayout) => layout.id === layoutId);
    
    if (layout) {
      setVisibleColumns(layout.visibleColumns);
      setSortConfig(layout.sort);
      setGroupBy(layout.groupBy);
      return true;
    }
    return false;
  }, []);

  const getSavedLayouts = useCallback(() => {
    return JSON.parse(localStorage.getItem('dataGridLayouts') || '[]');
  }, []);

  return {
    visibleColumns,
    sortConfig,
    groupBy,
    currentLayout,
    processedData,
    toggleColumnVisibility,
    toggleSort,
    toggleGroupBy,
    saveLayout,
    loadLayout,
    getSavedLayouts,
  };
}

// Helper function to get nested property values using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => {
    return prev ? prev[curr] : null;
  }, obj);
}