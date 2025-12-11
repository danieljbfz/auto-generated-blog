# Auto-Generated Blog Platform

AI-powered blog that generates and publishes articles automatically.

## Stack

- **Frontend**: React + TypeScript + Tailwind CSS

- **Backend**: Node.js + Express + TypeScript + Prisma

- **Database**: PostgreSQL

- **AI**: HuggingFace API

- **Deployment**: Docker + AWS (EC2, ECR, CodeBuild)

## Quick Start (Recommended)

```bash
# Prerequisites: Docker & Docker Compose installed

# 1. Clone and configure
git clone <repo-url>
cd blog-platform
cp .env.example .env  # Add your HUGGINGFACE_API_KEY

# 2. Start everything
docker-compose up --build

# 3. Access
# Frontend: http://localhost:5173
# Backend:  http://localhost:3001/api
```

## Local Development (Without Docker)

```bash
# 1. Start PostgreSQL (via Docker)
docker run -d \
  --name blog-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=autoblog \
  -p 5432:5432 \
  postgres:16-alpine

# 2. Run database migrations
# Connect to postgres and execute SQL files from backend/database/migrations/
docker exec -i blog-postgres psql -U postgres -d autoblog < backend/database/migrations/001-create-extensions-and-header.sql
# Repeat for all migration files...

# 3. Run database seeds
# Connect to postgres and execute SQL files from backend/database/seeds/
docker exec -i blog-postgres psql -U postgres -d autoblog < backend/database/seeds/001_initial_data.sql

# 4. Backend
cd backend
npm install
npx prisma generate     # Generates Prisma Client (no DB connection needed)
cp .env.example .env    # Add your HUGGINGFACE_API_KEY
npm run dev             # Starts on port 3001

# 5. Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env    # Set VITE_API_URL=http://localhost:3001/api
npm run dev             # Starts on port 5173
```

## Live Demo
- **Frontend**: http://13.60.75.58/

- **Backend API**: http://13.60.75.58:3001/api

## Project Structure

```
├── backend/            # Node.js API
├── frontend/           # React app
├── docker-compose.yml
└── buildspec.yml       # AWS CodeBuild
```