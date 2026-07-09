# ============================================================
#  El Cubo — imagen Docker (guía Semana 8)
#  Build multi-etapa: Node compila la app Angular y Nginx la sirve.
# ============================================================

# --- Etapa 1: instalar dependencias y compilar la app ---
FROM node:22-alpine AS build
WORKDIR /app

# Copiamos primero los manifiestos para aprovechar la caché de capas.
COPY package.json package-lock.json ./
RUN npm ci

# Copiamos el resto del código y generamos el build de producción.
COPY . .
RUN npm run build

# --- Etapa 2: servir los archivos estáticos con Nginx ---
FROM nginx:alpine

# Configuración de Nginx con fallback SPA (todas las rutas -> index.html).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# IMPORTANTE: el builder "application" de Angular deja los archivos en
# dist/el-cubo/browser. Esa es la ruta exacta que sirve Nginx.
COPY --from=build /app/dist/el-cubo/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
