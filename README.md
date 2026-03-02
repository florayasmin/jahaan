# Jahaan
why: currently building to learn full-stack development and keep track of my favorite shows 🙃

what: track and rate dramas you watch; filter genres; search based on title, plot, cast, director, writer

## Tech Stack
- TypeScript
- Node.js + Express backend
- Prisma ORM with PostgreSQL configured via `DATABASE_URL` (uses a Supabase Postgres DB)
- React frontend

## Setup
```bash
npm install
npx prisma migrate dev --name init
npm run seed

# run the backend dev server
npm run dev

# run the frontend in a separate terminal
cd frontend && npm install && npm start
```
