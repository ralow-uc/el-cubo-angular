import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  matchControlValidator,
  passwordValidator,
} from '../../validators/password.validator';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.component.html',
})
export class RecoverPasswordComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  step: 'email' | 'newPassword' | 'done' = 'email';
  alertMsg: string | null = null;
  verifiedEmail = '';

  emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, passwordValidator]],
    passwordConfirm: ['', [Validators.required, matchControlValidator('password')]],
  });

  submitEmail(): void {
    this.alertMsg = null;
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const email = this.emailForm.controls.email.value.trim();
    const user = this.auth.findByLogin(email);
    if (!user) {
      this.alertMsg = 'No encontramos una cuenta con ese correo.';
      return;
    }
    this.verifiedEmail = email;
    this.step = 'newPassword';
  }

  submitPassword(): void {
    this.alertMsg = null;
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    try {
      this.auth.setPasswordByEmail(
        this.verifiedEmail,
        this.passwordForm.controls.password.value
      );
      this.step = 'done';
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }

  errorPassword(field: 'password' | 'passwordConfirm'): string | null {
    const ctrl = this.passwordForm.controls[field];
    if (ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['password']) return e['password'];
    if (e['match']) return 'Las contraseñas no coinciden.';
    return 'Valor inválido.';
  }
}
