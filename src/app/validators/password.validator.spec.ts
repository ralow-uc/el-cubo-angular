import { FormControl } from '@angular/forms';
import {
  ageValidator,
  calcAge,
  matchControlValidator,
  passwordValidator,
  validatePasswordString,
} from './password.validator';
import { FormGroup } from '@angular/forms';

describe('validatePasswordString', () => {
  it('devuelve null para una contraseña que cumple las 5 reglas', () => {
    expect(validatePasswordString('Cubo2026!')).toBeNull();
  });

  it('exige al menos 8 caracteres', () => {
    expect(validatePasswordString('Ab1!')).toMatch(/al menos 8/);
  });

  it('rechaza más de 18 caracteres', () => {
    expect(validatePasswordString('A1!aaaaaaaaaaaaaaaaaaaaaa')).toMatch(
      /no puede tener más de 18/i
    );
  });

  it('exige mayúscula, minúscula, dígito y carácter especial', () => {
    expect(validatePasswordString('abcdefgh')).toMatch(/mayúscula/);
    expect(validatePasswordString('ABCDEFGH1!')).toMatch(/minúscula/);
    expect(validatePasswordString('Abcdefgh!')).toMatch(/número/);
    expect(validatePasswordString('Abcdefg1')).toMatch(/especial/);
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
    const ctrl = new FormControl('Cubo2026!');
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
