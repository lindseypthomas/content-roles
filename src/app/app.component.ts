import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen">
      <header class="bg-white shadow-sm border-b border-gray-200 px-6 py-3">
        <h1 class="text-xl font-semibold text-gray-800">Content User Roles</h1>
      </header>
      <main class="p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {}
