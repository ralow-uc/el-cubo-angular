import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { errorInterceptor } from './interceptors/error.interceptor';
import { ConfigService } from './services/config.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Habilita HttpClient en toda la app (equivalente moderno y standalone del
    // HttpClientModule) con un interceptor funcional para el manejo central de
    // errores. Necesario para que EventoService consuma la API REST de Firebase.
    provideHttpClient(withInterceptors([errorInterceptor])),
    // Carga assets/config.json (URL de Firebase) ANTES de mostrar la app.
    provideAppInitializer(() => inject(ConfigService).load()),
  ],
};
