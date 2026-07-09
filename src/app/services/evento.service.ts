import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Evento, EventoInput } from '../models/evento.model';
import { ConfigService } from './config.service';
import { STORAGE_KEYS, read, write, uuid } from './storage.util';

/**
 * Servicio de eventos que consume una **API REST** y manipula la información
 * con los cuatro métodos HTTP (GET, POST, PUT, DELETE), tal como pide la
 * actividad sumativa de la semana 8.
 *
 * Backend: **Firebase Realtime Database**, que expone cada nodo como JSON a
 * través de endpoints terminados en `.json`:
 * - `GET    {db}/eventos.json`          → objeto `{ "-Nkey": {…} }`
 * - `POST   {db}/eventos.json`          → crea y devuelve `{ "name": "-Nkey" }`
 * - `PUT    {db}/eventos/{id}.json`     → reemplaza el registro
 * - `DELETE {db}/eventos/{id}.json`     → elimina el registro
 *
 * La URL base se toma de `environment.firebaseDbUrl`. Si está vacía (aún no
 * configuraste Firebase), el servicio entra en **modo demo**: lee la semilla
 * `assets/data/eventos.json` y persiste el CRUD en `localStorage`, para que la
 * aplicación siga siendo navegable y demostrable sin backend.
 */
@Injectable({ providedIn: 'root' })
export class EventoService {
  private http = inject(HttpClient);
  private config = inject(ConfigService);

  /** Ruta del JSON de respaldo (semilla del modo demo). */
  private readonly localUrl = 'assets/data/eventos.json';

  /**
   * URL base de la Realtime Database (se lee en vivo desde ConfigService, que
   * la cargó de `assets/config.json`). Se le quita cualquier barra final para
   * no generar `//` al armar las rutas.
   */
  private get dbUrl(): string {
    return (this.config.firebaseDbUrl || '').replace(/\/+$/, '');
  }

  /** `true` cuando hay un backend Firebase configurado. */
  get usaFirebase(): boolean {
    return !!this.dbUrl;
  }

  private colUrl(): string {
    return `${this.dbUrl}/eventos.json`;
  }

  private itemUrl(id: string): string {
    return `${this.dbUrl}/eventos/${id}.json`;
  }

  // ============================================================
  //  Lectura (GET)
  // ============================================================

  /**
   * Obtiene todos los eventos.
   *
   * En Firebase devuelve un objeto indexado por push-id, que convertimos a
   * un arreglo tipado. Ante cualquier error de red cae al JSON local.
   */
  getEventos(): Observable<Evento[]> {
    if (this.usaFirebase) {
      return this.http.get<Record<string, EventoInput> | null>(this.colUrl()).pipe(
        map((data) => this.toArray(data)),
        catchError(() => this.leerLocal()),
      );
    }
    return this.leerLocal();
  }

  /** Eventos destacados para la vitrina del home. */
  getDestacados(): Observable<Evento[]> {
    return this.getEventos().pipe(map((eventos) => eventos.filter((e) => e.destacado)));
  }

  /** Filtra la agenda por tipo de actividad (`'todos'` no filtra). */
  getPorTipo(tipo: string): Observable<Evento[]> {
    return this.getEventos().pipe(
      map((eventos) => (tipo === 'todos' ? eventos : eventos.filter((e) => e.tipo === tipo))),
    );
  }

  // ============================================================
  //  Escritura (POST / PUT / DELETE)
  // ============================================================

  /** Crea un evento. En Firebase usa POST (la clave la asigna el servidor). */
  crear(input: EventoInput): Observable<Evento> {
    if (this.usaFirebase) {
      return this.http
        .post<{ name: string }>(this.colUrl(), input)
        .pipe(map((res) => ({ id: res.name, ...input })));
    }
    // Modo demo: id local + persistencia en localStorage.
    const nuevo: Evento = { id: uuid(), ...input };
    return this.leerLocal().pipe(
      map((lista) => {
        this.persistirLocal([...lista, nuevo]);
        return nuevo;
      }),
    );
  }

  /** Actualiza un evento existente. En Firebase usa PUT sobre `/eventos/{id}`. */
  actualizar(id: string, input: EventoInput): Observable<Evento> {
    const actualizado: Evento = { id, ...input };
    if (this.usaFirebase) {
      return this.http.put<EventoInput>(this.itemUrl(id), input).pipe(map(() => actualizado));
    }
    return this.leerLocal().pipe(
      map((lista) => {
        this.persistirLocal(lista.map((e) => (e.id === id ? actualizado : e)));
        return actualizado;
      }),
    );
  }

  /** Elimina un evento. En Firebase usa DELETE sobre `/eventos/{id}`. */
  eliminar(id: string): Observable<void> {
    if (this.usaFirebase) {
      return this.http.delete<void>(this.itemUrl(id)).pipe(map(() => undefined));
    }
    return this.leerLocal().pipe(
      map((lista) => {
        this.persistirLocal(lista.filter((e) => e.id !== id));
      }),
    );
  }

  // ============================================================
  //  Utilidades internas
  // ============================================================

  /**
   * Lectura del modo demo: usa lo persistido en localStorage; si no hay nada,
   * siembra desde el JSON local la primera vez.
   */
  private leerLocal(): Observable<Evento[]> {
    const cache = read<Evento[] | null>(STORAGE_KEYS.eventos, null);
    if (cache) return of(this.toArray(cache));
    return this.http.get<unknown>(this.localUrl).pipe(
      map((data) => {
        const lista = this.toArray(data);
        this.persistirLocal(lista);
        return lista;
      }),
      catchError(() => of([])),
    );
  }

  private persistirLocal(lista: Evento[]): void {
    write(STORAGE_KEYS.eventos, lista);
  }

  /**
   * Normaliza los datos a `Evento[]`. Acepta tanto el objeto indexado por
   * clave que devuelve Firebase (`{ "-Nkey": {…} }`) como un arreglo plano
   * (el JSON local / la caché de localStorage).
   */
  private toArray(data: unknown): Evento[] {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.map((e, i) => ({ ...(e as EventoInput), id: String((e as Evento).id ?? i) }));
    }
    return Object.entries(data as Record<string, EventoInput>).map(([id, e]) => ({ id, ...e }));
  }
}
