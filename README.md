# Onyx Report

> B2B SaaS Platform for Facility Condition Assessment

## Overview

Onyx Report is a comprehensive facility condition assessment platform designed for commercial real estate organizations. It enables property managers, assessors, and executives to assess, manage, and report on building conditions across distributed portfolios.

### Key Features

- **Multi-branch architecture** - True distributed portfolio management
- **Offline-first mobile** - Field work without connectivity
- **Uniformat II standard** - Industry-compliant element classification
- **Automated FCI/RUL** - Real-time condition calculations
- **Role-based workflows** - Purpose-built for each user type

## Tech Stack

### Frontend
- React 18 + TypeScript 5
- Vite 5
- TailwindCSS 3
- TanStack Query v5
- Zustand 4
- React Router v6

### Backend
- Node.js 20 LTS
- Express.js 4
- TypeScript 5
- Prisma 5 ORM
- PostgreSQL 15
- Redis 7

### Infrastructure
- pnpm workspaces (monorepo)
- Turbo (build orchestration)
- Docker Compose (local dev)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd onyxx
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start database services**
   ```bash
   docker-compose up -d
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example apps/api/.env
   # Edit apps/api/.env with your configuration
   ```

5. **Run database migrations**
   ```bash
   pnpm db:migrate
   pnpm db:seed
   ```

6. **Start development servers**
   ```bash
   # Start both web and api
   pnpm dev

   # Or start individually
   pnpm dev:web   # Frontend on http://localhost:5173
   pnpm dev:api   # Backend on http://localhost:3001
   ```

## Project Structure

```
onyxx/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   │
│   └── api/                 # Express backend
│       ├── src/
│       ├── prisma/
│       └── package.json
│
├── packages/
│   └── shared/              # Shared TypeScript code
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── docs/                    # Documentation
├── .claude/                 # Claude Code config
├── docker-compose.yml       # Local development services
├── turbo.json              # Turborepo configuration
├── pnpm-workspace.yaml     # pnpm workspace config
└── package.json            # Root package.json
```

## Available Scripts

### Development
```bash
pnpm dev          # Start all apps
pnpm dev:web      # Start frontend only
pnpm dev:api      # Start backend only
```

### Building
```bash
pnpm build        # Build all apps
pnpm typecheck    # Type check all apps
pnpm lint         # Lint all apps
```

### Database
```bash
pnpm db:migrate   # Run Prisma migrations
pnpm db:seed      # Seed database
pnpm db:studio    # Open Prisma Studio
```

### Testing
```bash
pnpm test         # Run all tests
pnpm test:unit    # Run unit tests
pnpm test:e2e     # Run E2E tests
```

## Documentation

- [Complete Platform Specification](docs/ONYX-CLAUDE-CODE-PROMPT-COMPLETE.md)
- API Documentation: http://localhost:3001/api/v1/docs (when running)

## Architecture

### Entity Hierarchy
```
Organization (Tenant)
  └── Branches (Regions/Portfolios)
      └── Buildings
          └── Assessments (Point-in-time evaluations)
              └── Assessment Elements (Building systems)
                  ├── Deficiencies
                  └── Photos
```

### User Roles
- **Org Admin** - Full organization access
- **Branch Manager** - Branch-scoped management
- **Field Assessor** - Assessment data collection
- **Executive Viewer** - Read-only reporting

## Key Concepts

### FCI (Facility Condition Index)
```
FCI = (Total Deferred Maintenance / Current Replacement Value) × 100

0-5%    = Good
5-10%   = Fair
10-30%  = Poor
30%+    = Critical
```

### RUL (Remaining Useful Life)
```
RUL = (Year Installed + Lifetime Years) - Current Year
```

## Development Phases

- ✅ **Phase 1** - Project Setup (Current)
- 🔄 **Phase 2** - Core API Development
- 📋 **Phase 3** - Assessment Data & Photos
- 📋 **Phase 4** - Frontend Core
- 📋 **Phase 5** - Assessment UI
- 📋 **Phase 6** - Review & Reports
- 📋 **Phase 7** - PWA & Offline
- 📋 **Phase 8** - Polish & Launch

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact the development team.

---

**Version:** 1.0.0
**Last Updated:** January 2026
