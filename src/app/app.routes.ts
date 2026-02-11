import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'roles', pathMatch: 'full' },
  {
    path: 'roles',
    loadComponent: () =>
      import('./components/role-list/role-list.component').then(m => m.RoleListComponent),
  },
  {
    path: 'roles/new',
    loadComponent: () =>
      import('./components/role-editor/role-editor.component').then(m => m.RoleEditorComponent),
  },
  {
    path: 'roles/:id/edit',
    loadComponent: () =>
      import('./components/role-editor/role-editor.component').then(m => m.RoleEditorComponent),
  },
];
