import { Injectable, inject } from '@angular/core';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/** Forma del archivo `assets/config.json`. */
interface AppConfig {
  firebaseDbUrl?: string;
}

/**
 * Configuración de la app cargada en **tiempo de ejecución** desde
 * `assets/config.json`, en lugar de venir horneada en el bundle.
 *
 * Así la URL de Firebase no vive en el código ni en el repositorio: el
 * contenedor Docker genera ese `config.json` al arrancar a partir de la
 * variable de entorno `FIREBASE_DB_URL` (definida en Render). Si el archivo
 * no existe (p. ej. `ng serve` local sin configurar), queda en modo demo.
 *
 * Se carga vía `provideAppInitializer` antes de que la app se muestre.
 */
@Injectable({ providedIn: 'root' })
export class ConfigService {
  // Usamos HttpBackend para saltarnos los interceptores: así un 404 esperado
  // (modo demo local) no genera ruido en consola.
  private http = new HttpClient(inject(HttpBackend));

  /** URL base de la Realtime Database; vacía = modo demo (localStorage). */
  firebaseDbUrl = '';

  /** Carga `assets/config.json`. Tolerante a que el archivo no exista. */
  async load(): Promise<void> {
    try {
      const cfg = await firstValueFrom(this.http.get<AppConfig>('assets/config.json'));
      this.firebaseDbUrl = (cfg?.firebaseDbUrl ?? '').trim();
    } catch {
      this.firebaseDbUrl = '';
    }
  }
}
