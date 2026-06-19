import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('siembra los usuarios admin y demo en localStorage en la primera carga', () => {
    const users = service.all();
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users.find((u) => u.id === 'admin')).toBeTruthy();
    expect(users.find((u) => u.id === 'demo')).toBeTruthy();
  });

  it('login() con credenciales correctas crea sesión', () => {
    const user = service.login('admin', 'Admin2026!');
    expect(user.role).toBe('admin');
    expect(service.session()).toEqual({ userId: 'admin', role: 'admin' });
    expect(service.currentUser()?.id).toBe('admin');
  });

  it('login() con credenciales incorrectas tira error y no crea sesión', () => {
    expect(() => service.login('admin', 'wrong')).toThrowError(
      /incorrectos/i
    );
    expect(service.session()).toBeNull();
  });

  it('logout() limpia la sesión', () => {
    service.login('admin', 'Admin2026!');
    expect(service.session()).not.toBeNull();
    service.logout();
    expect(service.session()).toBeNull();
  });

  it('create() rechaza usernames duplicados', () => {
    expect(() =>
      service.create({
        fullName: 'X',
        username: 'admin',
        email: 'nuevo@elcubo.cl',
        password: 'Test2026!',
        role: 'cliente',
      })
    ).toThrowError(/ya está en uso/i);
  });

  it('setPasswordByEmail() actualiza la contraseña del usuario', () => {
    service.setPasswordByEmail('demo@elcubo.cl', 'Nueva2026!');
    expect(() => service.login('demo', 'Nueva2026!')).not.toThrow();
  });
});
