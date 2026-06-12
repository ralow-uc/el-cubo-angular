import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { formatCLP } from '../../services/storage.util';

interface CheckoutForm {
  receiver: string;
  shipAddress: string;
  city: string;
  phone: string;
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  readonly lines = this.cart.lines;
  readonly total = this.cart.total;
  readonly formatCLP = formatCLP;

  model: CheckoutForm = {
    receiver: '',
    shipAddress: '',
    city: '',
    phone: '',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  };
  errors: Partial<Record<keyof CheckoutForm, string>> = {};
  alertMsg: string | null = null;
  success: Order | null = null;

  ngOnInit(): void {
    const me = this.auth.currentUser();
    if (me) {
      this.model.receiver = me.fullName;
      this.model.shipAddress = me.address ?? '';
      this.model.cardName = me.fullName;
    }
    if (this.lines().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  fillDummy(): void {
    const me = this.auth.currentUser();
    this.model = {
      receiver: me?.fullName ?? 'Cliente Demo',
      shipAddress: me?.address || 'Av. Apoquindo 4501',
      city: 'Las Condes',
      phone: '912345678',
      cardName: me?.fullName ?? 'Cliente Demo',
      cardNumber: '4111 1111 1111 1111',
      cardExpiry: '12/28',
      cardCvv: '123',
    };
  }

  submit(_form: NgForm): void {
    this.alertMsg = null;
    this.errors = {};

    if (!this.model.receiver.trim()) this.errors.receiver = 'Ingresa el nombre de quien recibe.';
    if (!this.model.shipAddress.trim()) this.errors.shipAddress = 'Ingresa la dirección de despacho.';
    if (!this.model.city.trim()) this.errors.city = 'Ingresa la comuna.';

    const phoneDigits = this.model.phone.replace(/\D/g, '');
    if (phoneDigits.length < 8 || phoneDigits.length > 12) {
      this.errors.phone = 'Teléfono inválido (8-12 dígitos).';
    }

    if (!this.model.cardName.trim()) this.errors.cardName = 'Ingresa el nombre del titular.';

    const cardDigits = this.model.cardNumber.replace(/\D/g, '');
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      this.errors.cardNumber = 'Debe tener 13-19 dígitos.';
    }

    const expMatch = this.model.cardExpiry.match(/^(\d{2})\/(\d{2})$/);
    if (!expMatch) {
      this.errors.cardExpiry = 'Usa el formato MM/AA.';
    } else {
      const mm = parseInt(expMatch[1], 10);
      const yy = parseInt(expMatch[2], 10);
      const now = new Date();
      const curYY = now.getFullYear() % 100;
      const curMM = now.getMonth() + 1;
      if (mm < 1 || mm > 12) this.errors.cardExpiry = 'Mes inválido.';
      else if (yy < curYY || (yy === curYY && mm < curMM))
        this.errors.cardExpiry = 'La tarjeta está vencida.';
    }

    const cvvDigits = this.model.cardCvv.replace(/\D/g, '');
    if (cvvDigits.length < 3 || cvvDigits.length > 4) {
      this.errors.cardCvv = '3 o 4 dígitos.';
    }

    if (Object.keys(this.errors).length > 0) return;

    try {
      this.success = this.orderService.place();
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
