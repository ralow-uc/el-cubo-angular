import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const RULES = {
  minLength: 8,
  maxLength: 18,
  specialPattern: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
};

export function validatePasswordString(value: string): string | null {
  if (!value) return 'Ingresa una contraseña.';
  if (value.length < RULES.minLength)
    return `Debe tener al menos ${RULES.minLength} caracteres.`;
  if (value.length > RULES.maxLength)
    return `No puede tener más de ${RULES.maxLength} caracteres.`;
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/[a-z]/.test(value)) return 'Debe incluir al menos una letra minúscula.';
  if (!/\d/.test(value)) return 'Debe incluir al menos un número.';
  if (!RULES.specialPattern.test(value))
    return 'Debe incluir al menos un carácter especial (!@#$%…).';
  return null;
}

export const passwordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const err = validatePasswordString(control.value ?? '');
  return err ? { password: err } : null;
};

export function calcAge(isoDate: string): number {
  if (!isoDate) return -1;
  const birth = new Date(isoDate);
  if (Number.isNaN(birth.getTime())) return -1;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const diff = today.getMonth() - birth.getMonth();
  if (diff < 0 || (diff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

export const ageValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const age = calcAge(v);
  if (age < 0) return { age: 'La fecha de nacimiento no es válida.' };
  if (age < 13) return { age: 'Debes tener al menos 13 años para registrarte.' };
  if (age > 120) return { age: 'La fecha de nacimiento no es realista.' };
  return null;
};

export function matchControlValidator(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const other = parent.get(otherControlName);
    if (!other) return null;
    return control.value === other.value ? null : { match: 'Los valores no coinciden.' };
  };
}

export function cardExpiryValidator(
  control: AbstractControl
): ValidationErrors | null {
  const v = (control.value ?? '').toString().trim();
  if (!v) return null;
  const m = v.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return { cardExpiry: 'Usa el formato MM/AA.' };
  const mm = parseInt(m[1], 10);
  const yy = parseInt(m[2], 10);
  if (mm < 1 || mm > 12) return { cardExpiry: 'Mes inválido.' };
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if (yy < curYY || (yy === curYY && mm < curMM))
    return { cardExpiry: 'La tarjeta está vencida.' };
  return null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
