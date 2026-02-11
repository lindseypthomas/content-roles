import { Component, inject, input, output, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../services/content.service';
import { RoleSelection } from '../../../../services/dependency.service';

@Component({
  selector: 'app-view-tab',
  imports: [TableModule, CheckboxModule, TagModule, FormsModule],
  template: `
    <p-table [value]="viewRows()" [tableStyle]="{ 'min-width': '40rem' }"
             styleClass="p-datatable-sm">
      <ng-template #header>
        <tr>
          <th style="width: 3rem"></th>
          <th>View</th>
          <th>Description</th>
          <th>Total Fields</th>
          <th>Granted Fields</th>
          <th>Used By Reports</th>
          <th>Status</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>
            <p-checkbox [binary]="true" [ngModel]="row.selected"
                        (ngModelChange)="toggleView(row.id, $event)" />
          </td>
          <td class="font-medium">{{ row.name }}</td>
          <td class="text-gray-600 text-sm">{{ row.description }}</td>
          <td>{{ row.totalFields }}</td>
          <td>
            {{ row.grantedFields }}/{{ row.totalFields }}
            @if (row.selected && row.grantedFields < row.totalFields) {
              <i class="pi pi-exclamation-triangle text-amber-500 ml-1" title="Some fields missing"></i>
            }
          </td>
          <td class="text-sm">{{ row.reportCount }} report(s)</td>
          <td>
            @if (row.selected) {
              @if (row.grantedFields === row.totalFields) {
                <p-tag value="Complete" severity="success" icon="pi pi-check" />
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
export class ViewTabComponent {
  private contentService = inject(ContentService);

  selectedIds = input<string[]>([]);
  roleSelection = input<RoleSelection>({ dashboardIds: [], reportIds: [], viewIds: [], fieldIds: [] });
  selectionChange = output<{ ids: string[]; added?: string; removed?: string }>();

  viewRows = computed(() => {
    const views = this.contentService.getViews();
    const selected = this.selectedIds();
    const sel = this.roleSelection();

    return views.map(v => {
      const isSelected = selected.includes(v.id);
      const grantedFields = v.fieldIds.filter(fId => sel.fieldIds.includes(fId)).length;
      const reportsUsingView = this.contentService.getReportsForView(v.id);

      return {
        id: v.id,
        name: v.name,
        description: v.description,
        totalFields: v.fieldIds.length,
        grantedFields,
        reportCount: reportsUsingView.length,
        selected: isSelected,
      };
    });
  });

  toggleView(id: string, checked: boolean): void {
    const current = this.selectedIds();
    if (checked) {
      this.selectionChange.emit({ ids: [...current, id], added: id });
    } else {
      this.selectionChange.emit({ ids: current.filter(i => i !== id), removed: id });
    }
  }
}
