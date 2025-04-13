import { renderHook, act } from '@testing-library/react';
import { useDataGrid } from '../../hooks/useDataGrid';
import { Column } from '../../components/DataGrid/types';

interface TestItem {
  id: string;
  name: string;
  age: number;
  city: string;
  joined: Date;
}

describe('useDataGrid Hook', () => {
  // Test data
  const mockData: TestItem[] = [
    { id: '1', name: 'John Doe', age: 30, city: 'New York', joined: new Date('2021-01-15') },
    { id: '2', name: 'Jane Smith', age: 25, city: 'Boston', joined: new Date('2022-03-10') },
    { id: '3', name: 'Bob Johnson', age: 40, city: 'Chicago', joined: new Date('2020-11-05') },
    { id: '4', name: 'Alice Brown', age: 35, city: 'New York', joined: new Date('2021-07-22') },
  ];

  // Test columns
  const mockColumns: Column<TestItem>[] = [
    { field: 'id', header: 'ID', sortable: true, groupable: false },
    { field: 'name', header: 'Name', sortable: true, groupable: true },
    { field: 'age', header: 'Age', sortable: true, groupable: true },
    { field: 'city', header: 'City', sortable: true, groupable: true },
    { field: 'joined', header: 'Join Date', sortable: true, groupable: false },
  ];

  // Test 1: Initial state
  test('initializes with default values', () => {
    const { result } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Check initial visible columns (should be all columns by default)
    expect(result.current.visibleColumns).toEqual(mockColumns.map(col => col.field));
    
    // Check initial sort and group state
    expect(result.current.sortConfig).toEqual([]);
    expect(result.current.groupBy).toEqual([]);
    
    // Check processed data (should be equal to input data initially)
    expect(result.current.processedData).toEqual(mockData);
  });

  // Test 2: Column visibility toggle
  test('toggles column visibility correctly', () => {
    const { result } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Toggle 'age' column visibility (hide it)
    act(() => {
      result.current.toggleColumnVisibility('age');
    });
    
    // Check that 'age' is no longer in visible columns
    expect(result.current.visibleColumns).not.toContain('age');
    
    // Toggle 'age' column visibility again (show it)
    act(() => {
      result.current.toggleColumnVisibility('age');
    });
    
    // Check that 'age' is back in visible columns
    expect(result.current.visibleColumns).toContain('age');
  });

  // Test 3: Sorting functionality
  test('sorts data correctly', () => {
    const { result } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Sort by age ascending
    act(() => {
      result.current.toggleSort('age');
    });
    
    // Check sort configuration
    expect(result.current.sortConfig).toEqual([{ field: 'age', direction: 'asc' }]);
    
    // Check that data is sorted by age (ascending)
    expect(result.current.processedData[0].age).toBe(25); // Jane Smith should be first
    expect(result.current.processedData[3].age).toBe(40); // Bob Johnson should be last
    
    // Sort by age descending
    act(() => {
      result.current.toggleSort('age');
    });
    
    // Check sort configuration
    expect(result.current.sortConfig).toEqual([{ field: 'age', direction: 'desc' }]);
    
    // Check that data is sorted by age (descending)
    expect(result.current.processedData[0].age).toBe(40); // Bob Johnson should be first
    expect(result.current.processedData[3].age).toBe(25); // Jane Smith should be last
    
    // Sort by another field (city) while keeping age sort
    act(() => {
      result.current.toggleSort('city');
    });
    
    // Check that we have multiple sort criteria
    expect(result.current.sortConfig.length).toBe(2);
    expect(result.current.sortConfig[0]).toEqual({ field: 'age', direction: 'desc' });
    expect(result.current.sortConfig[1]).toEqual({ field: 'city', direction: 'asc' });
  });

  // Test 4: Group by functionality
  test('toggles group by correctly', () => {
    const { result } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Group by city
    act(() => {
      result.current.toggleGroupBy('city');
    });
    
    // Check groupBy state
    expect(result.current.groupBy).toEqual(['city']);
    
    // Add another grouping level
    act(() => {
      result.current.toggleGroupBy('age');
    });
    
    // Check groupBy state has both fields in the correct order
    expect(result.current.groupBy).toEqual(['city', 'age']);
    
    // Remove city grouping
    act(() => {
      result.current.toggleGroupBy('city');
    });
    
    // Check that only age grouping remains
    expect(result.current.groupBy).toEqual(['age']);
  });

  // Test 5: Layout saving and loading
  test('saves and loads layouts', () => {
    // First, clear any existing layouts
    localStorage.clear();
    
    const { result, rerender } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Setup some custom configuration
    act(() => {
      // Hide the ID column
      result.current.toggleColumnVisibility('id');
      // Sort by name
      result.current.toggleSort('name');
      // Group by city
      result.current.toggleGroupBy('city');
    });
    
    // Save this layout
    act(() => {
      result.current.saveLayout('My Test Layout');
    });
    
    // Create a fresh instance with default settings
    const { result: newResult } = renderHook(() => useDataGrid(mockData, mockColumns));
    
    // Get saved layouts
    const savedLayouts = newResult.current.getSavedLayouts();
    
    // Check we have one saved layout
    expect(savedLayouts.length).toBe(1);
    expect(savedLayouts[0].name).toBe('My Test Layout');
    
    // Load the saved layout
    act(() => {
      newResult.current.loadLayout(savedLayouts[0].id);
    });
    
    // Check that configuration was restored
    expect(newResult.current.visibleColumns).not.toContain('id');
    expect(newResult.current.sortConfig).toEqual([{ field: 'name', direction: 'asc' }]);
    expect(newResult.current.groupBy).toEqual(['city']);
  });
});