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

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
