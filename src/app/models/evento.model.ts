/**
 * Tipo de actividad que organiza la tienda. Sirve para agrupar y filtrar
 * la agenda de eventos consumida desde `assets/data/eventos.json`.
 */
export type TipoEvento =
  | 'Torneo'
  | 'Lanzamiento'
  | 'Taller'
  | 'Noche de juegos'
  | 'Aprende a jugar';

/**
 * Evento de la agenda de El Cubo (torneos, lanzamientos, talleres…).
 *
 * Estructura que refleja exactamente el formato del archivo JSON
 * `src/assets/data/eventos.json`, consumido por {@link EventoService}.
 */
export interface Evento {
  id: number;
  nombre: string;
  tipo: TipoEvento;
  /** Slug de categoría del catálogo, o `'general'` si no aplica. */
  categoria: 'estrategia' | 'familiares' | 'cartas' | 'cooperativos' | 'general';
  /** Fecha en formato ISO `YYYY-MM-DD`. */
  fecha: string;
  /** Hora en formato `HH:mm`. */
  hora: string;
  lugar: string;
  /** Cupos totales disponibles para la actividad. */
  cupos: number;
  /** Precio en pesos chilenos; `0` significa entrada liberada. */
  precio: number;
  /** Marca los eventos que se muestran en la vitrina del home. */
  destacado: boolean;
  /** Nombre de archivo dentro de `assets/img/`. */
  imagen: string;
  descripcion: string;
}
