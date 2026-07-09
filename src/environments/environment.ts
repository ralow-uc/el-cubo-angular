/**
 * Configuración de PRODUCCIÓN (build por defecto, la que usa Docker).
 *
 * `firebaseDbUrl`: URL base de tu Firebase Realtime Database, SIN barra final.
 * Ejemplo: 'https://el-cubo-1234-default-rtdb.firebaseio.com'
 *
 * Déjala vacía ('') para trabajar sin backend: la app usará el JSON local de
 * respaldo y un almacén en localStorage para el CRUD (modo demo offline).
 * Pégala aquí ANTES de construir la imagen Docker para el despliegue en Cloud.
 */
export const environment = {
  production: true,
  firebaseDbUrl: 'https://el-cubo-55db5-default-rtdb.firebaseio.com/',
};
