# PrüfungStore Fullstack (React + Express + SQLite + Docker)

## What was added
- `frontend/`: React (Vite) storefront + admin dashboard
- `backend/`: Express API + SQLite database
- `docker-compose.yml`: full deployment stack

## Key features
- Products are stored in DB and loaded dynamically.
- Orders are stored in DB and stock is decremented automatically.
- After order creation, API returns a WhatsApp URL targeting: `0621740209` (normalized as `212621740209`).
- Admin dashboard can add/edit/delete books and view stock + recent orders.
- Admin can upload product image files directly (JPG/PNG/WEBP), not only URL.
- Admin portal supports username/password login and returns secure admin token.

## Local development
1. Backend
   - `cd backend`
   - copy `.env.example` to `.env`
   - `npm install`
   - `npm run dev`
2. Frontend
   - `cd frontend`
   - `npm install`
   - `npm run dev`

Frontend: http://localhost:3000  
Backend: http://localhost:4000/api/health

## Docker deployment
1. From project root, copy `.env.example` to `.env` and set `ADMIN_TOKEN`.
2. Run:
   - `docker compose up --build -d`
3. Open:
   - App: http://localhost:3000
   - API health: http://localhost:4000/api/health

## Free Render deployment
- The included `render.yaml` uses Render's free plan for both services.
- Free backend storage is ephemeral: SQLite changes and uploaded images can be lost after a restart or redeploy.
- Use a paid persistent disk, or move the database and uploads to managed storage, before using this for real orders.

## Admin access
- Go to `/admin` in React app.
- Login with `ADMIN_USERNAME` + `ADMIN_PASSWORD`.
- Or use `ADMIN_TOKEN` manually for direct connection.
