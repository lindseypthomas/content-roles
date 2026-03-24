import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-role-list',
  imports: [TableModule, ButtonModule, ConfirmDialogModule, TagModule],
  providers: [ConfirmationService],
  template: `
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-gray-800">Content User Roles</h2>
      <p-button label="Create Role" icon="pi pi-plus" (onClick)="createRole()" />
    </div>

    <p-table [value]="roles()" [tableStyle]="{ 'min-width': '60rem' }"
             stripedRows styleClass="p-datatable-sm">
      <ng-template #header>
        <tr>
          <th>Name</th>
          <th>Dashboards</th>
          <th>Reports</th>
          <th>Views</th>
          <th>Fields</th>
          <th>Insights</th>
          <th>Metric Groups</th>
          <th style="width: 10rem">Actions</th>
        </tr>
      </ng-template>
      <ng-template #body let-role>
        <tr>
          <td class="font-semibold">{{ role.name }}</td>
          <td><p-tag [value]="role.dashboardIds.length + ''" severity="info" /></td>
          <td><p-tag [value]="role.reportIds.length + ''" severity="info" /></td>
          <td><p-tag [value]="role.viewIds.length + ''" severity="info" /></td>
          <td><p-tag [value]="role.fieldIds.length + ''" severity="info" /></td>
          <td><p-tag [value]="role.insightIds.length + ''" severity="info" /></td>
          <td><p-tag [value]="role.metricGroupIds.length + ''" severity="info" /></td>
          <td>
            <div class="flex gap-2">
              <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
                        severity="info" (onClick)="editRole(role.id)" />
              <p-button icon="pi pi-trash" [rounded]="true" [text]="true"
                        severity="danger" (onClick)="confirmDelete(role)" />
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td colspan="8" class="text-center py-8 text-gray-500">
            No roles defined. Click "Create Role" to get started.
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-confirmDialog />
  `,
})
export class RoleListComponent {
  private router = inject(Router);
  private roleService = inject(RoleService);
  private confirmationService = inject(ConfirmationService);

  roles = computed(() => this.roleService.roles());

  createRole(): void {
    this.router.navigate(['/roles/new']);
  }

  editRole(id: string): void {
    this.router.navigate(['/roles', id, 'edit']);
  }

  confirmDelete(role: { id: string; name: string }): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${role.name}"?`,
      header: 'Delete Role',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.roleService.deleteRole(role.id);
      },
    });
  }
}
