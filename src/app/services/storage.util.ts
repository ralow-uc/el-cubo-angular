export const STORAGE_KEYS = {
  users: 'elcubo:users',
  session: 'elcubo:session',
  products: 'elcubo:products',
  cart: 'elcubo:cart',
  orders: 'elcubo:orders',
} as const;

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  localStorage.removeItem(key);
}

export function uuid(): string {
  return (
    'id-' +
    Math.random().toString(36).slice(2, 11) +
    Date.now().toString(36)
  );
}

export function formatCLP(value: number | null | undefined): string {
  if (typeof value !== 'number') return '$0';
  return '$' + value.toLocaleString('es-CL');
}

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

export function imageUrl(filename: string | null | undefined): string {
  if (!filename) return 'assets/img/placeholder.jpg';
  if (/^(https?:)?\/\//i.test(filename) || filename.startsWith('data:')) {
    return filename;
  }
  if (filename.includes('/')) return filename;
  return 'assets/img/' + filename;
}
