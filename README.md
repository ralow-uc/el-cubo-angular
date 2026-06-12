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
├── services/          ← AuthService, ProductService, CartService, OrderService
├── guards/            ← authGuard, adminGuard funcionales
├── validators/        ← passwordValidator (8-18, mayús+minús+dígito+especial)
├── models/            ← interfaces TypeScript (User, Product, Cart, Order)
└── data/              ← seed.ts con datos iniciales (12 productos, 2 usuarios)
```

## Stack

- Angular 19 con standalone components y signals
- Bootstrap 5 (instalado vía npm, importado en `angular.json`)
- Template-driven forms con validators custom
- Routing con guards funcionales (`authGuard`, `adminGuard`)
- Persistencia en `localStorage` encapsulada en servicios singleton

## Notas

- Las imágenes locales viven en `src/assets/img/` y se sirven desde `/assets/img/...`.
- Sin pasarela de pago real: el checkout simula la transacción y crea la orden en `localStorage`.
- Sin email transaccional: la recuperación de contraseña muestra la temporal directamente en pantalla.
