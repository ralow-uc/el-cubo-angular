import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { EventoService } from '../../services/evento.service';
import { Evento, TipoEvento } from '../../models/evento.model';
import { formatCLP, imageUrl } from '../../services/storage.util';

/** Opciones del filtro por tipo (incluye la pseudo-opción "todos"). */
type FiltroTipo = TipoEvento | 'todos';

/**
 * Página pública de agenda de eventos de El Cubo (torneos, lanzamientos…).
 *
 * Consume la API REST a través de {@link EventoService} (Firebase Realtime
 * Database, con respaldo en el JSON local) y muestra los datos en dos formatos:
 * una grilla de tarjetas y una tabla resumida (Bootstrap `table`). Maneja los
 * estados de carga, error y "sin datos".
 *
 * En `ngOnInit` se suscribe al `Observable` que devuelve el servicio (GET) y
 * asigna el resultado a una signal.
 */
@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
})
export class EventosComponent implements OnInit {
  private eventoService = inject(EventoService);

  /** Lista completa consumida del JSON. */
  private readonly todos = signal<Evento[]>([]);

  /** Estado de la petición HTTP. */
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  /** Tipo seleccionado en el filtro. */
  readonly filtro = signal<FiltroTipo>('todos');

  /** Tipos disponibles para los botones de filtro. */
  readonly tipos: FiltroTipo[] = [
    'todos',
    'Torneo',
    'Lanzamiento',
    'Taller',
    'Noche de juegos',
    'Aprende a jugar',
  ];

  /** Eventos visibles según el filtro activo. */
  readonly eventos = computed<Evento[]>(() => {
    const tipo = this.filtro();
    const lista = this.todos();
    return tipo === 'todos' ? lista : lista.filter((e) => e.tipo === tipo);
  });

  /** Total de eventos consumidos (para el encabezado). */
  readonly total = computed(() => this.todos().length);

  readonly formatCLP = formatCLP;
  readonly imageUrl = imageUrl;

  ngOnInit(): void {
    // Nos suscribimos al observable del servicio: cuando llegan los datos del
    // JSON se asignan a la signal; si falla, guardamos el mensaje de error.
    this.eventoService.getEventos().subscribe({
      next: (data) => {
        this.todos.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar la agenda de eventos. Intenta nuevamente más tarde.');
        this.cargando.set(false);
      },
    });
  }

  /** Cambia el filtro por tipo de evento. */
  setFiltro(tipo: FiltroTipo): void {
    this.filtro.set(tipo);
  }

  /** Formatea una fecha ISO `YYYY-MM-DD` como `12 de julio de 2026` (sin desfase de zona). */
  formatFecha(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return iso;
    return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  /** Etiqueta de precio: "Gratis" cuando es 0. */
  precioLabel(precio: number): string {
    return precio > 0 ? this.formatCLP(precio) : 'Gratis';
  }
}
