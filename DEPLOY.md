# Guía de Despliegue - DomainStats

## 1. Base de Datos (PostgreSQL)
- Utiliza **Render PostgreSQL** o **Neon.tech** para una base de datos gratuita/pro.
- Ejecuta el contenido de `backend/models/schema.sql` para crear las tablas.
- Guarda la `EXTERNAL_URL` o `Connection String`.

## 2. Backend (Render / Heroku)
1. Conecta tu repo de GitHub.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `node index.js`
5. **Variables de Entorno (Environment Variables):**
   - `DATABASE_URL`: Tu URL de PostgreSQL.
   - `JWT_SECRET`: Una cadena aleatoria larga.
   - `STRIPE_SECRET_KEY`: Tu clave privada de Stripe.
   - `FRONTEND_URL`: La URL que te asigne Netlify (ej. `https://domainstats.netlify.app`).
   - `NODE_ENV`: `production`

## 3. Frontend (Netlify)
1. Conecta tu repo de GitHub.
2. Base Directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. **Variables de Entorno:**
   - `VITE_API_URL`: La URL de tu backend en Render (ej. `https://domainstats-api.onrender.com/api`).

## 4. Automatización y Seguridad
- El archivo `index.js` ya incluye el **Cron Job** que se ejecuta cada medianoche para revisar suscripciones.
- Render y Netlify proporcionan **SSL (HTTPS)** automáticamente.
- El script de rastreo (`tracking.js`) ahora debe apuntar a la URL de producción. Actualiza la variable `backendUrl` en `backend/public/tracking.js` con tu URL de Render.
