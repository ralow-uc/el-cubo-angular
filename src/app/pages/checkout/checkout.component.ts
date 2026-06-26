import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';
import { formatCLP } from '../../services/storage.util';
import { cardExpiryValidator } from '../../validators/password.validator';

/**
 * Página de pago simulado.
 *
 * Recoge datos de despacho y de tarjeta con validaciones (dígitos, formato
 * MM/AA, CVV de 3-4) y, si todo es válido, genera la orden vía OrderService
 * y muestra la pantalla de éxito con el id del pedido.
 *
 * No se conecta a ninguna pasarela real: el pago se simula.
 */
@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  readonly lines = this.cart.lines;
  readonly total = this.cart.total;
  readonly formatCLP = formatCLP;

  alertMsg: string | null = null;
  success: Order | null = null;

  form = this.fb.nonNullable.group({
    receiver: ['', [Validators.required]],
    shipAddress: ['', [Validators.required]],
    city: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){8,12}$/)]],
    cardName: ['', [Validators.required]],
    cardNumber: ['', [Validators.required, Validators.pattern(/^\D*(\d\D*){13,19}$/)]],
    cardExpiry: ['', [Validators.required, cardExpiryValidator]],
    cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  ngOnInit(): void {
    const me = this.auth.currentUser();
    if (me) {
      this.form.patchValue({
        receiver: me.fullName,
        shipAddress: me.address ?? '',
        cardName: me.fullName,
      });
    }
    if (this.lines().length === 0) {
      this.router.navigate(['/carrito']);
    }
  }

  get f() {
    return this.form.controls;
  }

  errorOf(name: keyof typeof this.form.controls): string | null {
    const ctrl = this.form.controls[name];
    if (ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['pattern'] && name === 'phone') return 'Teléfono inválido (8-12 dígitos).';
    if (e['pattern'] && name === 'cardNumber') return 'Debe tener 13-19 dígitos.';
    if (e['pattern'] && name === 'cardCvv') return '3 o 4 dígitos.';
    if (e['cardExpiry']) return e['cardExpiry'];
    return 'Valor inválido.';
  }

  fillDummy(): void {
    const me = this.auth.currentUser();
    this.form.setValue({
      receiver: me?.fullName ?? 'Cliente Demo',
      shipAddress: me?.address || 'Av. Apoquindo 4501',
      city: 'Las Condes',
      phone: '912345678',
      cardName: me?.fullName ?? 'Cliente Demo',
      cardNumber: '4111 1111 1111 1111',
      cardExpiry: '12/28',
      cardCvv: '123',
    });
  }

  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.success = this.orderService.place();
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
