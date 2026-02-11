import { Injectable, inject } from '@angular/core';
import { ContentService } from './content.service';
import {
  ContentItemStatus,
  RequiredContent,
  RemovalImpact,
  EffectiveAccess,
  ContentItemType,
} from '../models/content.models';

export interface RoleSelection {
  dashboardIds: string[];
  reportIds: string[];
  viewIds: string[];
  fieldIds: string[];
}

@Injectable({ providedIn: 'root' })
export class DependencyService {
  private content = inject(ContentService);

  /**
   * Given selected dashboards/reports, compute all reports, views, and fields
   * needed for full access. Returns status per item: included | missing.
   */
  getRequiredContent(selection: RoleSelection): RequiredContent {
    const requiredReportIds = new Set<string>();
    const requiredViewIds = new Set<string>();
    const requiredFieldIds = new Set<string>();

    // Dashboards require their reports
    for (const dashId of selection.dashboardIds) {
      const dash = this.content.getDashboard(dashId);
      if (dash) {
        dash.reportIds.forEach(id => requiredReportIds.add(id));
      }
    }

    // Also include explicitly selected reports
    for (const repId of selection.reportIds) {
      requiredReportIds.add(repId);
    }

    // Reports require their views and fields
    for (const repId of requiredReportIds) {
      const report = this.content.getReport(repId);
      if (report) {
        requiredViewIds.add(report.viewId);
        report.fieldIds.forEach(id => requiredFieldIds.add(id));
      }
    }

    // Also include explicitly selected views
    for (const viewId of selection.viewIds) {
      requiredViewIds.add(viewId);
    }

    // Views require their fields
    for (const viewId of requiredViewIds) {
      const view = this.content.getView(viewId);
      if (view) {
        view.fieldIds.forEach(id => requiredFieldIds.add(id));
      }
    }

    const reports: ContentItemStatus[] = Array.from(requiredReportIds).map(id => ({
      id,
      status: selection.reportIds.includes(id) ? 'included' as const : 'missing' as const,
    }));

    const views: ContentItemStatus[] = Array.from(requiredViewIds).map(id => ({
      id,
      status: selection.viewIds.includes(id) ? 'included' as const : 'missing' as const,
    }));

    const fields: ContentItemStatus[] = Array.from(requiredFieldIds).map(id => ({
      id,
      status: selection.fieldIds.includes(id) ? 'included' as const : 'missing' as const,
    }));

    return { reports, views, fields };
  }

  /**
   * Given a proposed removal, return which other items would lose access.
   */
  getRemovalImpact(
    itemType: ContentItemType,
    itemId: string,
    selection: RoleSelection
  ): RemovalImpact {
    const affectedDashboards: { id: string; name: string }[] = [];
    const affectedReports: { id: string; name: string }[] = [];
    const affectedViews: { id: string; name: string }[] = [];
    let description = '';

    if (itemType === 'view') {
      // Removing a view affects all reports that use it
      const view = this.content.getView(itemId);
      const viewName = view?.name ?? itemId;
      const reportsUsingView = this.content.getReportsForView(itemId);
      const affectedReps = reportsUsingView.filter(r => selection.reportIds.includes(r.id));

      for (const rep of affectedReps) {
        affectedReports.push({ id: rep.id, name: rep.name });
        // Find dashboards containing this report
        for (const dashId of selection.dashboardIds) {
          const dash = this.content.getDashboard(dashId);
          if (dash?.reportIds.includes(rep.id)) {
            if (!affectedDashboards.some(d => d.id === dash.id)) {
              affectedDashboards.push({ id: dash.id, name: dash.name });
            }
          }
        }
      }

      if (affectedReps.length > 0) {
        const repNames = affectedReps.map(r => r.name).join(', ');
        const dashNames = affectedDashboards.map(d => d.name).join(', ');
        description = `Removing "${viewName}" will hide ${affectedReps.length} report(s): ${repNames}`;
        if (affectedDashboards.length > 0) {
          description += ` on ${dashNames}`;
        }
      } else {
        description = `Removing "${viewName}" has no impact on current reports.`;
      }
    }

    if (itemType === 'field') {
      const field = this.content.getField(itemId);
      const fieldName = field?.name ?? itemId;
      // Find reports that use this field
      const allReports = this.content.getReports();
      const affectedReps = allReports.filter(
        r => r.fieldIds.includes(itemId) && selection.reportIds.includes(r.id)
      );

      for (const rep of affectedReps) {
        affectedReports.push({ id: rep.id, name: rep.name });
      }

      // Find views that use this field
      const allViews = this.content.getViews();
      const affectedVws = allViews.filter(
        v => v.fieldIds.includes(itemId) && selection.viewIds.includes(v.id)
      );
      for (const v of affectedVws) {
        affectedViews.push({ id: v.id, name: v.name });
      }

      description = `Removing field "${fieldName}" will reduce data in ${affectedReps.length} report(s) and ${affectedVws.length} view(s).`;
    }

    if (itemType === 'report') {
      const report = this.content.getReport(itemId);
      const reportName = report?.name ?? itemId;
      // Find dashboards that include this report
      for (const dashId of selection.dashboardIds) {
        const dash = this.content.getDashboard(dashId);
        if (dash?.reportIds.includes(itemId)) {
          affectedDashboards.push({ id: dash.id, name: dash.name });
        }
      }

      if (affectedDashboards.length > 0) {
        const dashNames = affectedDashboards.map(d => d.name).join(', ');
        description = `Removing "${reportName}" will reduce content on: ${dashNames}`;
      } else {
        description = `Removing "${reportName}" has no impact on current dashboards.`;
      }
    }

    if (itemType === 'dashboard') {
      const dash = this.content.getDashboard(itemId);
      const dashName = dash?.name ?? itemId;
      description = `Removing "${dashName}" will remove it from the role. Reports/views/fields will remain unless separately removed.`;
    }

    return { affectedDashboards, affectedReports, affectedViews, description };
  }

