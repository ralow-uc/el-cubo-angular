/**
 * Claves bajo las que cada entidad se guarda en `localStorage`.
 * Tener una constante central evita typos y permite cambiar el namespace
 * (por ejemplo, para una migración) en un solo lugar.
 */
export const STORAGE_KEYS = {
  users: 'elcubo:users',
  session: 'elcubo:session',
  products: 'elcubo:products',
  cart: 'elcubo:cart',
  orders: 'elcubo:orders',
  eventos: 'elcubo:eventos',
} as const;

/** Lee y parsea JSON desde `localStorage`. Devuelve `fallback` si no existe. */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/** Serializa `value` a JSON y lo guarda en `localStorage`. */
export function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  localStorage.removeItem(key);
}

/** Genera un id pseudo-único; suficiente para una app sin backend. */
export function uuid(): string {
  return (
    'id-' +
    Math.random().toString(36).slice(2, 11) +
    Date.now().toString(36)
  );
}

/** Formatea un monto en pesos chilenos (`$10.000`). */
export function formatCLP(value: number | null | undefined): string {
  if (typeof value !== 'number') return '$0';
  return '$' + value.toLocaleString('es-CL');
}

/** Formatea una fecha ISO al estilo `12 de junio de 2026` (es-CL). */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Resuelve la URL de una imagen de producto. Acepta tanto URLs absolutas
 * (las devuelve tal cual) como filenames sueltos (los prefija con `assets/img/`).
 */
export function imageUrl(filename: string | null | undefined): string {
  if (!filename) return 'assets/img/placeholder.jpg';
  if (/^(https?:)?\/\//i.test(filename) || filename.startsWith('data:')) {
    return filename;
  }
  if (filename.includes('/')) return filename;
  return 'assets/img/' + filename;
}
