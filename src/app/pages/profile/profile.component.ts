import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import {
  ageValidator,
  matchControlValidator,
  passwordValidator,
} from '../../validators/password.validator';
import { formatDate } from '../../services/storage.util';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly formatDate = formatDate;
  readonly currentUser = this.auth.currentUser;

  alertMsg: string | null = null;
  successMsg: string | null = null;

  form;

  constructor() {
    const me = this.auth.currentUser()!;
    this.form = this.fb.nonNullable.group({
      fullName: [me.fullName, [Validators.required]],
      username: [me.username, [Validators.required, Validators.pattern(/^\S+$/)]],
      email: [me.email, [Validators.required, Validators.email]],
      birthdate: [me.birthdate, [Validators.required, ageValidator]],
      address: [me.address ?? ''],
      newPassword: ['', [passwordValidator]],
      newPasswordConfirm: ['', [matchControlValidator('newPassword')]],
    });
    this.form.controls.newPassword.setValidators([]);
    this.form.controls.newPasswordConfirm.setValidators([]);
    this.form.controls.newPassword.updateValueAndValidity();
    this.form.controls.newPasswordConfirm.updateValueAndValidity();
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
    if (e['pattern'] && name === 'username') return 'No puede contener espacios.';
    if (e['email']) return 'El formato del correo no es válido.';
    if (e['age']) return e['age'];
    if (e['password']) return e['password'];
    if (e['match']) return 'Las contraseñas no coinciden.';
    if (e['taken']) return e['taken'];
    return 'Valor inválido.';
  }

  submit(): void {
    this.alertMsg = null;
    this.successMsg = null;

    const wantsPwdChange = !!(
      this.form.controls.newPassword.value ||
      this.form.controls.newPasswordConfirm.value
    );

    if (wantsPwdChange) {
      this.form.controls.newPassword.setValidators([Validators.required, passwordValidator]);
      this.form.controls.newPasswordConfirm.setValidators([
        Validators.required,
        matchControlValidator('newPassword'),
      ]);
    } else {
      this.form.controls.newPassword.setValidators([]);
      this.form.controls.newPasswordConfirm.setValidators([]);
    }
    this.form.controls.newPassword.updateValueAndValidity();
    this.form.controls.newPasswordConfirm.updateValueAndValidity();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const me = this.auth.currentUser()!;
    try {
      const patch: Record<string, unknown> = {
        fullName: v.fullName.trim(),
        username: v.username.trim(),
        email: v.email.trim(),
        birthdate: v.birthdate,
        address: v.address.trim(),
      };
      if (wantsPwdChange) patch['password'] = v.newPassword;
      this.auth.update(me.id, patch);
      this.successMsg = 'Perfil actualizado. Tus cambios se guardaron correctamente.';
      this.form.patchValue({ newPassword: '', newPasswordConfirm: '' });
    } catch (err) {
      const msg = (err as Error).message;
      if (/usuario/i.test(msg)) this.form.controls.username.setErrors({ taken: msg });
      else if (/correo/i.test(msg)) this.form.controls.email.setErrors({ taken: msg });
      else this.alertMsg = msg;
    }
  }
}