  /**
   * For each dashboard, compute which reports will actually render
   * given the current selection (respecting that reports need their view and fields).
   */
  getEffectiveAccess(selection: RoleSelection): EffectiveAccess {
    const dashboards: EffectiveAccess['dashboards'] = [];
    let totalVisibleReports = 0;
    let totalReports = 0;

    for (const dashId of selection.dashboardIds) {
      const dash = this.content.getDashboard(dashId);
      if (!dash) continue;

      let visibleCount = 0;
      for (const repId of dash.reportIds) {
        totalReports++;
        if (this.isReportVisible(repId, selection)) {
          visibleCount++;
          totalVisibleReports++;
        }
      }

      dashboards.push({
        id: dash.id,
        name: dash.name,
        fullyVisible: visibleCount === dash.reportIds.length,
        visibleReportCount: visibleCount,
        totalReportCount: dash.reportIds.length,
      });
    }

    // Also count standalone reports (not on any selected dashboard)
    const dashReportIds = new Set(
      selection.dashboardIds.flatMap(dId => {
        const d = this.content.getDashboard(dId);
        return d ? d.reportIds : [];
      })
    );
    for (const repId of selection.reportIds) {
      if (!dashReportIds.has(repId)) {
        totalReports++;
        if (this.isReportVisible(repId, selection)) {
          totalVisibleReports++;
        }
      }
    }

    return {
      dashboards,
      visibleReports: totalVisibleReports,
      totalReports,
    };
  }

  /**
   * A report is visible if:
   * 1. It is included in the role's reportIds
   * 2. Its view is included in the role's viewIds
   * 3. All its required fields are included in the role's fieldIds
   */
  isReportVisible(reportId: string, selection: RoleSelection): boolean {
    if (!selection.reportIds.includes(reportId)) return false;

    const report = this.content.getReport(reportId);
    if (!report) return false;

    // Check view access
    if (!selection.viewIds.includes(report.viewId)) return false;

    // Check field access — all report fields must be granted
    const allFieldsGranted = report.fieldIds.every(fId =>
      selection.fieldIds.includes(fId)
    );
    return allFieldsGranted;
  }

  /**
   * Get warnings for items in the role that are ineffective.
   */
  getWarnings(selection: RoleSelection): { message: string; fixAction?: { type: ContentItemType; ids: string[] } }[] {
    const warnings: { message: string; fixAction?: { type: ContentItemType; ids: string[] } }[] = [];

    // Check each selected report for missing view or fields
    for (const repId of selection.reportIds) {
      const report = this.content.getReport(repId);
      if (!report) continue;

      if (!selection.viewIds.includes(report.viewId)) {
        const view = this.content.getView(report.viewId);
        warnings.push({
          message: `Report "${report.name}" requires View "${view?.name}" which is not included.`,
          fixAction: { type: 'view', ids: [report.viewId] },
        });
      }

      const missingFields = report.fieldIds.filter(fId => !selection.fieldIds.includes(fId));
      if (missingFields.length > 0) {
        const fieldNames = missingFields
          .map(fId => this.content.getField(fId)?.name ?? fId)
          .join(', ');
        warnings.push({
          message: `Report "${report.name}" is missing ${missingFields.length} field(s): ${fieldNames}`,
          fixAction: { type: 'field', ids: missingFields },
        });
      }
    }

    // Check views for missing fields
    for (const viewId of selection.viewIds) {
      const view = this.content.getView(viewId);
      if (!view) continue;

      const missingFields = view.fieldIds.filter(fId => !selection.fieldIds.includes(fId));
      if (missingFields.length > 0) {
        const fieldNames = missingFields
          .map(fId => this.content.getField(fId)?.name ?? fId)
          .join(', ');
        warnings.push({
          message: `View "${view.name}" is missing ${missingFields.length} field(s): ${fieldNames}`,
          fixAction: { type: 'field', ids: missingFields },
        });
      }
    }

    return warnings;
  }

