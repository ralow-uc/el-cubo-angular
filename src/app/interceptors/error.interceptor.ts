import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP funcional (buenas prácticas de la guía S8).
 *
 * Centraliza en un único lugar el manejo de las respuestas de error de todas
 * las peticiones HTTP de la app: registra el detalle en consola y vuelve a
 * lanzar el error para que cada componente/servicio decida cómo reaccionar
 * (mensaje en pantalla, fallback, etc.).
 *
 * Es también el punto natural para agregar cabeceras comunes (por ejemplo un
 * token de autenticación) usando `req.clone({ setHeaders: {...} })`.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const detalle =
        err.status === 0
          ? 'sin conexión con el servidor'
          : `HTTP ${err.status} ${err.statusText}`;
      console.error(`[HTTP] ${req.method} ${req.url} → ${detalle}`, err.error);
      return throwError(() => err);
    }),
  );
};
