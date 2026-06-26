import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { formatCLP } from '../../../services/storage.util';

/**
 * Dashboard del panel admin. Calcula estadísticas globales del sitio
 * (productos, usuarios, pedidos, ventas, stock) en una signal `computed`
 * que se actualiza automáticamente cuando cambia cualquier servicio.
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private products = inject(ProductService);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  readonly formatCLP = formatCLP;

  readonly stats = computed(() => {
    const products = this.products.all();
    const users = this.auth.all();
    const orders = this.orderService.allByEveryUser();
    return {
      productsCount: products.length,
      lowStock: products.filter((p) => p.stock <= 3).length,
      usersCount: users.length,
      admins: users.filter((u) => u.role === 'admin').length,
      ordersCount: orders.length,
      totalSold: orders.reduce((a, o) => a + o.total, 0),
      totalStock: products.reduce((a, p) => a + p.stock, 0),
    };
  });
}
