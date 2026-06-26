import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * @description
 * Reglas de contraseña exigidas por la pauta de la actividad:
 *  - Longitud entre 6 y 18 caracteres.
 *  - Al menos 1 letra mayúscula.
 *  - Al menos 1 dígito.
 *
 * Se omite intencionalmente la obligación de minúscula y carácter especial
 * para no rechazar contraseñas válidas según el enunciado.
 */
const RULES = {
  minLength: 6,
  maxLength: 18,
};

/**
 * @description
 * Valida una contraseña como string puro contra las reglas oficiales.
 *
 * Útil para escenarios donde no se quiere usar la API de Angular Forms
 * (por ejemplo, lógica de servicios o tests directos).
 *
 * @param value Contraseña a validar.
 * @returns `null` si la contraseña es válida; un mensaje legible en otro caso.
 *
 * @usageNotes
 * ```ts
 * validatePasswordString('Abc123')   // null
 * validatePasswordString('abc')      // 'Debe tener al menos 6 caracteres.'
 * validatePasswordString('abcdef')   // 'Debe incluir al menos una letra mayúscula.'
 * ```
 */
export function validatePasswordString(value: string): string | null {
  if (!value) return 'Ingresa una contraseña.';
  if (value.length < RULES.minLength)
    return `Debe tener al menos ${RULES.minLength} caracteres.`;
  if (value.length > RULES.maxLength)
    return `No puede tener más de ${RULES.maxLength} caracteres.`;
  if (!/[A-Z]/.test(value)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/\d/.test(value)) return 'Debe incluir al menos un número.';
  return null;
}

/**
 * @description
 * Validator de Angular Reactive Forms que envuelve `validatePasswordString`
 * para integrarse directamente en un `FormControl`.
 *
 * @param control Control del formulario que contiene la contraseña.
 * @returns `null` si pasa, o `{ password: mensaje }` si falla.
 *
 * @usageNotes
 * ```ts
 * password: ['', [Validators.required, passwordValidator]]
 * ```
 */
export const passwordValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const err = validatePasswordString(control.value ?? '');
  return err ? { password: err } : null;
};

/**
 * @description
 * Calcula la edad cumplida en años a partir de una fecha ISO. Tiene en
 * cuenta el cumpleaños del año actual: si todavía no se cumplió, devuelve
 * un año menos.
 *
 * @param isoDate Fecha en formato ISO (`YYYY-MM-DD` o ISO completo).
 * @returns Edad en años cumplidos, o `-1` si la fecha es inválida.
 *
 * @usageNotes
 * ```ts
 * calcAge('2000-05-15')  // 26 (hoy, junio 2026)
 * calcAge('')            // -1
 * ```
 */
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

/**
 * @description
 * Validator que exige al menos 13 años cumplidos. Acepta vacío como
 * "no validar" (no marca `required`); úselo combinado con `Validators.required`
 * cuando el campo sea obligatorio.
 *
 * @param control Control que contiene la fecha de nacimiento (ISO).
 * @returns `null` si pasa, o `{ age: mensaje }` si la edad no es válida.
 *
 * @usageNotes
 * ```ts
 * birthdate: ['', [Validators.required, ageValidator]]
 * ```
 */
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

/**
 * @description
 * Validator factory que exige que un control tenga el mismo valor que otro
 * control del mismo `FormGroup`. Útil para la confirmación de contraseña.
 *
 * @param otherControlName Nombre del control con el que se debe coincidir.
 * @returns ValidatorFn aplicable a un control hermano dentro del mismo grupo.
 *
 * @usageNotes
 * ```ts
 * this.fb.group({
 *   password:        ['', [passwordValidator]],
 *   passwordConfirm: ['', [matchControlValidator('password')]]
 * })
 * ```
 */
export function matchControlValidator(otherControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const other = parent.get(otherControlName);
    if (!other) return null;
    return control.value === other.value ? null : { match: 'Los valores no coinciden.' };
  };
}

/**
 * @description
 * Validator del vencimiento de tarjeta con formato `MM/AA`. Rechaza tanto
 * el formato inválido como las tarjetas vencidas (comparando con la fecha
 * actual).
 *
 * @param control Control que contiene el vencimiento como texto `MM/AA`.
 * @returns `null` si pasa, o `{ cardExpiry: mensaje }` si falla.
 *
 * @usageNotes
 * ```ts
 * cardExpiry: ['', [Validators.required, cardExpiryValidator]]
 * ```
 */
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

/**
 * @description
 * Regex pragmática para validar el formato general de un email.
 * Usada por validators custom cuando necesitan validar contra strings
 * en lugar de un `FormControl`.
 */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
