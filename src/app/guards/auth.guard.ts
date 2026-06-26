import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * @description
 * Guard funcional que protege rutas privadas. Si no hay sesión activa
 * redirige al login en lugar de permitir el acceso.
 *
 * @returns `true` si hay sesión, `false` (y navega a `/login`) si no.
 *
 * @usageNotes
 * ```ts
 * { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] }
 * ```
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.session()) return true;
  router.navigate(['/login']);
  return false;
};

/**
 * @description
 * Guard funcional que solo permite usuarios con rol `admin`. Los usuarios
 * no logueados van al login; los clientes con sesión vuelven al home.
 *
 * @returns `true` si el usuario es admin, `false` en cualquier otro caso.
 *
 * @usageNotes
 * ```ts
 * { path: 'admin', canActivate: [adminGuard], children: [...] }
 * ```
 */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  if (user?.role === 'admin') return true;
  router.navigate([user ? '/' : '/login']);
  return false;
};
