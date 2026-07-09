/**
 * Configuración de DESARROLLO (`ng serve` / `--configuration development`).
 *
 * Angular reemplaza `environment.ts` por este archivo vía `fileReplacements`
 * en angular.json. Puedes usar aquí una base de datos de pruebas distinta a la
 * de producción, o dejarla vacía para el modo demo offline.
 */
export const environment = {
  production: false,
  firebaseDbUrl: 'https://el-cubo-55db5-default-rtdb.firebaseio.com/',
};
