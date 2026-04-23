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
  type: 'Metric Report' | 'Report';
  company: string;
}

export interface Heatmap {
  id: string;
  name: string;
  description: string;
  viewId: string;
  fieldIds: string[];
  company: string;
}

export interface MetricTile {
  id: string;
  name: string;
  description: string;
  viewId: string;
  fieldIds: string[];
  company: string;
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
  dashboardIds: string[];
  reportIds: string[];
  heatmapIds: string[];
  metricTileIds: string[];
  viewIds: string[];
  fieldIds: string[];
  insightIds: string[];
  metricGroupIds: string[];
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
