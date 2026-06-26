import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Role, User } from '../../../models/user.model';
import {
  ageValidator,
  passwordValidator,
} from '../../../validators/password.validator';
import { formatDate } from '../../../services/storage.util';

/**
 * Mantenedor de usuarios del sistema. Permite crear admins o clientes y
 * editar los datos de cualquier usuario. La validación de password se
 * activa solo cuando es obligatoria (alta o cambio explícito).
 */
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly users = this.auth.users;
  readonly me = this.auth.currentUser;
  readonly formatDate = formatDate;

  open = signal(false);
  editingId: string | null = null;
  alertMsg: string | null = null;

  form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.pattern(/^\S+$/)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['cliente' as Role],
    birthdate: ['', [Validators.required, ageValidator]],
    address: [''],
    password: [''],
  });

  private resetWithPasswordRequired(required: boolean): void {
    if (required) {
      this.form.controls.password.setValidators([Validators.required, passwordValidator]);
    } else {
      this.form.controls.password.setValidators([passwordValidator]);
    }
    this.form.controls.password.updateValueAndValidity();
  }

  openNew(): void {
    this.editingId = null;
    this.alertMsg = null;
    this.form.reset({
      fullName: '',
      username: '',
      email: '',
      role: 'cliente',
      birthdate: '',
      address: '',
      password: '',
    });
    this.resetWithPasswordRequired(true);
    this.open.set(true);
  }

  openEdit(u: User): void {
    this.editingId = u.id;
    this.alertMsg = null;
    this.form.reset({
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      role: u.role,
      birthdate: u.birthdate,
      address: u.address ?? '',
      password: '',
    });
    this.resetWithPasswordRequired(false);
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

  errorOf(name: keyof typeof this.form.controls): string | null {
    const ctrl = this.form.controls[name];
    if (ctrl.valid || (!ctrl.touched && !ctrl.dirty)) return null;
    const e = ctrl.errors;
    if (!e) return null;
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['pattern'] && name === 'username') return 'No puede contener espacios.';
    if (e['email']) return 'El formato del correo no es válido.';
    if (e['age']) return e['age'];
    if (e['password']) return e['password'];
    if (e['taken']) return e['taken'];
    return 'Valor inválido.';
  }

  submit(): void {
    this.alertMsg = null;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    try {
      if (this.editingId) {
        const patch: Record<string, unknown> = {
          fullName: v.fullName.trim(),
          username: v.username.trim(),
          email: v.email.trim(),
          role: v.role,
          birthdate: v.birthdate,
          address: v.address.trim(),
        };
        if (v.password) patch['password'] = v.password;
        this.auth.update(this.editingId, patch);
      } else {
        this.auth.create({
          fullName: v.fullName,
          username: v.username,
          email: v.email,
          birthdate: v.birthdate,
          address: v.address,
          role: v.role,
          password: v.password,
        });
      }
      this.close();
    } catch (err) {
      this.alertMsg = (err as Error).message;
    }
  }
}
