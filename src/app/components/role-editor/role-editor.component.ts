import { Component, inject, signal, computed, OnInit } from '@angular/core';
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
import { ContentUserRole } from '../../models/content.models';
import { DashboardTabComponent } from './tabs/dashboard-tab/dashboard-tab.component';
import { ReportTabComponent } from './tabs/report-tab/report-tab.component';
import { ViewTabComponent } from './tabs/view-tab/view-tab.component';
import { FieldTabComponent } from './tabs/field-tab/field-tab.component';
import { InsightsTabComponent } from './tabs/insights-tab/insights-tab.component';
import { MetricGroupsTabComponent } from './tabs/metric-groups-tab/metric-groups-tab.component';
import { HeatmapsTabComponent } from './tabs/heatmaps-tab/heatmaps-tab.component';
import { MetricTilesTabComponent } from './tabs/metric-tiles-tab/metric-tiles-tab.component';
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
    HeatmapsTabComponent,
    MetricTilesTabComponent,
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
          {{ isNew() ? 'Add new role' : 'Edit Role' }}
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
            <p
