import React, { useCallback, useState } from 'react';
import { DataGridProps, Column, DataGridLayout } from './types';
import { useDataGrid } from '../../hooks/useDataGrid';
import DataGridHeader from './DataGridHeader';
import DataGridBody from './DataGridBody';
import DataGridToolbar from './DataGridToolbar';

export default function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  keyField,
  defaultLayout,
  onLayoutChange,
  rowHeight = 40,
  className = '',
}: DataGridProps<T>) {
  const {
    visibleColumns,
    sortConfig,
    groupBy,
    processedData,
    currentLayout,
    toggleColumnVisibility,
    toggleSort,
    toggleGroupBy,
    saveLayout,
    loadLayout,
    getSavedLayouts,
  } = useDataGrid<T>(data, columns, defaultLayout, onLayoutChange);

  // Show layout dialog
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [savedLayouts, setSavedLayouts] = useState<DataGridLayout[]>([]);

  // Filter columns to only show visible ones
  const visibleColumnsData = columns.filter(col => visibleColumns.includes(col.field));
  
  // Save layout handler
  const handleSaveLayout = useCallback(() => {
    if (!layoutName.trim()) return;
    saveLayout(layoutName);
    setLayoutName('');
    setIsLayoutDialogOpen(false);
  }, [layoutName, saveLayout]);
  
  // Load layouts handler
  const handleLoadLayouts = useCallback(() => {
    const layouts = getSavedLayouts();
    setSavedLayouts(layouts);
    setIsLayoutDialogOpen(true);
  }, [getSavedLayouts]);
  
  // Load a specific layout
  const handleLoadLayout = useCallback((layoutId: string) => {
    loadLayout(layoutId);
    setIsLayoutDialogOpen(false);
  }, [loadLayout]);

  return (
    <div className={`advanced-data-grid ${className}`}>
      <DataGridToolbar
        columns={columns}
        visibleColumns={visibleColumns}
        sortConfig={sortConfig}
        groupBy={groupBy}
        toggleColumnVisibility={toggleColumnVisibility}
        toggleGroupBy={toggleGroupBy}
        onSaveLayoutClick={() => setIsLayoutDialogOpen(true)}
        onLoadLayoutClick={handleLoadLayouts}
      />
      
      <div className="advanced-data-grid-container">
        <DataGridHeader
          columns={visibleColumnsData}
          sortConfig={sortConfig}
          onSortClick={toggleSort}
        />
        
        <DataGridBody
          data={processedData}
          columns={visibleColumnsData}
          groupBy={groupBy}
          keyField={keyField}
          rowHeight={rowHeight}
        />
      </div>
      
      {isLayoutDialogOpen && (
        <div className="layout-dialog-overlay">
          <div className="layout-dialog">
            <h2>Grid Layouts</h2>
            
            <div className="save-layout">
              <h3>Save Current Layout</h3>
              <div className="layout-form">
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="Layout name"
                />
                <button onClick={handleSaveLayout}>Save</button>
              </div>
            </div>
            
            <div className="load-layout">
              <h3>Load Saved Layout</h3>
              {savedLayouts.length === 0 ? (
                <p>No saved layouts</p>
              ) : (
                <ul className="layouts-list">
                  {savedLayouts.map(layout => (
                    <li key={layout.id} onClick={() => handleLoadLayout(layout.id!)}>
                      {layout.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <button className="close-button" onClick={() => setIsLayoutDialogOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}