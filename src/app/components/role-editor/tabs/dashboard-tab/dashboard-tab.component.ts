import { Component, inject, input, output, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../services/content.service';
import { DependencyService, RoleSelection } from '../../../../services/dependency.service';

@Component({
  selector: 'app-dashboard-tab',
  imports: [TableModule, CheckboxModule, TagModule, FormsModule],
  template: `
    <p-table [value]="dashboardRows()" [tableStyle]="{ 'min-width': '40rem' }"
             styleClass="p-datatable-sm">
      <ng-template #header>
        <tr>
          <th style="width: 3rem"></th>
          <th>Dashboard</th>
          <th>Description</th>
          <th>Reports</th>
          <th>Status</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>
            <p-checkbox [binary]="true" [ngModel]="row.selected"
                        (ngModelChange)="toggleDashboard(row.id, $event)" />
          </td>
          <td class="font-medium">{{ row.name }}</td>
          <td class="text-gray-600 text-sm">{{ row.description }}</td>
          <td>{{ row.reportCount }} reports</td>
          <td>
            @if (row.selected) {
              @if (row.fullyVisible) {
                <p-tag value="Full Access" severity="success" icon="pi pi-check" />
              } @else {
                <p-tag value="Partial" severity="warn" icon="pi pi-exclamation-triangle" />
              }
            } @else {
              <p-tag value="Not Included" severity="secondary" />
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class DashboardTabComponent {
  private contentService = inject(ContentService);
  private dependencyService = inject(DependencyService);

  selectedIds = input<string[]>([]);
  roleSelection = input<RoleSelection>({ dashboardIds: [], reportIds: [], viewIds: [], fieldIds: [] });
  selectionChange = output<{ ids: string[]; added?: string; removed?: string }>();

  dashboardRows = computed(() => {
    const dashboards = this.contentService.getDashboards();
    const selected = this.selectedIds();
    const sel = this.roleSelection();
    const effective = this.dependencyService.getEffectiveAccess(sel);

    return dashboards.map(d => {
      const isSelected = selected.includes(d.id);
      const effDash = effective.dashboards.find(ed => ed.id === d.id);
      return {
        id: d.id,
        name: d.name,
        description: d.description,
        reportCount: d.reportIds.length,
        selected: isSelected,
        fullyVisible: effDash?.fullyVisible ?? false,
      };
    });
  });

  toggleDashboard(id: string, checked: boolean): void {
    const current = this.selectedIds();
    if (checked) {
      this.selectionChange.emit({ ids: [...current, id], added: id });
    } else {
      this.selectionChange.emit({ ids: current.filter(i => i !== id), removed: id });
    }
  }
}
