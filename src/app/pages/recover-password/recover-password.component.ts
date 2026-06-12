import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { EMAIL_RE } from '../../validators/password.validator';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recover-password.component.html',
})
export class RecoverPasswordComponent {
  private auth = inject(AuthService);

  email = '';
  emailError: string | null = null;
  alertMsg: string | null = null;
  success: { email: string; tempPassword: string } | null = null;

  submit(form: NgForm): void {
    this.alertMsg = null;
    this.emailError = null;
    const v = this.email.trim();
    if (!v) {
      this.emailError = 'Ingresa tu correo electrónico.';
      return;
    }
    if (!EMAIL_RE.test(v)) {
      this.emailError = 'El formato del correo no es válido.';
      return;
    }
    const result = this.auth.recoverPassword(v);
    if (!result) {
      this.alertMsg = 'No encontramos una cuenta con ese correo.';
      return;
    }
    this.success = { email: v, tempPassword: result.tempPassword };
    form.resetForm({ email: '' });
  }
}
