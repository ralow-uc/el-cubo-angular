import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Evento } from '../models/evento.model';

/**
 * Servicio que consume la agenda de eventos desde un archivo JSON local.
 *
 * Implementa el patrón enseñado en la guía de la semana 7 («Creación del
 * Servicio»): inyecta `HttpClient`, define la ruta al archivo JSON y expone
 * métodos que devuelven `Observable`s a los que los componentes se suscriben.
 *
 * El archivo vive en `src/assets/img/../data/eventos.json` y Angular lo sirve
 * en `assets/data/eventos.json`. Al ser un JSON estático solo admite lecturas
 * (HTTP GET); para escrituras reales haría falta una API REST en un servidor.
 *
 * @usageNotes
 * ```ts
 * private eventos = inject(EventoService);
 * this.eventos.getEventos().subscribe((data) => (this.lista = data));
 * ```
 */
@Injectable({ providedIn: 'root' })
export class EventoService {
  /** Cliente HTTP de Angular, provisto por `provideHttpClient()`. */
  private http = inject(HttpClient);

  /** Ruta al archivo JSON servido desde la carpeta de assets. */
  private readonly jsonUrl = 'assets/data/eventos.json';

  /**
   * Obtiene la lista completa de eventos desde el archivo JSON.
   *
   * @returns Un `Observable` que emite el arreglo de {@link Evento}.
   */
  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.jsonUrl);
  }

  /**
   * Obtiene solo los eventos marcados como destacados (para la vitrina
   * del home). Usa el operador `map` de RxJS para transformar el flujo.
   *
   * @returns Un `Observable` con los eventos cuyo `destacado` es `true`.
   */
  getDestacados(): Observable<Evento[]> {
    return this.getEventos().pipe(map((eventos) => eventos.filter((e) => e.destacado)));
  }

  /**
   * Filtra la agenda por tipo de actividad (Torneo, Taller, etc.).
   *
   * @param tipo Tipo de evento a buscar. Usa `'todos'` para no filtrar.
   * @returns Un `Observable` con los eventos que coinciden con el tipo.
   */
  getPorTipo(tipo: string): Observable<Evento[]> {
    return this.getEventos().pipe(
      map((eventos) => (tipo === 'todos' ? eventos : eventos.filter((e) => e.tipo === tipo))),
    );
  }
}
