# Backend (Supabase + Express)

## Requirements
- Node.js 18+
- Supabase project

## Environment variables
Set these in `.env`:

- `PORT=5001`
- `SUPABASE_URL=...`
- `SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

## Database setup
1. Open Supabase SQL editor.
2. Run `backend/server/database/supabase/01_schema.sql`.

## Run backend
```bash
npm run server
```

## Health check
- `GET /api/health`

## Main APIs
- `POST /api/auth/register`
- `POST /api/auth/login/:role`
- `GET /api/auth/profile/:id`
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/register`
- `GET /api/events/:id/registrations`
