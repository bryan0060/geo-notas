# Geo-Notas Realtime

Mapa interactivo en tiempo real donde cualquiera puede ver notas geolocalizadas, y los usuarios logueados pueden crear nuevas notas y reaccionar a las existentes.

**Demo en vivo:** [geo-notas.vercel.app](https://geo-notas.vercel.app/)

## Stack

- **Frontend:** React + Vite
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **Mapa:** MapLibre GL JS + tiles de [OpenFreeMap](https://openfreemap.org/)
- **Backend:** Supabase (Auth, Postgres, Realtime)
- **Deploy:** Vercel

## Funcionalidades

- Lectura del mapa pública, sin necesidad de login
- Crear notas requiere estar autenticado
- Reacciones (👍 ❤️ 😮) en tiempo real, con actualización optimista
- Las notas nuevas aparecen al instante en todos los clientes conectados
- Las notas se ocultan del mapa pasadas 24 hs (no se borran de la base)
- Mapa centrado en el Valle de Aburrá, Colombia, con paneo limitado a esa zona

## Correr el proyecto en local

### Requisitos
- Node.js 18+
- Una cuenta de [Supabase](https://supabase.com/) con un proyecto creado

### Pasos

1. Cloná el repo:
   ```bash
   git clone <url-del-repo>
   cd geo-notas
   ```

2. Instalá las dependencias:
   ```bash
   npm install
   ```

3. Creá un archivo `.env` en la raíz con tus credenciales de Supabase:
   ```
   VITE_SUPABASE_URL=tu-url-de-supabase
   VITE_SUPABASE_ANON_KEY=tu-key-publishable
   ```

4. Corré el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrí `http://localhost:5173` en el navegador.

### Base de datos

El proyecto necesita dos tablas en Supabase: `notas` y `reacciones`, con Row Level Security habilitado (lectura pública, escritura solo para el usuario autenticado dueño del recurso). Además hay que activar Realtime sobre ambas tablas desde el panel de Supabase.

## Créditos

Desarrollado por **Bryan Arias Ríos**. © 2026.

Mapa de [OpenFreeMap](https://openfreemap.org/), datos de OpenStreetMap.