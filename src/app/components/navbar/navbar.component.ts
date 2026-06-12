import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';

type OpenMenu = 'catalogo' | 'admin' | 'cuenta' | null;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private router = inject(Router);

  open = signal<OpenMenu>(null);

  readonly currentUser = this.auth.currentUser;
  readonly cartCount = this.cart.count;

  isOpen(menu: OpenMenu): boolean {
    return this.open() === menu;
  }

  toggle(menu: OpenMenu): void {
    this.open.set(this.open() === menu ? null : menu);
  }

  closeAll(): void {
    this.open.set(null);
  }

  logout(): void {
    this.auth.logout();
    this.closeAll();
    this.router.navigate(['/']);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAll();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (!target.closest('.nav-dropdown')) this.closeAll();
  }
}
