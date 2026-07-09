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

### 4. Pegar la URL en la app
- Abre **`src/environments/environment.ts`** y pega la URL en `firebaseDbUrl`:
  ```ts
  export const environment = {
    production: true,
    firebaseDbUrl: 'https://el-cubo-xxxx-default-rtdb.firebaseio.com',
  };
  ```
- (Opcional) Haz lo mismo en `environment.development.ts` para usar Firebase también con `npm start`.

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
> **Importante:** pega la URL de Firebase en `environment.ts` **antes** de construir la imagen (el valor se “hornea” en el build de producción).

### 1. Local (con Docker Desktop abierto)
```bash
docker build -t elcubo .
docker run -p 80:80 elcubo
# abre http://localhost/
```
> El nombre de la imagen debe ir sin mayúsculas, ñ, tildes ni espacios (ej. `elcubo`).

### 2. Cloud — Docker Lab (Play-with-Docker)
1. Sube todo a GitHub: `git add -A && git commit -m "S8: API REST Firebase + Docker" && git push`.
2. Entra a <https://labs.play-with-docker.com/> e inicia sesión con tu cuenta de Docker/GitHub.
3. **ADD NEW INSTANCE**. En la consola:
   ```bash
   git clone <URL-DE-TU-REPO>.git
   cd <carpeta-del-repo>/el-cubo        # donde está el Dockerfile
   docker build -t elcubo .
   docker run -p 80:80 elcubo
   ```
4. Cuando termine, haz clic en **OPEN PORT** e ingresa **80** → se abre la **URL pública**.
   - Si el botón del puerto no aparece solo, usa **OPEN PORT** en la barra superior.
5. La instancia dura **~4 horas**; si expira, vuelve a crear una y repite `docker build`/`docker run`.

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
2. Muestra la **subida a Docker Lab** (build + run) y abre la **URL pública**.
3. Navega por las **pantallas que consumen el JSON**: `/eventos`, home (destacados) y **`/admin/eventos`**.
4. Ejecuta el **CRUD en vivo** en la URL pública: crea, edita y elimina un evento (y muestra el cambio reflejado en Firebase).
5. Comenta **características y diseño** (roles, validaciones, tema El Cubo).

---

## Verificación rápida del proyecto
```bash
npm run build                                            # build de producción
npm test -- --watch=false --browsers=ChromeHeadless      # 49 tests (incl. GET/POST/PUT/DELETE)
```
