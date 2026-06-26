import { FormControl, FormGroup } from '@angular/forms';
import {
  ageValidator,
  calcAge,
  matchControlValidator,
  passwordValidator,
  validatePasswordString,
} from './password.validator';

describe('validatePasswordString', () => {
  it('acepta una contraseña de 6 caracteres con mayúscula y número', () => {
    expect(validatePasswordString('Abc123')).toBeNull();
  });

  it('acepta contraseñas más largas que cumplen las reglas', () => {
    expect(validatePasswordString('Cubo2026!')).toBeNull();
  });

  it('rechaza menos de 6 caracteres', () => {
    expect(validatePasswordString('Ab12')).toMatch(/al menos 6/);
  });

  it('rechaza más de 18 caracteres', () => {
    expect(validatePasswordString('Abcdefghij1234567890')).toMatch(
      /no puede tener más de 18/i
    );
  });

  it('exige al menos una mayúscula', () => {
    expect(validatePasswordString('abc123')).toMatch(/mayúscula/);
  });

  it('exige al menos un número', () => {
    expect(validatePasswordString('Abcdef')).toMatch(/número/);
  });

  it('NO exige minúscula ni carácter especial', () => {
    expect(validatePasswordString('ABC123')).toBeNull();
  });

  it('rechaza vacío', () => {
    expect(validatePasswordString('')).toMatch(/ingresa/i);
  });
});

describe('passwordValidator (Angular)', () => {
  it('asigna error { password: msg } cuando falla', () => {
    const ctrl = new FormControl('abc');
    expect(passwordValidator(ctrl)).toEqual(
      jasmine.objectContaining({ password: jasmine.any(String) })
    );
  });

  it('no asigna error cuando pasa', () => {
    const ctrl = new FormControl('Abc123');
    expect(passwordValidator(ctrl)).toBeNull();
  });
});

describe('ageValidator', () => {
  it('rechaza personas menores de 13', () => {
    const today = new Date();
    const tenYears = new Date(
      today.getFullYear() - 10,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split('T')[0];
    const ctrl = new FormControl(tenYears);
    expect(ageValidator(ctrl)).toEqual(
      jasmine.objectContaining({ age: jasmine.any(String) })
    );
  });

  it('acepta personas mayores de 13', () => {
    const ctrl = new FormControl('1990-01-01');
    expect(ageValidator(ctrl)).toBeNull();
  });
});

describe('calcAge', () => {
  it('cuenta cumpleaños futuros como un año menos', () => {
    const today = new Date();
    const exact = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    expect(calcAge(exact.toISOString())).toBe(30);
  });
});

describe('matchControlValidator', () => {
  it('falla cuando los controles no coinciden', () => {
    const group = new FormGroup({
      a: new FormControl('foo'),
      b: new FormControl('bar', [matchControlValidator('a')]),
    });
    group.controls.b.updateValueAndValidity();
    expect(group.controls.b.errors).toEqual(
      jasmine.objectContaining({ match: jasmine.any(String) })
    );
  });

  it('pasa cuando coinciden', () => {
    const group = new FormGroup({
      a: new FormControl('foo'),
      b: new FormControl('foo', [matchControlValidator('a')]),
    });
    group.controls.b.updateValueAndValidity();
    expect(group.controls.b.errors).toBeNull();
  });
});
