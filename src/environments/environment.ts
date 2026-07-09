/**
 * Configuración de PRODUCCIÓN (build por defecto, la que usa Docker).
 *
 * NOTA: la URL de Firebase ya NO vive aquí (para no exponerla en el repo).
 * Se carga en tiempo de ejecución desde `assets/config.json` vía
 * `ConfigService`; en el contenedor la genera el entrypoint a partir de la
 * variable de entorno `FIREBASE_DB_URL`.
 */
export const environment = {
  production: true,
};
