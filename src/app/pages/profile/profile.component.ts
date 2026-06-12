import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import {
  EMAIL_RE,
  validatePasswordString,
} from '../../validators/password.validator';
import { formatDate } from '../../services/storage.util';

interface ProfileForm {
  fullName: string;
  username: string;
  email: string;
  birthdate: string;
  address: string;
  newPassword: string;
  newPasswordConfirm: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private auth = inject(AuthService);

  readonly formatDate = formatDate;
  readonly currentUser = this.auth.currentUser;

  model: ProfileForm;
  errors: Partial<Record<keyof ProfileForm, string>> = {};
  alertMsg: string | null = null;
  successMsg: string | null = null;

  constructor() {
    const me = this.auth.currentUser()!;
    this.model = this.fromUser(me);
  }

  private fromUser(u: User): ProfileForm {
    return {
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      birthdate: u.birthdate,
      address: u.address ?? '',
      newPassword: '',
      newPasswordConfirm: '',
    };
  }

  submit(form: NgForm): void {
    this.alertMsg = null;
    this.successMsg = null;
    this.errors = {};

    if (!this.model.fullName.trim()) this.errors.fullName = 'Ingresa tu nombre completo.';
    if (!this.model.username.trim()) this.errors.username = 'Elige un nombre de usuario.';
    else if (/\s/.test(this.model.username.trim())) this.errors.username = 'No puede contener espacios.';
    if (!this.model.email.trim()) this.errors.email = 'Ingresa tu correo electrónico.';
    else if (!EMAIL_RE.test(this.model.email.trim())) this.errors.email = 'Formato inválido.';
    if (!this.model.birthdate) this.errors.birthdate = 'Ingresa tu fecha de nacimiento.';

    let passwordPatch: { password?: string } = {};
    if (this.model.newPassword || this.model.newPasswordConfirm) {
      const pwdErr = validatePasswordString(this.model.newPassword);
      if (pwdErr) this.errors.newPassword = pwdErr;
      if (this.model.newPassword !== this.model.newPasswordConfirm) {
        this.errors.newPasswordConfirm = 'Las contraseñas no coinciden.';
      }
      if (!this.errors.newPassword && !this.errors.newPasswordConfirm) {
        passwordPatch = { password: this.model.newPassword };
      }
    }

    if (Object.keys(this.errors).length > 0) return;

    const me = this.auth.currentUser()!;
    try {
      this.auth.update(me.id, {
        fullName: this.model.fullName.trim(),
        username: this.model.username.trim(),
        email: this.model.email.trim(),
        birthdate: this.model.birthdate,
        address: this.model.address.trim(),
        ...passwordPatch,
      });
      this.successMsg = 'Perfil actualizado. Tus cambios se guardaron correctamente.';
      this.model.newPassword = '';
      this.model.newPasswordConfirm = '';
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
