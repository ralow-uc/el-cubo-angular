import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Role, User } from '../../../models/user.model';
import {
  EMAIL_RE,
  validatePasswordString,
} from '../../../validators/password.validator';
import { formatDate } from '../../../services/storage.util';

interface UserForm {
  fullName: string;
  username: string;
  email: string;
  role: Role;
  birthdate: string;
  address: string;
  password: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  private auth = inject(AuthService);

  readonly users = this.auth.users;
  readonly me = this.auth.currentUser;
  readonly formatDate = formatDate;

  open = signal(false);
  editingId: string | null = null;

  model: UserForm = this.empty();
  errors: Partial<Record<keyof UserForm, string>> = {};
  alertMsg: string | null = null;

  private empty(): UserForm {
    return {
      fullName: '',
      username: '',
      email: '',
      role: 'cliente',
      birthdate: '',
      address: '',
      password: '',
    };
  }

  openNew(): void {
    this.editingId = null;
    this.model = this.empty();
    this.errors = {};
    this.alertMsg = null;
    this.open.set(true);
  }

  openEdit(u: User): void {
    this.editingId = u.id;
    this.model = {
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      role: u.role,
      birthdate: u.birthdate,
      address: u.address ?? '',
      password: '',
    };
    this.errors = {};
    this.alertMsg = null;
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  remove(u: User): void {
    if (confirm('¿Eliminar la cuenta?')) {
      this.auth.remove(u.id);
    }
  }

  submit(_form: NgForm): void {
    this.alertMsg = null;
    this.errors = {};

    if (!this.model.fullName.trim()) this.errors.fullName = 'Ingresa el nombre.';
    if (!this.model.username.trim() || /\s/.test(this.model.username.trim()))
      this.errors.username = 'Usuario inválido.';
    if (!EMAIL_RE.test(this.model.email.trim()))
      this.errors.email = 'Correo inválido.';
    if (!this.model.birthdate) this.errors.birthdate = 'Ingresa la fecha de nacimiento.';

    let passwordPatch: { password?: string } = {};
    if (this.editingId) {
      if (this.model.password) {
        const pwdErr = validatePasswordString(this.model.password);
        if (pwdErr) this.errors.password = pwdErr;
        else passwordPatch = { password: this.model.password };
      }
    } else {
      const pwdErr = validatePasswordString(this.model.password);
      if (pwdErr) this.errors.password = pwdErr;
      else passwordPatch = { password: this.model.password };
    }

    if (Object.keys(this.errors).length > 0) return;

    try {
      if (this.editingId) {
        this.auth.update(this.editingId, {
          fullName: this.model.fullName.trim(),
          username: this.model.username.trim(),
          email: this.model.email.trim(),
          role: this.model.role,
          birthdate: this.model.birthdate,
          address: this.model.address.trim(),
          ...passwordPatch,
        });
      } else {
        this.auth.create({
          fullName: this.model.fullName,
          username: this.model.username,
          email: this.model.email,
          birthdate: this.model.birthdate,
          address: this.model.address,
          role: this.model.role,
          password: this.model.password,
        });
      }
      this.close();
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
