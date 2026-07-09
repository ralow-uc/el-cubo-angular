import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Habilita HttpClient en toda la app (equivalente moderno y standalone del
    // HttpClientModule) con un interceptor funcional para el manejo central de
    // errores. Necesario para que EventoService consuma la API REST de Firebase.
    provideHttpClient(withInterceptors([errorInterceptor])),
  ],
};
