import { Component, inject, input, output, computed } from '@angular/core';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { DependencyService, RoleSelection } from '../../services/dependency.service';
import { ContentService } from '../../services/content.service';
import { ContentItemType } from '../../models/content.models';

@Component({
  selector: 'app-dependency-panel',
  imports: [PanelModule, ButtonModule, MessageModule, DividerModule, TagModule, FormsModule],
  template: `
    <p-panel header="Dependencies" styleClass="h-full">
      <!-- Suggestions based on all selected dashboards -->
      @if (suggestions(); as sugg) {
        @if (sugg.hasDashboards) {
          @for (group of sugg.groups; track group.dashboardId) {
            <div class="mb-3">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">
                <i class="pi pi-info-circle text-blue-500 mr-1"></i>
                "{{ group.dashboardName }}" uses:
              </h4>

              @if (group.missingReports.length > 0) {
                <div class="mb-2">
                  <div class="text-xs font-medium text-gray-500 mb-1">Reports</div>
                  @for (item of group.missingReports; track item.id) {
                    <div class="flex items-center gap-2 py-1 px-2 bg-blue-50 rounded mb-1 cursor-pointer hover:bg-blue-100 transition-colors"
                         (click)="addSingleItem('report', item.id)">
                      <i class="pi pi-plus-circle text-blue-500 text-xs"></i>
                      <span class="text-sm flex-1">{{ item.name }}</span>
                    </div>
                  }
                </div>
              }

              @if (group.missingViews.length > 0) {
                <div class="mb-2">
                  <div class="text-xs font-medium text-gray-500 mb-1">Views</div>
                  @for (item of group.missingViews; track item.id) {
                    <div class="flex items-center gap-2 py-1 px-2 bg-blue-50 rounded mb-1 cursor-pointer hover:bg-blue-100 transition-colors"
                         (click)="addSingleItem('view', item.id)">
                      <i class="pi pi-plus-circle text-blue-500 text-xs"></i>
                      <span class="text-sm flex-1">{{ item.name }}</span>
                    </div>
                  }
                </div>
              }

              @if (group.missingFields.length > 0) {
                <div class="mb-2">
                  <div class="text-xs font-medium text-gray-500 mb-1">Fields ({{ group.missingFields.length }})</div>
                  @for (item of group.missingFields; track item.id) {
                    <div class="flex items-center gap-2 py-1 px-2 bg-blue-50 rounded mb-1 cursor-pointer hover:bg-blue-100 transition-colors"
                         (click)="addSingleItem('field', item.id)">
                      <i class="pi pi-plus-circle text-blue-500 text-xs"></i>
                      <span class="text-sm flex-1">{{ item.name }}</span>
                    </div>
                  }
                </div>
              }

              @if (group.missingReports.length === 0 && group.missingViews.length === 0 && group.missingFields.length === 0) {
                <p-message severity="success" text="All dependencies satisfied" styleClass="w-full mb-2" />
              }
            </div>
          }

          @if (sugg.totalMissing > 0) {
            <p-button label="Add All Suggested ({{ sugg.totalMissing }})" icon="pi pi-plus" size="small"
                      severity="info" styleClass="w-full"
                      (onClick)="addAllSuggested()" />
          }
        }
      }

      <!-- Warnings for current selection -->
      @if (warnings().length > 0) {
        <div class="mb-3 mt-3">
          <h4 class="text-sm font-semibold text-gray-700 mb-2">
            <i class="pi pi-exclamation-triangle text-amber-500 mr-1"></i>
            Warnings ({{ warnings().length }})
          </h4>
          @for (warning of warnings(); track $index) {
            <div class="mb-2 p-2 bg-amber-50 rounded border border-amber-200">
              <p class="text-sm text-amber-800 mb-1">{{ warning.message }}</p>
              @if (warning.fixAction) {
                <p-button [label]="'Add missing ' + warning.fixAction.type + '(s)'"
                          icon="pi pi-plus" size="small" severity="warn" [text]="true"
                          (onClick)="quickFix(warning.fixAction)" />
              }
            </div>
          }
        </div>
      }

      <!-- No activity state -->
      @if (!suggestions()?.hasDashboards && warnings().length === 0 && (orphans()?.total ?? 0) === 0) {
        <div class="text-center py-8 text-gray-400">
          <i class="pi pi-link text-3xl mb-2 block"></i>
          <p class="text-sm">Select content to see dependency information</p>
        </div>
      }
    </p-panel>
  `,
})
export class DependencyPanelComponent {
  private dependencyService = inject(DependencyService);
  private contentService = inject(ContentService);

