# El Cubo — DSY2202 S4

Sitio de **El Cubo**, PYME ficticia de juegos de mesa, migrado desde HTML/CSS/Bootstrap/JS vanilla a **Angular 19** con standalone components.

Cumple con la pauta formativa de la semana 4 (DSY2202): integración de Angular + Bootstrap, uso de directivas `*ngIf`, `*ngFor`, `[(ngModel)]`, datos estáticos en `.ts` y paso de datos entre páginas para evitar HTML duplicados.

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
npm build
```

Artefactos en `dist/el-cubo/`.

## Cuentas demo

| Rol     | Login                 | Contraseña    |
|---------|-----------------------|---------------|
| admin   | `admin@elcubo.cl` o `admin` | `Admin2026!` |
| cliente | `demo@elcubo.cl` o `demo`   | `Demo2026!`  |

Para reiniciar los datos desde DevTools: `localStorage.clear()` y refrescar.

## Estructura

```
src/app/
├── components/        ← navbar, footer, toast, game-card (reusables)
├── pages/             ← cada ruta del sitio
│   ├── home/
│   ├── category/      ← UNA sola página, recibe :slug → renderiza dinámico
│   ├── product-detail/← UNA sola página, recibe :id  → renderiza dinámico
│   ├── login/ register/ recover-password/ profile/
│   ├── cart/ checkout/ orders/
│   └── admin/         ← dashboard, products, users, inventory
├── services/          ← AuthService, ProductService, CartService, OrderService (signals + localStorage)
├── guards/            ← authGuard, adminGuard funcionales
├── validators/        ← passwordValidator (8-18, mayús+minús+dígito+especial)
├── models/            ← interfaces TypeScript (User, Product, Cart, Order)
└── data/              ← seed.ts con datos estáticos (12 productos, 2 usuarios)
```

## Demostración de los criterios de la pauta

- **Componentes Angular para cada HTML**: 14 páginas + 4 componentes reusables.
- **Bootstrap integrado** vía `npm` y `angular.json` (no por CDN).
- **CSS propio**: los 5 archivos (`tokens`, `base`, `components`, `animations`, `responsive`) se cargan globales desde `angular.json`.
- **`*ngIf`**: 75+ usos (estados vacíos, sesión, rol, errores de formulario).
- **`*ngFor`**: 10+ usos (productos, líneas de carrito, órdenes, usuarios admin).
- **`[(ngModel)]`**: 48+ usos en todos los formularios (login, registro, recover, profile, checkout, cart-qty, admin CRUD).
- **Paso de datos entre páginas**:
  - `/categoria/:slug` reemplaza los 4 HTML viejos de `/categorias/` con uno solo.
  - `/producto/:id` es nuevo: recibe el id por ruta y muestra la ficha del producto correspondiente.
- **Persistencia con localStorage** en servicios `providedIn: 'root'`.
- **Roles distintos**: admin (CRUD + dashboard) y cliente (compra + pedidos).

## Troubleshooting

**`npm start` se queda colgado mostrando solo `> ng serve`:**

Probablemente el puerto 4200 está ocupado por un proceso anterior que no murió.
Angular CLI te pregunta en silencio si quieres usar otro puerto, pero la pregunta
no se muestra en pantalla y bloquea esperando respuesta.

Solución:
```bash
lsof -ti :4200 | xargs kill -9
npm start
```

O directamente usar otro puerto:
```bash
npm start -- --port 4300
```

## Notas

- Las imágenes locales viven en `src/assets/img/` y se sirven desde `/assets/img/...`.
- Las validaciones de formularios se hicieron con Angular Template-driven forms + un validator custom (las 5 reglas de password).
- Sin pasarela de pago real: el checkout simula la transacción y crea la orden en localStorage.
- Sin email transaccional: la recuperación de contraseña muestra la temporal directamente en pantalla.
