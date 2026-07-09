#!/bin/sh
# Genera assets/config.json al arrancar el contenedor, tomando la URL de
# Firebase desde la variable de entorno FIREBASE_DB_URL (definida en Render).
# Así la URL nunca vive en el repositorio. Si no está definida, queda en modo
# demo (localStorage).
#
# La imagen oficial de nginx ejecuta automáticamente los scripts de
# /docker-entrypoint.d/*.sh antes de levantar el servidor.
set -e

ASSETS_DIR="/usr/share/nginx/html/assets"
mkdir -p "$ASSETS_DIR"

cat > "$ASSETS_DIR/config.json" <<EOF
{ "firebaseDbUrl": "${FIREBASE_DB_URL:-}" }
EOF

if [ -n "${FIREBASE_DB_URL:-}" ]; then
  echo "[config] firebaseDbUrl configurada desde FIREBASE_DB_URL"
else
  echo "[config] FIREBASE_DB_URL no definida → modo demo (localStorage)"
fi
