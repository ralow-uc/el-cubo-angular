import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { CategoryComponent } from './pages/category/category.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { EventosComponent } from './pages/eventos/eventos.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RecoverPasswordComponent } from './pages/recover-password/recover-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { AdminDashboardComponent } from './pages/admin/dashboard/admin-dashboard.component';
import { AdminProductsComponent } from './pages/admin/products/admin-products.component';
import { AdminUsersComponent } from './pages/admin/users/admin-users.component';
import { AdminInventoryComponent } from './pages/admin/inventory/admin-inventory.component';
import { adminGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'El Cubo · Juegos de mesa seleccionados' },
  { path: 'categoria/:slug', component: CategoryComponent, title: 'Categoría · El Cubo' },
  { path: 'producto/:id', component: ProductDetailComponent, title: 'Producto · El Cubo' },
  { path: 'eventos', component: EventosComponent, title: 'Eventos · El Cubo' },
  { path: 'login', component: LoginComponent, title: 'Iniciar sesión · El Cubo' },
  { path: 'registro', component: RegisterComponent, title: 'Crear cuenta · El Cubo' },
  { path: 'recuperar', component: RecoverPasswordComponent, title: 'Recuperar contraseña · El Cubo' },
  { path: 'perfil', component: ProfileComponent, canActivate: [authGuard], title: 'Mi perfil · El Cubo' },
  { path: 'carrito', component: CartComponent, canActivate: [authGuard], title: 'Carrito · El Cubo' },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard], title: 'Checkout · El Cubo' },
  { path: 'pedidos', component: OrdersComponent, canActivate: [authGuard], title: 'Mis pedidos · El Cubo' },
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent, title: 'Admin · El Cubo' },
      { path: 'productos', component: AdminProductsComponent, title: 'Admin · Productos' },
      { path: 'usuarios', component: AdminUsersComponent, title: 'Admin · Usuarios' },
      { path: 'inventario', component: AdminInventoryComponent, title: 'Admin · Inventario' },
    ],
  },
  { path: '**', redirectTo: '' },
];
