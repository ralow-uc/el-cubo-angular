import { Injectable, computed, signal } from '@angular/core';
import { Session, User } from '../models/user.model';
import { SEED_USERS } from '../data/seed';
import { STORAGE_KEYS, read, remove, uuid, write } from './storage.util';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly users = signal<User[]>([]);
  readonly session = signal<Session | null>(null);
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

  all(): User[] {
    return this.users();
  }

  findById(id: string): User | null {
    return this.users().find((u) => u.id === id) ?? null;
  }

  findByLogin(loginField: string): User | null {
    const v = (loginField || '').trim().toLowerCase();
    return (
      this.users().find(
        (u) =>
          u.username.toLowerCase() === v || u.email.toLowerCase() === v
      ) ?? null
    );
  }

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

  remove(id: string): void {
    const list = this.users().filter((u) => u.id !== id);
    this.persistUsers(list);
  }

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

  logout(): void {
    remove(STORAGE_KEYS.session);
    this.session.set(null);
  }

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

  setPasswordByEmail(email: string, newPassword: string): User {
    const user = this.findByLogin(email);
    if (!user) throw new Error('No encontramos una cuenta con ese correo.');
    return this.update(user.id, { password: newPassword });
  }
}
