# TaskFlow - Task Management System

## Overview
A full-stack Task Management System (Track A) built with Node.js/TypeScript backend and Next.js frontend.

## Architecture

### Backend (Node.js + TypeScript + Prisma + SQLite)
- **Location**: `Backend/`
- **Port**: 3001
- **Entry**: `Backend/src/index.ts`
- **Database**: SQLite (`Backend/prisma/dev.db`)
- **ORM**: Prisma 6

#### Key Directories
- `Backend/src/controllers/` - Route controllers (auth, task)
- `Backend/src/routes/` - Express routers
- `Backend/src/middleware/` - Auth middleware (JWT verification)
- `Backend/src/lib/` - Prisma client, JWT helpers
- `Backend/src/validators/` - Zod validation schemas
- `Backend/prisma/schema.prisma` - Database schema (User, Task, RefreshToken)

#### API Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (returns access + refresh tokens)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (invalidates refresh token)
- `GET /tasks` - List tasks (pagination, filter by status, search by title)
- `POST /tasks` - Create task
- `GET /tasks/:id` - Get task by ID
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/toggle` - Toggle task completion status

### Frontend (Next.js 14 + TypeScript + Tailwind CSS)
- **Location**: `Frontend/`
- **Port**: 5000
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS

#### Key Files
- `Frontend/app/page.tsx` - Root redirect (checks auth, sends to login or dashboard)
- `Frontend/app/(auth)/login/page.tsx` - Login page
- `Frontend/app/(auth)/register/page.tsx` - Register page
- `Frontend/app/dashboard/page.tsx` - Task dashboard
- `Frontend/components/TaskCard.tsx` - Individual task card with edit/delete/toggle
- `Frontend/components/TaskForm.tsx` - Modal form for create/edit tasks
- `Frontend/lib/api.ts` - Axios instance with JWT interceptors and refresh logic
- `Frontend/lib/auth.ts` - Token management helpers

## Tech Stack
- **Backend**: Node.js 18, TypeScript, Express 5, Prisma 6, SQLite, JWT (jsonwebtoken), bcryptjs, Zod
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Axios, react-hot-toast

## Running the Project
- Backend workflow: `cd Backend && DATABASE_URL='file:./dev.db' npx ts-node src/index.ts`
- Frontend workflow: `cd Frontend && npm run dev -- --port 5000`
- Frontend proxies `/api/*` → `http://localhost:3001/*`

## Authentication Flow
1. User registers/logs in → receives short-lived access token (15m) + long-lived refresh token (7d)
2. Axios interceptor attaches access token to all requests
3. On 401 response, interceptor automatically uses refresh token to get new access token
4. Refresh token rotation: old token invalidated, new pair issued
5. Logout: refresh token deleted from database

## Database Schema
- **User**: id, email, name, password (hashed), timestamps
- **Task**: id, title, description?, status (PENDING/IN_PROGRESS/COMPLETED), userId, timestamps
- **RefreshToken**: id, token, userId, expiresAt, createdAt
