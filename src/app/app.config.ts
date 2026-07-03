import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Habilita HttpClient en toda la app (equivalente moderno y standalone
    // del HttpClientModule). Necesario para que EventoService consuma el JSON.
    provideHttpClient(),
  ],
};
