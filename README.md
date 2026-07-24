# SyncReach Portal (CMS Admin)

Standalone React admin — deploy this repo alone on **Render** or **Vercel**.

## Setup

```bash
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
# VITE_PUBLIC_SITE_URL=http://localhost:8080
npm run dev            # http://localhost:8081
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Run built server (`node .output/server/index.mjs`) |

## Deploy

### Render
- Root: `.`
- Build: `npm install && npm run build`
- Start: `npm start`
- Env: `VITE_API_URL`, `VITE_PUBLIC_SITE_URL` (set before build / redeploy after URL change)

### Vercel
- Import this repo
- Root Directory: `.`
- Build: `npm run build`
- Env: same `VITE_*` vars  
- Note: app uses Nitro `node-server`; if Vercel SSR fails, use Render Web Service instead.
