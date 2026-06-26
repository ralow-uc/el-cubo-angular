import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';

/**
 * Componente raíz de la aplicación.
 *
 * Compone el layout global: navbar arriba, contenido enrutado al medio
 * (`router-outlet`), footer abajo, y un contenedor de toasts flotante.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <app-toast></app-toast>
  `,
  styles: [],
})
export class AppComponent {}
