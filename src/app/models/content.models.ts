export interface Dashboard {
  id: string;
  name: string;
  description: string;
  reportIds: string[];
}

export interface Report {
  id: string;
  name: string;
  description: string;
  viewId: string;
  fieldIds: string[];
  type: 'Metric Report' | 'Metric Tile' | 'Heatmap' | 'Report';
}

export interface View {
  id: string;
  name: string;
  description: string;
  fieldIds: string[];
}

export interface Field {
  id: string;
  name: string;
  description: string;
  viewIds: string[];
}

export interface ContentUserRole {
  id: string;
  name: string;
  description: string;
  dashboardIds: string[];
  reportIds: string[];
  viewIds: string[];
  fieldIds: string[];
}

export type ContentItemType = 'dashboard' | 'report' | 'view' | 'field';

export type ContentStatus = 'included' | 'missing' | 'partial';

export interface ContentItemStatus {
  id: string;
  status: ContentStatus;
  missingDependencies?: string[];
}

export interface RequiredContent {
  reports: ContentItemStatus[];
  views: ContentItemStatus[];
  fields: ContentItemStatus[];
}

export interface RemovalImpact {
  affectedDashboards: { id: string; name: string }[];
  affectedReports: { id: string; name: string }[];
  affectedViews: { id: string; name: string }[];
  description: string;
}

export interface EffectiveAccess {
  dashboards: { id: string; name: string; fullyVisible: boolean; visibleReportCount: number; totalReportCount: number }[];
  visibleReports: number;
  totalReports: number;
}