  roleSelection = input<RoleSelection>({ dashboardIds: [], reportIds: [], viewIds: [], fieldIds: [] });
  lastAction = input<{ type: 'add' | 'remove'; itemType: string; itemId: string } | null>(null);
  addItems = output<{ type: string; ids: string[] }>();
  removeItems = output<{ type: string; ids: string[] }>();
  removeConfirmed = output<{ type: string; id: string }>();

  suggestions = computed(() => {
    const sel = this.roleSelection();
    if (sel.dashboardIds.length === 0) {
      return { hasDashboards: false, groups: [], totalMissing: 0, allMissingReports: [], allMissingViews: [], allMissingFields: [] };
    }

    const allMissingReportIds = new Set<string>();
    const allMissingViewIds = new Set<string>();
    const allMissingFieldIds = new Set<string>();

    const groups = sel.dashboardIds.map(dashId => {
      const sugg = this.dependencyService.getSuggestionsForDashboard(dashId, sel);
      const dash = this.contentService.getDashboard(dashId);

      const missingReports = sugg.reports.filter(r => !r.included);
      const missingViews = sugg.views.filter(v => !v.included);
      const missingFields = sugg.fields.filter(f => !f.included);

      missingReports.forEach(r => allMissingReportIds.add(r.id));
      missingViews.forEach(v => allMissingViewIds.add(v.id));
      missingFields.forEach(f => allMissingFieldIds.add(f.id));

      return {
        dashboardId: dashId,
        dashboardName: dash?.name ?? dashId,
        missingReports,
        missingViews,
        missingFields,
      };
    });

    // Only show groups that actually have missing items
    const groupsWithMissing = groups.filter(
      g => g.missingReports.length > 0 || g.missingViews.length > 0 || g.missingFields.length > 0
    );
    // Also show groups that are fully satisfied (so user sees confirmation)
    const groupsFullySatisfied = groups.filter(
      g => g.missingReports.length === 0 && g.missingViews.length === 0 && g.missingFields.length === 0
    );

    const totalMissing = allMissingReportIds.size + allMissingViewIds.size + allMissingFieldIds.size;

    return {
      hasDashboards: true,
      groups: [...groupsWithMissing, ...groupsFullySatisfied],
      totalMissing,
      allMissingReports: Array.from(allMissingReportIds),
      allMissingViews: Array.from(allMissingViewIds),
      allMissingFields: Array.from(allMissingFieldIds),
    };
  });

  warnings = computed(() => {
    return this.dependencyService.getWarnings(this.roleSelection());
  });

  orphans = computed(() => {
    const sel = this.roleSelection();
    const orphaned = this.dependencyService.getOrphanedItems(sel);
    const total = orphaned.dashboards.length + orphaned.reports.length + orphaned.views.length + orphaned.fields.length;
    return { ...orphaned, total };
  });

  addAllSuggested(): void {
    const sugg = this.suggestions();
    if (!sugg) return;

    if (sugg.allMissingReports.length > 0) {
      this.addItems.emit({ type: 'report', ids: sugg.allMissingReports });
    }
    if (sugg.allMissingViews.length > 0) {
      this.addItems.emit({ type: 'view', ids: sugg.allMissingViews });
    }
    if (sugg.allMissingFields.length > 0) {
      this.addItems.emit({ type: 'field', ids: sugg.allMissingFields });
    }
  }

  addSingleItem(type: string, id: string): void {
    this.addItems.emit({ type, ids: [id] });
  }

  quickFix(fixAction: { type: ContentItemType; ids: string[] }): void {
    this.addItems.emit({ type: fixAction.type, ids: fixAction.ids });
  }
}
