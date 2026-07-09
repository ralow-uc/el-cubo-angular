# Entrega Semana 8 — Guía paso a paso

Actividad sumativa: **consumir una API REST con GET/POST/PUT/DELETE** + **desplegar en Cloud con Docker** + **video**.
El código ya está listo; esta guía cubre lo que debes ejecutar con tus cuentas.

---

## Parte A — Firebase (backend de la API REST)

### 1. Crear el proyecto y la base de datos
1. Entra a <https://console.firebase.google.com/> e inicia sesión con tu cuenta Google.
2. **Agregar proyecto** → nombre (ej. `el-cubo`) → puedes desactivar Analytics → **Crear**.
3. En el menú lateral: **Compilación → Realtime Database** → **Crear base de datos**.
4. Ubicación: `us-central1` (o la que ofrezca) → **Siguiente**.
5. Reglas de seguridad: elige **modo de prueba** (permite lectura/escritura). Quedan así:
   ```json
   {
     "rules": { ".read": true, ".write": true }
   }
   ```
   > ⚠️ Solo para la demo académica. En producción real esto NO es seguro (cualquiera podría escribir). Para la entrega está bien; menciónalo en el video.

### 2. Cargar la semilla de datos (subir el JSON a Firebase)
1. En **Realtime Database**, con el nodo raíz seleccionado, abre el menú **⋮ (tres puntos) → Importar JSON**.
2. Sube el archivo **`docs/firebase-eventos-seed.json`** de este repo (contiene `{ "eventos": { … } }` con los 8 eventos).
3. Deberías ver el nodo `eventos` con los registros.

### 3. Copiar la URL de la base de datos
- Arriba de los datos aparece la URL, del tipo:
  `https://el-cubo-xxxx-default-rtdb.firebaseio.com/`
- Cópiala **sin la barra final**.

### 4. Configurar la URL (fuera del repo)
La URL de Firebase **no se guarda en el código** (para no exponerla en GitHub). Vive en:
- **En Render (producción):** una variable de entorno `FIREBASE_DB_URL` (ver Parte B).
- **En local (opcional, para probar con `npm start`):** crea el archivo `src/assets/config.json`
  (está en `.gitignore`, no se sube) copiando la plantilla:
  ```bash
  cp src/assets/config.example.json src/assets/config.json
  ```
  y pega tu URL:
  ```json
  { "firebaseDbUrl": "https://el-cubo-xxxx-default-rtdb.firebaseio.com" }
  ```
  Sin este archivo, `npm start` funciona en **modo demo** (localStorage).

### 5. Probar el CRUD localmente
```bash
npm install     # si aún no lo has hecho
npm start        # http://localhost:4200/
```
- Inicia sesión como **admin** (`admin@elcubo.cl` / `Admin2026!`).
- Ve a **Admin → Eventos** (`/admin/eventos`): **crea, edita y elimina**. Cada acción viaja a Firebase (verás los cambios en la consola de Firebase en tiempo real).
- La página pública **`/eventos`** y la vitrina del **home** muestran los datos consumidos (GET).

---

## Parte B — Docker (imagen, contenedor y Cloud)

> Los archivos `Dockerfile`, `nginx.conf` y `.dockerignore` ya están en la raíz de `el-cubo/`.
> La URL de Firebase **no va horneada**: el contenedor la lee de la variable de entorno `FIREBASE_DB_URL` al arrancar (y genera `assets/config.json`). Sin la variable, corre en modo demo.

### 1. Local (con Docker Desktop abierto)
```bash
docker build -t elcubo .
# Con Firebase (reemplaza por tu URL):
docker run -p 80:80 -e FIREBASE_DB_URL="https://el-cubo-xxxx-default-rtdb.firebaseio.com" elcubo
# abre http://localhost/
```
> El nombre de la imagen debe ir sin mayúsculas, ñ, tildes ni espacios (ej. `elcubo`).

### 2. Cloud — Render (reemplazo de Docker Lab)

> **Nota:** Play with Docker (Docker Lab) fue **descontinuado el 1 de marzo de 2026**. Usamos **Render**, que construye la misma imagen del `Dockerfile` y la publica con URL pública HTTPS. Menciónalo en el video.
>
> El contenedor lee el puerto de la variable `PORT` (Render la inyecta); en local sigue usando el 80.

1. Sube todo a GitHub: `git add -A && git commit -m "S8: API REST Firebase + Docker" && git push`.
   - El **repo debe ser público** (o conectar Render a tu GitHub con permisos al repo privado).
2. Entra a <https://render.com/> → **Sign up / Log in** (puedes usar tu cuenta de GitHub). Sin tarjeta de crédito.
3. **New +** → **Web Service** → **Build and deploy from a Git repository** → conecta y elige `el-cubo-angular`.
4. Render detecta el `Dockerfile` (Runtime = **Docker**). Configura:
   - **Name:** `el-cubo` (será parte de la URL).
   - **Region:** la más cercana (ej. Oregon).
   - **Instance Type:** **Free**.
   - Root Directory / Build Command / Start Command: **déjalos vacíos** (el Dockerfile manda).
5. **Environment Variables** → **Add Environment Variable**:
   - **Key:** `FIREBASE_DB_URL`
   - **Value:** tu URL de Realtime Database (ej. `https://el-cubo-xxxx-default-rtdb.firebaseio.com`)
   > Aquí es donde vive la URL — **nunca en el repo**. Puedes cambiarla sin tocar el código.
6. **Create Web Service**. Render construye la imagen y la despliega (el primer build tarda unos minutos).
7. Al terminar, arriba verás la **URL pública**: `https://el-cubo.onrender.com`. Ábrela: el CRUD ya pega a tu Firebase.

> En el plan **Free**, el servicio "duerme" tras ~15 min de inactividad; la primera visita luego de dormir tarda ~30–50 s en despertar. Para el video, **ábrela una vez antes de grabar** para que ya esté despierta.

---

## Parte C — Entregables y video

### Comprimido (.zip / .rar)
- Comprime la carpeta `el-cubo/` **sin** `node_modules/`, `dist/`, `.angular/`.

### Links a compartir en el AVA
- Repositorio **GitHub**.
- Tablero **Trello**.
- **Video** (Kaltura).

### Checklist del video (Kaltura) — cubre el 100% de la pauta (criterio 3)
1. Muestra el **código**: `evento.service.ts` (GET/POST/PUT/DELETE) y el JSON en Firebase.
2. Muestra el **despliegue en Cloud** (Render construyendo la imagen del Dockerfile) y abre la **URL pública**.
3. Navega por las **pantallas que consumen el JSON**: `/eventos`, home (destacados) y **`/admin/eventos`**.
4. Ejecuta el **CRUD en vivo** en la URL pública: crea, edita y elimina un evento (y muestra el cambio reflejado en Firebase).
5. Comenta **características y diseño** (roles, validaciones, tema El Cubo).

---

## Verificación rápida del proyecto
```bash
npm run build                                            # build de producción
npm test -- --watch=false --browsers=ChromeHeadless      # 49 tests (incl. GET/POST/PUT/DELETE)
```
