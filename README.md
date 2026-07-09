# El Cubo

Sitio de **El Cubo**, PYME ficticia de juegos de mesa, construido con **Angular 19** y standalone components.

E-commerce frontend con catálogo dinámico por categoría, ficha de producto, autenticación, carrito, checkout simulado, historial de pedidos y panel de administración. La persistencia del e-commerce vive en `localStorage`; la **agenda de eventos** se consume desde una **API REST (Firebase Realtime Database)**.

## Semana 8 — Consumo de API REST (Firebase) + Docker/Cloud (sumativa)

La agenda de **Eventos** se consume ahora desde un backend por HTTP y se manipula con los **cuatro métodos** GET/POST/PUT/DELETE, tal como pide la actividad sumativa. Además, la app se **conteneriza con Docker** para desplegarse en Cloud (Docker Lab).

**Consumo de la API REST** (`src/app/services/evento.service.ts`):

| Operación | Método HTTP | Endpoint Firebase |
|-----------|-------------|-------------------|
| Listar    | `GET`    | `{db}/eventos.json` (objeto → arreglo) |
| Crear     | `POST`   | `{db}/eventos.json` (Firebase asigna la clave) |
| Editar    | `PUT`    | `{db}/eventos/{id}.json` |
| Eliminar  | `DELETE` | `{db}/eventos/{id}.json` |

- La URL base se configura en `src/environments/environment.ts` (`firebaseDbUrl`).
- **Sin Firebase configurado** (`firebaseDbUrl: ''`), el servicio entra en **modo demo**: siembra desde `src/assets/data/eventos.json` y persiste el CRUD en `localStorage`, para que la app siga siendo navegable y demostrable.
- `provideHttpClient(withInterceptors([errorInterceptor]))` habilita HttpClient con un **interceptor** funcional para el manejo centralizado de errores (buenas prácticas de la guía).
- **Pantallas donde se consume el JSON:** `/eventos` (público, lista + tabla), vitrina de destacados en el **home**, y **`/admin/eventos`** (mantenedor con crear/editar/eliminar).

**Configurar Firebase y desplegar en Docker Lab:** pasos detallados en [`docs/entrega-s8.md`](docs/entrega-s8.md). Resumen:

```bash
# 1) Pega tu URL de Realtime Database en src/environments/environment.ts
# 2) Construye la imagen y córrela localmente
docker build -t elcubo .
docker run -p 80:80 elcubo          # abre http://localhost/
```

