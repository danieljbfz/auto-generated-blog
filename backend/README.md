# Backend API

Node.js + Express + TypeScript + Prisma

## Setup

```bash
# 1. Start PostgreSQL
docker run -d \
  --name blog-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=autoblog \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Run migrations
# Execute all SQL files from database/migrations/ in order
docker exec -i blog-postgres psql -U postgres -d autoblog < database/migrations/001-create-extensions-and-header.sql
# Continue with 002, 003, etc...

# 3. Run seeds
docker exec -i blog-postgres psql -U postgres -d autoblog < database/seeds/001_initial_data.sql

# 4. Install and run
npm install
npx prisma generate     # Generates TypeScript types from schema.prisma
cp .env.example .env    # Add your HUGGINGFACE_API_KEY
npm run dev
```

## Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/autoblog
HUGGINGFACE_API_KEY=hf_xxxxx
PORT=3001
```

## Endpoints

- `GET /health` - Health check

- `GET /api` - API info

- `GET /api/articles/feed` - Published articles

- `GET /api/articles/by-slug/:slug` - Article detail

- `POST /api/articles/generate` - Generate AI article

## Scripts

```bash
npm run dev     # Development
npm run build   # Compile TypeScript
npm start       # Production
npm run lint    # Lint code
```