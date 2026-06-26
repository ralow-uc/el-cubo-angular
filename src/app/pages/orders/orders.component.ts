import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { formatCLP, formatDate } from '../../services/storage.util';

/** Historial de pedidos del usuario logueado. Solo lectura. */
@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  private orderService = inject(OrderService);

  readonly orders = this.orderService.byUser();
  readonly formatCLP = formatCLP;
  readonly formatDate = formatDate;
}
