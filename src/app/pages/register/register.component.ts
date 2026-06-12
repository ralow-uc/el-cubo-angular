import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  EMAIL_RE,
  calcAge,
  validatePasswordString,
} from '../../validators/password.validator';

interface FormState {
  fullName: string;
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  birthdate: string;
  address: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  model: FormState = this.empty();
  errors: Partial<Record<keyof FormState, string>> = {};
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

  private empty(): FormState {
    return {
      fullName: '',
      username: '',
      email: '',
      password: '',
      passwordConfirm: '',
      birthdate: '',
      address: '',
    };
  }

  private validateField<K extends keyof FormState>(name: K): string | null {
    const v = (this.model[name] ?? '').trim();
    switch (name) {
      case 'fullName':
        if (!v) return 'Ingresa tu nombre completo.';
        if (v.length < 3) return 'El nombre es demasiado corto.';
        return null;
      case 'username':
        if (!v) return 'Elige un nombre de usuario.';
        if (v.length < 3) return 'El usuario debe tener al menos 3 caracteres.';
        if (/\s/.test(v)) return 'El usuario no puede contener espacios.';
        return null;
      case 'email':
        if (!v) return 'Ingresa tu correo electrónico.';
        if (!EMAIL_RE.test(v)) return 'El formato del correo no es válido.';
        return null;
      case 'password':
        return validatePasswordString(this.model.password);
      case 'passwordConfirm':
        if (!this.model.passwordConfirm) return 'Repite la contraseña.';
        if (this.model.passwordConfirm !== this.model.password)
          return 'Las contraseñas no coinciden.';
        return null;
      case 'birthdate':
        if (!v) return 'Ingresa tu fecha de nacimiento.';
        const age = calcAge(v);
        if (age < 0) return 'La fecha de nacimiento no es válida.';
        if (age < 13) return 'Debes tener al menos 13 años para registrarte.';
        if (age > 120) return 'La fecha de nacimiento no es realista.';
        return null;
      default:
        return null;
    }
  }

  onBlur(name: keyof FormState): void {
    const err = this.validateField(name);
    if (err) this.errors[name] = err;
    else delete this.errors[name];
  }

  fillDummy(): void {
    const rand = Math.random().toString(36).slice(2, 5);
    this.model = {
      fullName: 'Raúl Low',
      username: 'raullow_' + rand,
      email: 'raul.low+' + rand + '@example.com',
      password: 'Cubo2026!',
      passwordConfirm: 'Cubo2026!',
      birthdate: '2000-05-15',
      address: 'Av. Providencia 1234, Santiago',
    };
    this.errors = {};
  }

  reset(form: NgForm): void {
    form.resetForm(this.empty());
    this.errors = {};
    this.alertMsg = null;
  }

  startAgain(): void {
    this.success = null;
    this.model = this.empty();
    this.errors = {};
  }

  submit(form: NgForm): void {
    this.alertMsg = null;
    this.errors = {};

    (Object.keys(this.model) as (keyof FormState)[]).forEach((k) => {
      if (k === 'address') return;
      const err = this.validateField(k);
      if (err) this.errors[k] = err;
    });

    if (Object.keys(this.errors).length > 0) return;

    try {
      this.auth.create({
        fullName: this.model.fullName,
        username: this.model.username,
        email: this.model.email,
        password: this.model.password,
        birthdate: this.model.birthdate,
        address: this.model.address,
        role: 'cliente',
      });
      this.success = {
        email: this.model.email,
        username: this.model.username,
        timestamp: new Date().toLocaleString('es-CL', {
          dateStyle: 'long',
          timeStyle: 'short',
        }),
      };
      form.resetForm(this.empty());
    } catch (err) {
      const msg = (err as Error).message;
      if (/usuario/i.test(msg)) this.errors.username = msg;
      else if (/correo/i.test(msg)) this.errors.email = msg;
      else this.alertMsg = msg;
    }
  }
}
