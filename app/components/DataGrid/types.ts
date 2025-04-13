export interface Column<T> {
  field: string;
  header: string;
  visible?: boolean;
  width?: number | string;
  sortable?: boolean;
  groupable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  order?: number; // Add order property for column positioning
}

export interface DataGridProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: string;
  defaultLayout?: DataGridLayout;
  onLayoutChange?: (layout: DataGridLayout) => void;
  rowHeight?: number;
  className?: string;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface GroupConfig {
  fields: string[];
}

export interface DataGridLayout {
  id?: string;
  name?: string;
  visibleColumns: string[];
  columnOrder: string[]; // Add column order array
  sort: SortConfig[];
  groupBy: string[];
}

export interface GroupedData<T> {
  [key: string]: {
    items: T[];
    subgroups?: GroupedData<T>;
  };
}

// Add new interface for drag and drop events
export interface DragColumnEvent {
  source: string;
  target: string;
}