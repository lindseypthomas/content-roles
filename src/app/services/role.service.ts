import { Injectable, signal, computed } from '@angular/core';
import { ContentUserRole } from '../models/content.models';
import { MOCK_ROLES } from './mock-data';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private rolesSignal = signal<ContentUserRole[]>([...MOCK_ROLES]);

  readonly roles = computed(() => this.rolesSignal());

  getRole(id: string): ContentUserRole | undefined {
    return this.rolesSignal().find(r => r.id === id);
  }

  createRole(role: Omit<ContentUserRole, 'id'>): ContentUserRole {
    const newRole: ContentUserRole = {
      ...role,
      id: 'role' + Date.now(),
    };
    this.rolesSignal.update(roles => [...roles, newRole]);
    return newRole;
  }

  updateRole(role: ContentUserRole): void {
    this.rolesSignal.update(roles =>
      roles.map(r => (r.id === role.id ? { ...role } : r))
    );
  }

  deleteRole(id: string): void {
    this.rolesSignal.update(roles => roles.filter(r => r.id !== id));
  }
}
