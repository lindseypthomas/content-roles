import { Injectable } from '@angular/core';
import { Dashboard, Report, Heatmap, MetricTile, View, Field } from '../models/content.models';
import {
  MOCK_DASHBOARDS,
  MOCK_REPORTS,
  MOCK_HEATMAPS,
  MOCK_METRIC_TILES,
  MOCK_VIEWS,
  MOCK_FIELDS,
} from './mock-data';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private dashboards: Dashboard[] = MOCK_DASHBOARDS;
  private reports: Report[] = MOCK_REPORTS;
  private heatmaps: Heatmap[] = MOCK_HEATMAPS;
  private metricTiles: MetricTile[] = MOCK_METRIC_TILES;
  private views: View[] = MOCK_VIEWS;
  private fields: Field[] = MOCK_FIELDS;

  getDashboards(): Dashboard[] {
    return this.dashboards;
  }

  getReports(): Report[] {
    return this.reports;
  }

  getHeatmaps(): Heatmap[] {
    return this.heatmaps;
  }

  getMetricTiles(): MetricTile[] {
    return this.metricTiles;
  }

  getViews(): View[] {
    return this.views;
  }

  getFields(): Field[] {
    return this.fields;
  }

  getDashboard(id: string): Dashboard | undefined {
    return this.dashboards.find(d => d.id === id);
  }

  getReport(id: string): Report | undefined {
    return this.reports.find(r => r.id === id);
  }

  getHeatmap(id: string): Heatmap | undefined {
    return this.heatmaps.find(h => h.id === id);
  }

  getMetricTile(id: string): MetricTile | undefined {
    return this.metricTiles.find(m => m.id === id);
  }

  getView(id: string): View | undefined {
    return this.views.find(v => v.id === id);
  }

  getField(id: string): Field | undefined {
    return this.fields.find(f => f.id === id);
  }

  getReportsForDashboard(dashboardId: string): Report[] {
    const dashboard = this.getDashboard(dashboardId);
    if (!dashboard) return [];
    return this.reports.filter(r => dashboard.reportIds.includes(r.id));
  }

  getFieldsForView(viewId: string): Field[] {
    const view = this.getView(viewId);
    if (!view) return [];
    return this.fields.filter(f => view.fieldIds.includes(f.id));
  }

  getViewsForField(fieldId: string): View[] {
    const field = this.getField(fieldId);
    if (!field) return [];
    return this.views.filter(v => field.viewIds.includes(v.id));
  }

  getReportsForView(viewId: string): Report[] {
    return this.reports.filter(r => r.viewId === viewId);
  }
}
