# El Cubo

Sitio de **El Cubo**, PYME ficticia de juegos de mesa, construido con **Angular 19** y standalone components.

E-commerce frontend con catálogo dinámico por categoría, ficha de producto, autenticación, carrito, checkout simulado, historial de pedidos y panel de administración. Toda la persistencia vive en `localStorage`.

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
src/app/
├── components/        ← navbar, footer, toast, game-card (reusables)
├── pages/             ← cada ruta del sitio
│   ├── home/
│   ├── category/      ← una sola página dinámica por :slug
│   ├── product-detail/← una sola página dinámica por :id
│   ├── login/ register/ recover-password/ profile/
│   ├── cart/ checkout/ orders/
│   └── admin/         ← dashboard, products, users, inventory
├── services/          ← AuthService, ProductService, CartService, OrderService, ToastService
├── guards/            ← authGuard, adminGuard funcionales
├── validators/        ← passwordValidator, ageValidator, matchControlValidator, cardExpiryValidator
├── models/            ← interfaces TypeScript (User, Product, Cart, Order)
└── data/              ← seed.ts con datos iniciales (12 productos, 2 usuarios)
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
