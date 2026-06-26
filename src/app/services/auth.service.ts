import { Injectable, computed, signal } from '@angular/core';
import { Session, User } from '../models/user.model';
import { SEED_USERS } from '../data/seed';
import { STORAGE_KEYS, read, remove, uuid, write } from './storage.util';

/**
 * Servicio singleton que maneja el padrón de usuarios y la sesión activa.
 *
 * Persiste a `localStorage` y expone signals reactivas (`users`, `session`,
 * `currentUser`) que cualquier componente puede consumir directamente.
 *
 * En la primera carga siembra los usuarios demo (`admin` y `demo`) para
 * que el sitio sea utilizable sin un backend real.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Lista completa de usuarios registrados. */
  readonly users = signal<User[]>([]);
  /** Sesión actual o `null` si nadie está logueado. */
  readonly session = signal<Session | null>(null);
  /** Usuario completo derivado de `session.userId`, o `null`. */
  readonly currentUser = computed<User | null>(() => {
    const s = this.session();
    if (!s) return null;
    return this.users().find((u) => u.id === s.userId) ?? null;
  });

  constructor() {
    this.seedIfEmpty();
    this.users.set(read<User[]>(STORAGE_KEYS.users, []));
    this.session.set(read<Session | null>(STORAGE_KEYS.session, null));
  }

  private seedIfEmpty(): void {
    if (read(STORAGE_KEYS.users, null) === null) {
      write(STORAGE_KEYS.users, SEED_USERS);
    }
  }

  private persistUsers(list: User[]): void {
    write(STORAGE_KEYS.users, list);
    this.users.set([...list]);
  }

  /** Devuelve todos los usuarios registrados. */
  all(): User[] {
    return this.users();
  }

  /** Busca un usuario por su id interno. */
  findById(id: string): User | null {
    return this.users().find((u) => u.id === id) ?? null;
  }

  /** Busca un usuario por su username o email (case-insensitive). */
  findByLogin(loginField: string): User | null {
    const v = (loginField || '').trim().toLowerCase();
    return (
      this.users().find(
        (u) =>
          u.username.toLowerCase() === v || u.email.toLowerCase() === v
      ) ?? null
    );
  }

  /**
   * @description
   * Crea un nuevo usuario en el padrón con un id generado al vuelo.
   * La unicidad de `username` y `email` se valida case-insensitive.
   *
   * @param data Datos del usuario nuevo. `password` es obligatoria.
   * @returns El usuario recién creado.
   * @throws Error si el `username` o `email` ya están en uso.
   *
   * @usageNotes
   * ```ts
   * auth.create({
   *   fullName: 'Raúl Low',
   *   username: 'raullow',
   *   email: 'raul@example.com',
   *   password: 'Abc123',
   *   birthdate: '2000-05-15',
   *   address: 'Av. Providencia 1234',
   *   role: 'cliente'
   * });
   * ```
   */
  create(data: Partial<User> & { password: string }): User {
    const list = [...this.users()];
    if (
      list.some(
        (u) => u.username.toLowerCase() === (data.username ?? '').toLowerCase()
      )
    ) {
      throw new Error('Ese nombre de usuario ya está en uso.');
    }
    if (
      list.some(
        (u) => u.email.toLowerCase() === (data.email ?? '').toLowerCase()
      )
    ) {
      throw new Error('Ese correo ya está registrado.');
    }

    const user: User = {
      id: uuid(),
      fullName: (data.fullName ?? '').trim(),
      username: (data.username ?? '').trim(),
      email: (data.email ?? '').trim(),
      password: data.password,
      birthdate: data.birthdate ?? '',
      address: (data.address ?? '').trim(),
      role: data.role ?? 'cliente',
      createdAt: new Date().toISOString(),
    };
    list.push(user);
    this.persistUsers(list);
    return user;
  }

  /**
   * Actualiza campos del usuario `id`. Si el patch cambia username o email,
   * vuelve a validar unicidad contra el resto del padrón.
   */
  update(id: string, patch: Partial<User>): User {
    const list = [...this.users()];
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error('Usuario no encontrado.');

    if (patch.username && patch.username !== list[idx].username) {
      if (
        list.some(
          (u, i) =>
            i !== idx &&
            u.username.toLowerCase() === patch.username!.toLowerCase()
        )
      ) {
        throw new Error('Ese nombre de usuario ya está en uso.');
      }
    }
    if (patch.email && patch.email !== list[idx].email) {
      if (
        list.some(
          (u, i) =>
            i !== idx && u.email.toLowerCase() === patch.email!.toLowerCase()
        )
      ) {
        throw new Error('Ese correo ya está registrado.');
      }
    }

    list[idx] = { ...list[idx], ...patch };
    this.persistUsers(list);
    return list[idx];
  }

  /** Borra al usuario `id` del padrón. */
  remove(id: string): void {
    const list = this.users().filter((u) => u.id !== id);
    this.persistUsers(list);
  }

  /**
   * @description
   * Autentica un usuario por username o email y crea la sesión activa
   * en `localStorage`.
   *
   * @param loginField Username o email (case-insensitive).
   * @param password Contraseña en texto plano.
   * @returns El usuario autenticado.
   * @throws Error con `'Usuario o contraseña incorrectos.'` si falla.
   */
  login(loginField: string, password: string): User {
    const user = this.findByLogin(loginField);
    if (!user || user.password !== password) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    const s: Session = { userId: user.id, role: user.role };
    write(STORAGE_KEYS.session, s);
    this.session.set(s);
    return user;
  }

  /** Cierra la sesión activa. */
  logout(): void {
    remove(STORAGE_KEYS.session);
    this.session.set(null);
  }

  /**
   * Genera una contraseña temporal para el correo dado. Útil para el flow
   * antiguo de "te enviamos una clave". Devuelve `null` si el correo no existe.
   */
  recoverPassword(email: string): { user: User; tempPassword: string } | null {
    const user = this.findByLogin(email);
    if (!user) return null;
    const tempPassword =
      'Temp' +
      Math.random().toString(36).slice(2, 6).toUpperCase() +
      Math.floor(Math.random() * 90 + 10) +
      '!';
    this.update(user.id, { password: tempPassword });
    return { user, tempPassword };
  }

  /**
   * @description
   * Setea directamente una nueva contraseña para el correo dado.
   * Usado por el flow moderno de "recuperar contraseña" en dos pasos.
   *
   * @param email Correo electrónico del usuario.
   * @param newPassword Nueva contraseña a guardar (debe haberse validado antes).
   * @returns El usuario actualizado.
   * @throws Error si el correo no corresponde a ningún usuario.
   */
  setPasswordByEmail(email: string, newPassword: string): User {
    const user = this.findByLogin(email);
    if (!user) throw new Error('No encontramos una cuenta con ese correo.');
    return this.update(user.id, { password: newPassword });
  }
}
