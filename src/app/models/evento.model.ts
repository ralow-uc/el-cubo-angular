/**
 * Tipo de actividad que organiza la tienda. Sirve para agrupar y filtrar
 * la agenda de eventos consumida desde Firebase / el JSON de respaldo.
 */
export type TipoEvento =
  | 'Torneo'
  | 'Lanzamiento'
  | 'Taller'
  | 'Noche de juegos'
  | 'Aprende a jugar';

/** Categoría del catálogo asociada al evento (o `'general'`). */
export type CategoriaEvento =
  | 'estrategia'
  | 'familiares'
  | 'cartas'
  | 'cooperativos'
  | 'general';

/**
 * Datos de un evento SIN su identificador. Es el cuerpo (payload) que se
 * envía a Firebase en un POST/PUT; Firebase asigna la clave (push-id).
 */
export interface EventoInput {
  nombre: string;
  tipo: TipoEvento;
  categoria: CategoriaEvento;
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

/**
 * Evento de la agenda de El Cubo (torneos, lanzamientos, talleres…).
 *
 * `id` es la clave del registro en Firebase Realtime Database (un push-id
 * de tipo string, p. ej. `"-NpQ1a..."`). En modo demo local es un slug.
 */
export interface Evento extends EventoInput {
  id: string;
}
