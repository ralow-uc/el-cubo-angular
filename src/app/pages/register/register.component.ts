import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  ageValidator,
  matchControlValidator,
  passwordValidator,
} from '../../validators/password.validator';

/**
 * Página de registro de usuario nuevo.
 *
 * Implementa Reactive Forms con todas las validaciones de la pauta:
 * email válido, password 6-18 con mayúscula + número, confirmación de
 * password, edad mínima de 13 años y dirección de despacho opcional.
 *
 * Incluye botones de enviar y limpiar, y un atajo de desarrollo para
 * rellenar con datos dummy (útil para QA manual).
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  alertMsg: string | null = null;
  success: { email: string; username: string; timestamp: string } | null = null;

  readonly maxBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split('T')[0];
  })();
  readonly minBirthdate = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 120);
    return d.toISOString().split('T')[0];
  })();

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, passwordValidator]],
    passwordConfirm: ['', [Validators.required, matchControlValidator('password')]],
    birthdate: ['', [Validators.required, ageValidator]],
    /** La pauta indica que la dirección de despacho es opcional. */
    address: [''],
  });

  get f() {
    return this.form.controls;
  }

  /** Rellena el formulario con datos válidos al azar (atajo de desarrollo). */
  fillDummy(): void {
    const rand = Math.random().toString(36).slice(2, 5);
    this.form.setValue({
      fullName: 'Raúl Low',
      username: 'raullow_' + rand,
      email: 'raul.low+' + rand + '@example.com',
      password: 'Cubo2026!',
      passwordConfirm: 'Cubo2026!',
      birthdate: '2000-05-15',
      address: 'Av. Providencia 1234, Santiago',
    });
  }

  /** Limpia todos los campos del formulario y cualquier alerta visible. */
  clear(): void {
    this.form.reset();
    this.alertMsg = null;
  }

  startAgain(): void {
    this.success = null;
    this.clear();
  }

  errorOf(controlName: keyof typeof this.form.controls): string | null {
    const ctrl = this.form.controls[controlName];
    if (!ctrl || ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['pattern'] && controlName === 'username') return 'No puede contener espacios.';
    if (e['email']) return 'El formato del correo no es válido.';
    if (e['password']) return e['password'];
    if (e['match']) return 'Las contraseñas no coinciden.';
    if (e['age']) return e['age'];
    return 'Valor inválido.';
  }

  /**
   * @description
   * Maneja el submit del formulario de registro:
   *  1. Marca los controles como `touched` si hay errores.
   *  2. Llama a `AuthService.create()` con los datos validados.
   *  3. Muestra la pantalla de éxito o asigna el error al control específico.
   *
   * @returns void
   *
   * @usageNotes
   * Se conecta desde el template:
   * ```html
   * <form [formGroup]="form" (ngSubmit)="submit()">
   * ```
   */
  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    try {
      this.auth.create({
        fullName: v.fullName,
        username: v.username,
        email: v.email,
        password: v.password,
        birthdate: v.birthdate,
        address: v.address,
        role: 'cliente',
      });
      this.success = {
        email: v.email,
        username: v.username,
        timestamp: new Date().toLocaleString('es-CL', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      };
      this.form.reset();
    } catch (err) {
      const msg = (err as Error).message;
      if (/usuario/i.test(msg)) {
        this.form.controls.username.setErrors({ taken: msg });
      } else if (/correo/i.test(msg)) {
        this.form.controls.email.setErrors({ taken: msg });
      } else {
        this.alertMsg = msg;
      }
    }
  }
}
