import { Component, inject, input, output, computed } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { ContentService } from '../../../../services/content.service';
import { RoleSelection } from '../../../../services/dependency.service';

@Component({
  selector: 'app-field-tab',
  imports: [TableModule, CheckboxModule, TagModule, FormsModule],
  template: `
    <p-table [value]="fieldRows()" [tableStyle]="{ 'min-width': '40rem' }"
             styleClass="p-datatable-sm" [paginator]="true" [rows]="10">
      <ng-template #header>
        <tr>
          <th style="width: 3rem"></th>
          <th>Field</th>
          <th>Description</th>
          <th>Used In Views</th>
          <th>Status</th>
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          <td>
            <p-checkbox [binary]="true" [ngModel]="row.selected"
                        (ngModelChange)="toggleField(row.id, $event)" />
          </td>
          <td class="font-medium">{{ row.name }}</td>
          <td class="text-gray-600 text-sm">{{ row.description }}</td>
          <td class="text-sm">
            @for (viewName of row.viewNames; track viewName; let last = $last) {
              <span>{{ viewName }}{{ last ? '' : ', ' }}</span>
            }
          </td>
          <td>
            @if (row.selected) {
              <p-tag value="Included" severity="success" icon="pi pi-check" />
            } @else if (row.neededBySelectedReport) {
              <p-tag value="Missing" severity="danger" icon="pi pi-times" />
            } @else {
              <p-tag value="Not Included" severity="secondary" />
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class FieldTabComponent {
  private contentService = inject(ContentService);

  selectedIds = input<string[]>([]);
  roleSelection = input<RoleSelection>({ dashboardIds: [], reportIds: [], viewIds: [], fieldIds: [] });
  selectionChange = output<string[]>();

  fieldRows = computed(() => {
    const fields = this.contentService.getFields();
    const selected = this.selectedIds();
    const sel = this.roleSelection();

    // Determine which fields are needed by selected reports
    const neededFieldIds = new Set<string>();
    for (const repId of sel.reportIds) {
      const report = this.contentService.getReport(repId);
      if (report) {
        report.fieldIds.forEach(fId => neededFieldIds.add(fId));
      }
    }
    // Also needed by selected views
    for (const viewId of sel.viewIds) {
      const view = this.contentService.getView(viewId);
      if (view) {
        view.fieldIds.forEach(fId => neededFieldIds.add(fId));
      }
    }

    return fields.map(f => {
      const isSelected = selected.includes(f.id);
      const viewNames = f.viewIds
        .map(vId => this.contentService.getView(vId)?.name ?? vId);

      return {
        id: f.id,
        name: f.name,
        description: f.description,
        viewNames,
        selected: isSelected,
        neededBySelectedReport: !isSelected && neededFieldIds.has(f.id),
      };
    });
  });

  toggleField(id: string, checked: boolean): void {
    const current = this.selectedIds();
    if (checked) {
      this.selectionChange.emit([...current, id]);
    } else {
      this.selectionChange.emit(current.filter(i => i !== id));
    }
  }
}
