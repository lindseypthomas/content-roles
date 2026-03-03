import { Component, inject, input, output, computed, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { ContentService } from '../../../../services/content.service';
import { DependencyService, RoleSelection } from '../../../../services/dependency.service';

@Component({
  selector: 'app-report-tab',
  imports: [TableModule, CheckboxModule, TagModule, FormsModule, MultiSelectModule],
  template: `
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">Filter by Type:</label>
      <p-multiSelect [options]="reportTypeOptions()" 
                     [ngModel]="selectedTypes()"
                     (ngModelChange)="onTypeFilterChange($event)"
                     optionLabel="label" 
                     optionValue="value"
                     placeholder="All Types"
                     class="w-full md:w-64" />
    </div>
    <p-table [value]="filteredReportRows()" [tableStyle]="{ 'min-width': '50rem' }"
             styleClass="p-datatable-sm">
      <ng-template #header>
        <tr>
          <th style="width: 3rem"></th>
          <th>Report</th>
          <th>Type</th>
          <th>Company</th>
          <th>Description</th>
          <th>View</th>
          <th>Fields</th>
          <th>Status</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>
            <p-checkbox [binary]="true" [ngModel]="row.selected"
                        (ngModelChange)="toggleReport(row.id, $event)" />
          </td>
          <td class="font-medium">{{ row.name }}</td>
          <td>
            <p-tag [value]="row.type" [severity]="getTypeSeverity(row.type)" />
          </td>
          <td class="text-sm">{{ row.company }}</td>
          <td class="text-gray-600 text-sm">{{ row.description }}</td>
          <td>
            <span class="text-sm">{{ row.viewName }}</span>
            @if (row.selected && !row.viewIncluded) {
              <i class="pi pi-exclamation-triangle text-amber-500 ml-1" title="View not included"></i>
            }
          </td>
          <td class="text-sm">{{ row.fieldCount }} fields ({{ row.missingFieldCount }} missing)</td>
          <td>
            @if (row.selected) {
              @if (row.fullyVisible) {
                <p-tag value="Visible" severity="success" icon="pi pi-check" />
              } @else {
                <p-tag value="Incomplete" severity="warn" icon="pi pi-exclamation-triangle" />
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
export class ReportTabComponent {
  private contentService = inject(ContentService);
  private dependencyService = inject(DependencyService);

  selectedIds = input<string[]>([]);
  roleSelection = input<RoleSelection>({ dashboardIds: [], reportIds: [], viewIds: [], fieldIds: [] });
  selectionChange = output<{ ids: string[]; added?: string; removed?: string }>();
  
  selectedTypes = signal<string[]>([]);

  reportTypeOptions = computed(() => [
    { label: 'Metric Report', value: 'Metric Report' },
    { label: 'Metric Tile', value: 'Metric Tile' },
    { label: 'Heatmap', value: 'Heatmap' },
    { label: 'Report', value: 'Report' },
  ]);

  reportRows = computed(() => {
    const reports = this.contentService.getReports();
    const selected = this.selectedIds();
    const sel = this.roleSelection();

    return reports.map(r => {
      const isSelected = selected.includes(r.id);
      const viewIncluded = sel.viewIds.includes(r.viewId);
      const view = this.contentService.getView(r.viewId);
      const missingFields = r.fieldIds.filter(fId => !sel.fieldIds.includes(fId));
      const fullyVisible = isSelected && viewIncluded && missingFields.length === 0;

      return {
        id: r.id,
        name: r.name,
        description: r.description,
        type: r.type || 'Report',
        company: r.company || 'Unknown',
        viewName: view?.name ?? r.viewId,
        viewIncluded,
        fieldCount: r.fieldIds.length,
        missingFieldCount: isSelected ? missingFields.length : 0,
        selected: isSelected,
        fullyVisible,
      };
    });
  });

  filteredReportRows = computed(() => {
    const types = this.selectedTypes();
    const rows = this.reportRows();
    
    if (types.length === 0) {
      return rows;
    }
    
    return rows.filter(row => types.includes(row.type));
  });

  getTypeSeverity(type: string): 'info' | 'success' | 'warning' | 'danger' | 'secondary' {
    switch(type) {
      case 'Metric Report': return 'info';
      case 'Metric Tile': return 'success';
      case 'Heatmap': return 'warning';
      case 'Report': return 'secondary';
      default: return 'secondary';
    }
  }

  onTypeFilterChange(types: string[]): void {
    this.selectedTypes.set(types || []);
  }

  toggleReport(id: string, checked: boolean): void {
    const current = this.selectedIds();
    if (checked) {
      this.selectionChange.emit({ ids: [...current, id], added: id });
    } else {
      this.selectionChange.emit({ ids: current.filter(i => i !== id), removed: id });
    }
  }
}
