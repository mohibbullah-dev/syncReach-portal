# SyncReach Portal (CMS Admin)

Standalone React admin — deploy this repo alone on **Render** or **Vercel**.

## Setup

```bash
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
# VITE_PUBLIC_SITE_URL=https://sync-reach-public-site.vercel.app
npm run dev            # http://localhost:8081
```

Live: [portal](https://sync-reach-portal-two.vercel.app/) · [public site](https://sync-reach-public-site.vercel.app/)

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
1. Import this repo (Root Directory = `.` if repo is only portal)
2. Framework Preset: **TanStack Start** (or leave auto via `vercel.json`)
3. **Do not** set Output Directory to `dist` — leave blank / auto
4. Env:
   - `VITE_API_URL` = `https://YOUR-API.onrender.com/api`
   - `VITE_PUBLIC_SITE_URL` = `https://sync-reach-public-site.vercel.app`
5. Redeploy after env / config changes

Build uses Nitro `vercel` preset automatically when `VERCEL=1`.
