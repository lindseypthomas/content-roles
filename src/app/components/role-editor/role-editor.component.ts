import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TabsModule } from 'primeng/tabs';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { RoleService } from '../../services/role.service';
import { DependencyService, RoleSelection } from '../../services/dependency.service';
import { ContentUserRole, EffectiveAccess } from '../../models/content.models';
import { DashboardTabComponent } from './tabs/dashboard-tab/dashboard-tab.component';
import { ReportTabComponent } from './tabs/report-tab/report-tab.component';
import { ViewTabComponent } from './tabs/view-tab/view-tab.component';
import { FieldTabComponent } from './tabs/field-tab/field-tab.component';
import { InsightsTabComponent } from './tabs/insights-tab/insights-tab.component';
import { MetricGroupsTabComponent } from './tabs/metric-groups-tab/metric-groups-tab.component';
import { DependencyPanelComponent } from '../dependency-panel/dependency-panel.component';

@Component({
  selector: 'app-role-editor',
  imports: [
    FormsModule,
    TabsModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    BadgeModule,
    MessageModule,
    DashboardTabComponent,
    ReportTabComponent,
    ViewTabComponent,
    FieldTabComponent,
    InsightsTabComponent,
    MetricGroupsTabComponent,
    DependencyPanelComponent,
  ],
  template: `
    <p-toolbar>
      <ng-template #start>
        <h2 class="text-xl font-semibold text-gray-800 mr-4">
          {{ isNew() ? 'Create Role' : 'Edit Role' }}
        </h2>
      </ng-template>
      <ng-template #end>
        <div class="flex gap-2">
          <p-button label="Cancel" severity="secondary" [outlined]="true"
                    icon="pi pi-times" (onClick)="cancel()" />
          <p-button label="Save" icon="pi pi-check" (onClick)="save()"
                    [disabled]="!roleName()" />
        </div>
      </ng-template>
    </p-toolbar>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-4">
      <div class="flex flex-col gap-1">
        <label for="roleName" class="font-medium text-sm text-gray-700">Role Name</label>
        <input pInputText id="roleName" [ngModel]="roleName()"
               (ngModelChange)="roleName.set($event)"
               placeholder="Enter role name" class="w-full" />
      </div>
    </div>

    <div class="flex gap-4">
      <!-- Main content area with tabs -->
      <div class="flex-1 min-w-0">
        <p-tabs [value]="activeTab()" (valueChange)="activeTab.set($event + '')">
          <p-tablist>
            <p-tab value="0">
              Dashboards
              @if (selectedDashboardIds().length > 0) {
                <p-badge [value]="selectedDashboardIds().length + ''" severity="info" class="ml-2" />
              }
            </p-tab>
            <p-tab value="1">
              Reports
              @if (selectedReportIds().length > 0) {
                <p-badge [value]="selectedReportIds().length + ''" severity="info" class="ml-2" />
              }
            </p-tab>
            <p-tab value="2">
              Views
              @if (selectedViewIds().length > 0) {
                <p-badge [value]="selectedViewIds().length + ''" severity="info" class="ml-2" />
              }
            </p-tab>
            <p-tab value="3">
              Fields
              @if (selectedFieldIds().length > 0) {
                <p-badge [value]="selectedFieldIds().length + ''" severity="info" class="ml-2" />
              }
            </p-tab>
            <p-tab value="4">
              Insights
            </p-tab>
            <p-tab value="5">
              Metric Groups
            </p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="0">
              <app-dashboard-tab
                [selectedIds]="selectedDashboardIds()"
                (selectionChange)="onDashboardChange($event)"
                [roleSelection]="currentSelection()" />
            </p-tabpanel>
            <p-tabpanel value="1">
              <app-report-tab
                [selectedIds]="selectedReportIds()"
                (selectionChange)="onReportChange($event)"
                [roleSelection]="currentSelection()" />
            </p-tabpanel>
            <p-tabpanel value="2">
              <app-view-tab
                [selectedIds]="selectedViewIds()"
                (selectionChange)="onViewChange($event)"
                [roleSelection]="currentSelection()" />
            </p-tabpanel>
            <p-tabpanel value="3">
              <app-field-tab
                [selectedIds]="selectedFieldIds()"
                (selectionChange)="selectedFieldIds.set($event)"
                [roleSelection]="currentSelection()" />
            </p-tabpanel>
            <p-tabpanel value="4">
              <app-insights-tab />
            </p-tabpanel>
            <p-tabpanel value="5">
              <app-metric-groups-tab />
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>

      <!-- Dependency panel -->
      <div class="w-96 shrink-0">
        <app-dependency-panel
          [roleSelection]="currentSelection()"
          [lastAction]="lastAction()"
          (addItems)="onAddItems($event)"
          (removeItems)="onRemoveItems($event)"
          (removeConfirmed)="onRemoveConfirmed($event)" />
      </div>
    </div>

    <!-- Effective Access Summary Footer -->
    <div class="mt-4 p-4 bg-white rounded-lg border border-gray-200">
      <h3 class="text-sm font-semibold text-gray-600 mb-2">Effective Access Summary</h3>
      <div class="flex flex-wrap gap-4 text-sm">
        @for (dash of effectiveAccess().dashboards; track dash.id) {
          <div class="flex items-center gap-1">
            <i class="pi" [class]="dash.fullyVisible ? 'pi-check-circle text-green-600' : 'pi-exclamation-circle text-amber-500'"></i>
            <span>{{ dash.name }}: {{ dash.visibleReportCount }}/{{ dash.totalReportCount }} reports visible</span>
          </div>
        }
        @if (effectiveAccess().dashboards.length === 0 && selectedDashboardIds().length === 0) {
          <span class="text-gray-400">No dashboards selected</span>
        }
        <div class="ml-auto font-medium">
          Total: {{ effectiveAccess().visibleReports }}/{{ effectiveAccess().totalReports }} reports fully visible
        </div>
      </div>
    </div>
  `,
})
export class RoleEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private dependencyService = inject(DependencyService);

  isNew = signal(true);
  roleId = signal<string | null>(null);
  roleName = signal('');
  selectedDashboardIds = signal<string[]>([]);
  selectedReportIds = signal<string[]>([]);
  selectedViewIds = signal<string[]>([]);
  selectedFieldIds = signal<string[]>([]);
  selectedInsightIds = signal<string[]>([]);
  selectedMetricGroupIds = signal<string[]>([]);
  activeTab = signal('0');
  lastAction = signal<{ type: 'add' | 'remove'; itemType: string; itemId: string } | null>(null);

  currentSelection = computed<RoleSelection>(() => ({
    dashboardIds: this.selectedDashboardIds(),
    reportIds: this.selectedReportIds(),
    viewIds: this.selectedViewIds(),
    fieldIds: this.selectedFieldIds(),
  }));

  effectiveAccess = computed<EffectiveAccess>(() =>
    this.dependencyService.getEffectiveAccess(this.currentSelection())
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const role = this.roleService.getRole(id);
      if (role) {
        this.isNew.set(false);
        this.roleId.set(role.id);
        this.roleName.set(role.name);
        this.selectedDashboardIds.set([...role.dashboardIds]);
        this.selectedReportIds.set([...role.reportIds]);
        this.selectedViewIds.set([...role.viewIds]);
        this.selectedFieldIds.set([...role.fieldIds]);
        this.selectedInsightIds.set([...role.insightIds]);
        this.selectedMetricGroupIds.set([...role.metricGroupIds]);
      }
    }
  }

  onDashboardChange(event: { ids: string[]; added?: string; removed?: string }): void {
    this.selectedDashboardIds.set(event.ids);
    if (event.added) {
      this.lastAction.set({ type: 'add', itemType: 'dashboard', itemId: event.added });
    } else if (event.removed) {
      this.lastAction.set({ type: 'remove', itemType: 'dashboard', itemId: event.removed });
    }
  }

  onReportChange(event: { ids: string[]; added?: string; removed?: string }): void {
    this.selectedReportIds.set(event.ids);
    if (event.added) {
      this.lastAction.set({ type: 'add', itemType: 'report', itemId: event.added });
    } else if (event.removed) {
      this.lastAction.set({ type: 'remove', itemType: 'report', itemId: event.removed });
    }
  }

  onViewChange(event: { ids: string[]; added?: string; removed?: string }): void {
    this.selectedViewIds.set(event.ids);
    if (event.added) {
      this.lastAction.set({ type: 'add', itemType: 'view', itemId: event.added });
    } else if (event.removed) {
      this.lastAction.set({ type: 'remove', itemType: 'view', itemId: event.removed });
    }
  }

  onAddItems(event: { type: string; ids: string[] }): void {
    switch (event.type) {
      case 'report':
        this.selectedReportIds.update(ids => [...new Set([...ids, ...event.ids])]);
        break;
      case 'view':
        this.selectedViewIds.update(ids => [...new Set([...ids, ...event.ids])]);
        break;
      case 'field':
        this.selectedFieldIds.update(ids => [...new Set([...ids, ...event.ids])]);
        break;
      case 'dashboard':
        this.selectedDashboardIds.update(ids => [...new Set([...ids, ...event.ids])]);
        break;
    }
  }

  onRemoveItems(event: { type: string; ids: string[] }): void {
    const idsToRemove = new Set(event.ids);
    switch (event.type) {
      case 'report':
        this.selectedReportIds.update(ids => ids.filter(i => !idsToRemove.has(i)));
        break;
      case 'view':
        this.selectedViewIds.update(ids => ids.filter(i => !idsToRemove.has(i)));
        break;
      case 'field':
        this.selectedFieldIds.update(ids => ids.filter(i => !idsToRemove.has(i)));
        break;
      case 'dashboard':
        this.selectedDashboardIds.update(ids => ids.filter(i => !idsToRemove.has(i)));
        break;
    }
  }

  onRemoveConfirmed(event: { type: string; id: string }): void {
    switch (event.type) {
      case 'dashboard':
        this.selectedDashboardIds.update(ids => ids.filter(i => i !== event.id));
        break;
      case 'report':
        this.selectedReportIds.update(ids => ids.filter(i => i !== event.id));
        break;
      case 'view':
        this.selectedViewIds.update(ids => ids.filter(i => i !== event.id));
        break;
      case 'field':
        this.selectedFieldIds.update(ids => ids.filter(i => i !== event.id));
        break;
    }
  }

  save(): void {
    const roleData = {
      name: this.roleName(),
      dashboardIds: this.selectedDashboardIds(),
      reportIds: this.selectedReportIds(),
      viewIds: this.selectedViewIds(),
      fieldIds: this.selectedFieldIds(),
      insightIds: this.selectedInsightIds(),
      metricGroupIds: this.selectedMetricGroupIds(),
    };

    if (this.isNew()) {
      this.roleService.createRole(roleData);
    } else {
      this.roleService.updateRole({ id: this.roleId()!, ...roleData });
    }

    this.router.navigate(['/roles']);
  }

  cancel(): void {
    this.router.navigate(['/roles']);
  }
}