Para el Cloud: el contenedor lee el puerto de la variable `PORT` (en local usa 80). Se despliega en **[Render](https://render.com/)** conectando el repo de GitHub (Render construye la imagen del `Dockerfile` y entrega una URL pública HTTPS). Pasos detallados en [`docs/entrega-s8.md`](docs/entrega-s8.md).

> Nota: Play with Docker (Docker Lab) fue descontinuado el 1 de marzo de 2026; Render corre la misma imagen Docker y cumple lo mismo (imagen + contenedor + Cloud + URL pública).

## Requisitos

- Node.js 20+ (probado en v22.13.1)
- npm 10+

## Cómo levantar el proyecto

```bash
npm install
npm start
```

Abre http://localhost:4200/

## Build de producción

```bash
npm run build
```

Artefactos en `dist/el-cubo/`.

## Pruebas unitarias

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Corre Jasmine + Karma. Suites incluidas:

- `validators/password.validator.spec.ts` — reglas de password, edad, match de controles.
- `services/auth.service.spec.ts` — login, logout, seed, validaciones de unicidad.
- `services/product.service.spec.ts` — CRUD de productos, búsqueda por id/categoría.
- `services/evento.service.spec.ts` — (S8) API REST Firebase: GET/POST/PUT/DELETE con `HttpTestingController` + modo demo localStorage.
- `pages/login/login.component.spec.ts` — Reactive Form valid/inválido, submit.
- `pages/register/register.component.spec.ts` — email inválido, password mínima válida, edad <13, limpieza, dirección opcional.

## Documentación (Compodoc)

```bash
npm run docs        # genera documentation/ en disco
npm run docs:serve  # genera y sirve en http://localhost:8080
```

La documentación cubre componentes, servicios, guards, validators, interfaces y rutas, generada con tema `material`.

## Cuentas demo

| Rol     | Login                       | Contraseña    |
|---------|-----------------------------|---------------|
| admin   | `admin@elcubo.cl` o `admin` | `Admin2026!`  |
| cliente | `demo@elcubo.cl` o `demo`   | `Demo2026!`   |

Para reiniciar los datos desde DevTools: `localStorage.clear()` y refrescar.

## Estructura

```
src/
├── environments/      ← (S8) environment.ts / .development.ts (firebaseDbUrl)
└── app/
    ├── components/        ← navbar, footer, toast, game-card (reusables)
    ├── pages/             ← cada ruta del sitio
    │   ├── home/
    │   ├── eventos/       ← (S7/S8) agenda pública consumida de la API REST
    │   ├── category/      ← una sola página dinámica por :slug
    │   ├── product-detail/← una sola página dinámica por :id
    │   ├── login/ register/ recover-password/ profile/
    │   ├── cart/ checkout/ orders/
    │   └── admin/         ← dashboard, eventos (CRUD), products, users, inventory
    ├── services/          ← Auth, Product, Cart, Order, Toast, EventoService (S8: CRUD API REST)
    ├── interceptors/      ← (S8) errorInterceptor (manejo central de errores HTTP)
    ├── guards/            ← authGuard, adminGuard funcionales
    ├── validators/        ← passwordValidator, ageValidator, matchControlValidator, cardExpiryValidator
    ├── models/            ← interfaces TypeScript (User, Product, Cart, Order, Evento)
    └── data/              ← seed.ts (12 productos, 2 usuarios) · assets/data/eventos.json (semilla)

Dockerfile · nginx.conf · .dockerignore   ← (S8) contenerización para Cloud
docs/entrega-s8.md · docs/firebase-eventos-seed.json   ← (S8) guía + semilla Firebase
```

## Stack

- Angular 19 con standalone components y signals
- **Reactive Forms** con validators custom para todos los formularios principales
- **`[(ngModel)]`** en los inputs sueltos de cantidad (carrito e inventario)
- **Control flow moderno** `@if` / `@for` en todas las plantillas
- Bootstrap 5 (instalado vía npm, importado en `angular.json`)
- Routing con guards funcionales (`authGuard`, `adminGuard`)
- Persistencia en `localStorage` encapsulada en servicios singleton
- Jasmine + Karma para tests unitarios
- Compodoc para generación de documentación

## Validaciones de formularios

- **Email** con formato válido (`Validators.email`)
- **Password** entre 6 y 18 caracteres, con al menos una mayúscula y un número
- **Confirmación de password** debe coincidir
- **Edad mínima** de 13 años calculada desde la fecha de nacimiento
- **Dirección de despacho** opcional
- **Teléfono** entre 8 y 12 dígitos
- **Tarjeta** entre 13 y 19 dígitos, CVV de 3 o 4, vencimiento `MM/AA` no expirado

## Notas

- Las imágenes locales viven en `src/assets/img/` y se sirven desde `/assets/img/...`.
- Sin pasarela de pago real: el checkout simula la transacción y crea la orden en `localStorage`.
- La recuperación de contraseña permite ingresar una nueva contraseña directamente (sin clave temporal).

## Troubleshooting

**`npm start` se queda colgado mostrando solo `> ng serve`:**

Probablemente el puerto 4200 está ocupado por un proceso anterior.

```bash
lsof -ti :4200 | xargs kill -9
npm start
```

O usar otro puerto:

```bash
npm start -- --port 4300
```