  /**
   * Get suggestions when adding a dashboard — what reports/views/fields are needed.
   */
  /**
   * Find items that are selected but either:
   * - Top-down orphaned: nothing above them in the hierarchy needs them
   * - Bottom-up broken: missing critical dependencies below them, so they can't function
   */
  getOrphanedItems(selection: RoleSelection): {
    dashboards: { id: string; name: string; reason: string }[];
    reports: { id: string; name: string; reason: string }[];
    views: { id: string; name: string; reason: string }[];
    fields: { id: string; name: string; reason: string }[];
  } {
    // === Top-down: what's needed by parents ===

    // Reports needed by selected dashboards
    const neededReportIds = new Set<string>();
    for (const dashId of selection.dashboardIds) {
      const dash = this.content.getDashboard(dashId);
      if (dash) {
        dash.reportIds.forEach(id => neededReportIds.add(id));
      }
    }

    // Views and fields needed by selected reports
    const neededViewIds = new Set<string>();
    const neededFieldIds = new Set<string>();
    for (const repId of selection.reportIds) {
      const report = this.content.getReport(repId);
      if (report) {
        neededViewIds.add(report.viewId);
        report.fieldIds.forEach(fId => neededFieldIds.add(fId));
      }
    }

    // Fields needed by selected views
    for (const viewId of selection.viewIds) {
      const view = this.content.getView(viewId);
      if (view) {
        view.fieldIds.forEach(fId => neededFieldIds.add(fId));
      }
    }

    // === Bottom-up: what's broken because children are missing ===

    // Dashboards where none of their reports are selected
    const orphanedDashboards = selection.dashboardIds
      .filter(id => {
        const dash = this.content.getDashboard(id);
        if (!dash) return false;
        return !dash.reportIds.some(rId => selection.reportIds.includes(rId));
      })
      .map(id => {
        const d = this.content.getDashboard(id)!;
        return { id, name: d.name, reason: 'None of its reports are selected' };
      });

    // Reports: top-down orphaned OR bottom-up broken (view missing)
    const orphanedReportIds = new Set<string>();
    const orphanedReports: { id: string; name: string; reason: string }[] = [];

    for (const repId of selection.reportIds) {
      const report = this.content.getReport(repId);
      if (!report) continue;

      if (!neededReportIds.has(repId)) {
        orphanedReportIds.add(repId);
        orphanedReports.push({ id: repId, name: report.name, reason: 'Not used by any selected dashboard' });
      } else if (!selection.viewIds.includes(report.viewId)) {
        const view = this.content.getView(report.viewId);
        orphanedReportIds.add(repId);
        orphanedReports.push({ id: repId, name: report.name, reason: `Requires "${view?.name}" view which is not selected` });
      }
    }

    // Views: top-down orphaned OR bottom-up broken (no fields selected)
    const orphanedViewIds = new Set<string>();
    const orphanedViews: { id: string; name: string; reason: string }[] = [];

    for (const viewId of selection.viewIds) {
      const view = this.content.getView(viewId);
      if (!view) continue;

      if (!neededViewIds.has(viewId)) {
        orphanedViewIds.add(viewId);
        orphanedViews.push({ id: viewId, name: view.name, reason: 'Not used by any selected report' });
      } else {
        const grantedFieldCount = view.fieldIds.filter(fId => selection.fieldIds.includes(fId)).length;
        if (grantedFieldCount === 0) {
          orphanedViewIds.add(viewId);
          orphanedViews.push({ id: viewId, name: view.name, reason: 'None of its fields are selected' });
        }
      }
    }

    // Fields: top-down orphaned only
    const orphanedFields = selection.fieldIds
      .filter(id => !neededFieldIds.has(id))
      .map(id => {
        const f = this.content.getField(id);
        return { id, name: f?.name ?? id, reason: 'Not used by any selected report or view' };
      });

    return { dashboards: orphanedDashboards, reports: orphanedReports, views: orphanedViews, fields: orphanedFields };
  }

  getSuggestionsForDashboard(dashboardId: string, selection: RoleSelection): {
    reports: { id: string; name: string; included: boolean }[];
    views: { id: string; name: string; included: boolean }[];
    fields: { id: string; name: string; included: boolean }[];
  } {
    const dash = this.content.getDashboard(dashboardId);
    if (!dash) return { reports: [], views: [], fields: [] };

    const reportsNeeded = dash.reportIds.map(rId => {
      const r = this.content.getReport(rId);
      return { id: rId, name: r?.name ?? rId, included: selection.reportIds.includes(rId) };
    });

    const viewIdsNeeded = new Set<string>();
    const fieldIdsNeeded = new Set<string>();

    for (const rId of dash.reportIds) {
      const report = this.content.getReport(rId);
      if (report) {
        viewIdsNeeded.add(report.viewId);
        report.fieldIds.forEach(fId => fieldIdsNeeded.add(fId));
      }
    }

    const viewsNeeded = Array.from(viewIdsNeeded).map(vId => {
      const v = this.content.getView(vId);
      return { id: vId, name: v?.name ?? vId, included: selection.viewIds.includes(vId) };
    });

    const fieldsNeeded = Array.from(fieldIdsNeeded).map(fId => {
      const f = this.content.getField(fId);
      return { id: fId, name: f?.name ?? fId, included: selection.fieldIds.includes(fId) };
    });

    return { reports: reportsNeeded, views: viewsNeeded, fields: fieldsNeeded };
  }
}
