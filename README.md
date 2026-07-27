# shortlink

Acortador de URLs simple. Construido con [Astro](https://astro.build). Desplegado en [Cloudflare Pages](https://pages.cloudflare.com/). Analytics de clicks con [Cloudflare D1](https://developers.cloudflare.com/d1/).

## Estructura

```text
/
├── public/
│   └── favicon.svg
├── scripts/
│   └── init-db.sql            # Schema D1 (crea tabla clicks_daily)
├── src/
│   ├── data/
│   │   └── links.json         # Todos los enlaces cortos
│   ├── lib/
│   │   ├── db.ts              # Cliente D1 + contadores diarios
│   │   └── links.ts           # Map slug → URL
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       ├── index.astro        # Homepage con sparklines
│       └── api/
│           ├── stats.ts       # JSON de clicks (hoy + 7 días)
│           └── track.ts       # POST interno: incrementa contador
├── astro.config.mjs
├── wrangler.toml              # Configuración Cloudflare Workers/Pages
└── package.json
```

## Cómo funciona

Los enlaces se definen en `src/data/links.json`. Cada entrada tiene un `slug` y una `url` destino:

```json
{ "slug": "youtube", "url": "https://www.youtube.com/channel/UC8LeXCWOalN8SxlrPcG-PaQ" }
```

Cuando se accede a `/.../slug`, la request se resuelve en memoria (lookup en `links.json`, no DB) y responde `302` instantáneamente. En paralelo (via `POST /api/track`) se incrementa el contador diario en D1 — el redirect **nunca** espera a la base de datos. La homepage pinta un mini gráfico de 7 días + contadores de hoy y de la semana.

## Setup en Cloudflare

### 1. Instala dependencias
```bash
pnpm install
```

### 2. Crea base de datos D1
```bash
npx wrangler d1 create shortlink
```
Copia el `database_id` resultante y actualiza `wrangler.toml`.

### 3. Inicializa el schema
```bash
npx wrangler d1 execute shortlink --file=scripts/init-db.sql
```

### 4. Edita links
Modifica `src/data/links.json` con tus URLs.

### 5. Deploy a Cloudflare Pages
Conecta tu repo en [Pages](https://pages.cloudflare.com/) y configura:
- **Build command:** `pnpm build`
- **Build output:** `dist`

## Comandos

| Comando          | Acción                                    |
| :--------------- | :---------------------------------------- |
| `pnpm install`   | Instala dependencias                      |
| `pnpm dev`       | Servidor de desarrollo en `localhost:4321` |
| `pnpm build`     | Build de producción en `./dist/`          |
| `pnpm preview`   | Preview del build local                   |
