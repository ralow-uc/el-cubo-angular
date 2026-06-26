import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Página de inicio de sesión.
 *
 * Usa Reactive Forms con dos campos (`login`, `password`). Si la sesión
 * ya está activa redirige al home automáticamente. Tras un login exitoso
 * navega al panel admin o al home según el rol del usuario.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  alertMsg: string | null = null;

  constructor() {
    if (this.auth.session()) {
      this.router.navigate(['/']);
    }
  }

  /** Maneja el submit del formulario: autentica y redirige según rol. */
  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { login, password } = this.form.getRawValue();
    try {
      const user = this.auth.login(login, password);
      this.router.navigate([user.role === 'admin' ? '/admin' : '/']);
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
