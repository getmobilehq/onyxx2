# Onyx Report - Claude Code Setup & Development Loop Guide

## Prerequisites

Before starting, ensure you have:

```bash
# Required software
- Node.js 20+ (LTS)
- pnpm 8+ (package manager)
- Git
- Docker Desktop (for local databases)
- VS Code or Cursor IDE (recommended)
- Claude Code CLI installed
```

---

## STEP 1: Install Claude Code

### Option A: Via npm (Recommended)
```bash
# Install Claude Code globally
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
```

### Option B: Via Homebrew (macOS)
```bash
brew install anthropic/tap/claude-code
```

### Option C: Direct Download
```bash
# Download from Anthropic's website
# https://docs.anthropic.com/claude-code
```

---

## STEP 2: Authenticate Claude Code

```bash
# Login to Claude Code (opens browser for auth)
claude login

# Verify authentication
claude whoami
```

---

## STEP 3: Create Project Directory

```bash
# Create and navigate to project directory
mkdir onyx-report
cd onyx-report

# Initialize git
git init

# Create initial structure
mkdir -p docs
```

---

## STEP 4: Add the Development Prompt

Copy the complete prompt file to your project:

```bash
# Create the prompt file in your project
# Copy ONYX-CLAUDE-CODE-PROMPT-COMPLETE.md to:
cp ~/Downloads/ONYX-CLAUDE-CODE-PROMPT-COMPLETE.md ./docs/CLAUDE-CODE-PROMPT.md
```

---

## STEP 5: Configure Claude Code Project

Create a Claude Code configuration file:

```bash
# Create .claude/config.json
mkdir -p .claude
```

```json
// .claude/config.json
{
  "project": {
    "name": "onyx-report",
    "description": "B2B SaaS for Facility Condition Assessment",
    "type": "fullstack"
  },
  "context": {
    "files": [
      "docs/CLAUDE-CODE-PROMPT.md"
    ],
    "alwaysInclude": [
      "package.json",
      "apps/api/prisma/schema.prisma",
      "tsconfig.json"
    ]
  },
  "preferences": {
    "language": "typescript",
    "packageManager": "pnpm",
    "testFramework": "vitest",
    "formatting": "prettier"
  }
}
```

---

## STEP 6: Initialize the Development Loop

### Start Claude Code in your project

```bash
# Start Claude Code interactive session
cd onyx-report
claude

# Or start with the prompt context loaded
claude --context docs/CLAUDE-CODE-PROMPT.md
```

---

## STEP 7: The RAPID Development Loop

Use this iterative loop pattern for efficient development:

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAPID DEVELOPMENT LOOP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  REQUEST │ ──▶ │  REVIEW  │ ──▶ │   RUN    │               │
│   │          │     │          │     │          │               │
│   │ Ask Claude│     │ Check    │     │ Test the │               │
│   │ to build │     │ the code │     │ output   │               │
│   └──────────┘     └──────────┘     └────┬─────┘               │
│        ▲                                  │                      │
│        │           ┌──────────┐          │                      │
│        │           │  REFINE  │          │                      │
│        └───────────│          │◀─────────┘                      │
│                    │ Iterate  │                                  │
│                    │ & improve│                                  │
│                    └──────────┘                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Loop Commands Pattern

```bash
# 1. REQUEST - Ask Claude to build something
> Create the monorepo structure as specified in Section 2.2 of the prompt

# 2. REVIEW - Claude shows you the code
# (Read and understand what was generated)

# 3. RUN - Test it
> Run pnpm install and verify the structure

# 4. REFINE - Iterate if needed
> The api package is missing the prisma dependency, please add it
```

---

## STEP 8: Phase-by-Phase Implementation Commands

### PHASE 1: Foundation (Week 1-4)

```bash
# Week 1-2: Project Setup
> Initialize the monorepo structure with pnpm workspaces as defined in Section 2.2

> Create the base tsconfig.json files for the monorepo

> Set up the shared package with common types and utilities

> Create the API app structure with Express and TypeScript

> Create the Web app structure with Vite, React, and TypeScript

# Week 3-4: Authentication
> Set up Auth0 integration following Section 12.1 - create the auth middleware

> Implement the JWT validation middleware with role extraction

> Create the auth routes: login, logout, refresh, me

> Add the RBAC middleware that checks permissions per route

> Test authentication flow end-to-end
```

### PHASE 2: Core API (Week 5-8)

```bash
# Database Setup
> Create the Prisma schema based on Section 3.1 - start with Organization, Branch, Building, User tables

> Add the seed data for Uniformat II elements from Section 3.2

> Run prisma migrate dev to create the database

# Core Endpoints
> Implement Organizations CRUD endpoints following Section 4.2

> Implement Branches CRUD with organization scoping

> Implement Buildings CRUD with branch scoping and FCI fields

> Implement Users CRUD with role assignment and branch access

> Add pagination, filtering, and sorting to list endpoints
```

### PHASE 3: Assessment Data (Week 9-12)

```bash
# Assessment Workflow
> Implement Assessments CRUD with status workflow (draft → in_progress → submitted → in_review → approved)

> Create assessment element assignment endpoints

> Implement the 18 Type Fields schema for AssessmentElements

> Add Deficiencies CRUD with severity, priority, and cost fields

> Implement photo upload to S3 with thumbnail generation

# Calculations
> Implement the FCI calculation service: (Total DM / CRV) × 100

> Implement RUL calculation: (Year Installed + Expected Lifetime) - Current Year

> Add automatic recalculation triggers on assessment approval
```

### PHASE 4: Frontend Core (Week 13-16)

```bash
# Setup
> Set up React Router with the route structure from the prompt

> Create the AppShell layout with Sidebar, Header, and main content area

> Implement the authentication flow with Auth0 React SDK

> Create the Zustand stores for auth, ui, and app state

# Core Pages
> Build the Dashboard page with StatCards and charts

> Build the Buildings list page with DataTable component

> Build the Building detail page with tabs for info, assessments, analytics

> Create the BuildingForm for create/edit with validation
```

### PHASE 5: Assessment UI (Week 17-20)

```bash
# Assessment Creation
> Build the AssessmentWizard multi-step form component

> Create the ElementGrid for Uniformat element selection

> Implement team assignment step with user search

> Add schedule and deadline configuration

# Field Assessment Interface
> Build the mobile-optimized assessment view

> Create the ElementForm with all 18 Type Fields

> Build the DeficiencyForm with photo capture

> Implement the condition rating component (1-5 scale)

> Add progress tracking and element navigation
```

### PHASE 6: Review & Reports (Week 21-24)

```bash
# Review Workflow
> Build the assessment review interface for Branch Managers

> Implement approve/reject actions with comments

> Create the assessment timeline/history component

> Add notification triggers on status changes

# Reports & Analytics
> Implement PDF report generation with charts

> Build Excel export functionality

> Create the portfolio analytics dashboard

> Add FCI trend charts and condition distribution
```

### PHASE 7: PWA & Offline (Week 25-28)

```bash
# PWA Setup
> Configure Workbox service worker as specified in Section 17.5

> Set up IndexedDB with Dexie following Section 17.2

> Implement the SyncManager for offline operations

# Offline Functionality
> Add offline detection and UI indicators

> Implement optimistic updates for assessment data

> Create the sync queue for pending operations

> Build conflict resolution UI for sync conflicts

> Test offline assessment workflow end-to-end
```

### PHASE 8: Polish & Launch (Week 29-32)

```bash
# Optimization
> Add loading states and skeleton screens throughout

> Implement error boundaries and error states

> Optimize bundle size and lazy loading

> Add accessibility improvements (ARIA, keyboard nav)

# Production Readiness
> Set up Docker configuration from Section 13.4

> Configure CI/CD pipeline from Section 13.3

> Set up monitoring and alerting

> Create production environment variables

> Run security audit and fix issues
```

---

## STEP 9: Useful Claude Code Commands

### General Commands
```bash
# Start interactive session
claude

# Start with specific context
claude --context docs/CLAUDE-CODE-PROMPT.md

# Run a single command
claude -c "Create the User model in Prisma schema"

# Continue previous conversation
claude --continue
```

### Project Commands
```bash
# Ask Claude to explain code
> Explain how the RBAC middleware works

# Ask for code review
> Review the BuildingController for security issues

# Ask for tests
> Write unit tests for the FCI calculation service

# Ask for refactoring
> Refactor the AssessmentService to use dependency injection

# Debug issues
> This test is failing with error X, help me fix it
```

### Reference the Prompt
```bash
# Reference specific sections
> Following Section 4.2 API Specification, implement the Buildings endpoints

> Using the component specs from Section 16, create the BuildingCard component

> Check my implementation against the coding standards in Section 7
```

---

## STEP 10: Daily Development Workflow

### Morning Standup with Claude
```bash
claude
> What did we complete yesterday? Summarize our progress on Phase 2.
> What should we focus on today based on the implementation roadmap?
```

### Development Session
```bash
# 1. Pick a task from the current phase
> Let's implement the Branch API endpoints today

# 2. Break it down
> List all the endpoints we need for Branches based on Section 4.2

# 3. Implement one by one
> Create the POST /api/v1/branches endpoint with validation

# 4. Test as you go
> Write an integration test for the create branch endpoint

# 5. Commit frequently
> Summarize what we built for a git commit message
```

### End of Day
```bash
> Summarize what we accomplished today
> What blockers or issues should we address tomorrow?
> Update the task list with our progress
```

---

## STEP 11: Project Structure After Setup

```
onyx-report/
├── .claude/
│   └── config.json           # Claude Code config
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   └── server.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── stores/
│       │   └── App.tsx
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   └── docker-compose.yml
├── docs/
│   └── CLAUDE-CODE-PROMPT.md  # The master prompt
├── package.json               # Root workspace
├── pnpm-workspace.yaml
├── tsconfig.json
└── README.md
```

---

## STEP 12: Quick Start Commands

```bash
# ONE-TIME SETUP
# ==============

# 1. Install Claude Code
npm install -g @anthropic-ai/claude-code

# 2. Create project
mkdir onyx-report && cd onyx-report
git init

# 3. Copy prompt file
mkdir docs
# (copy ONYX-CLAUDE-CODE-PROMPT-COMPLETE.md to docs/CLAUDE-CODE-PROMPT.md)

# 4. Start Claude Code
claude --context docs/CLAUDE-CODE-PROMPT.md

# 5. Initialize project (first command to Claude)
> Initialize the complete monorepo structure as specified in Section 2.2, 
> including pnpm workspaces, TypeScript configs, and all package.json files.
> Then create the Prisma schema from Section 3.1.


# DAILY DEVELOPMENT
# =================

# Start Claude Code
cd onyx-report
claude --context docs/CLAUDE-CODE-PROMPT.md --continue

# Or shorter form once .claude/config.json is set up
claude
```

---

## Troubleshooting

### Claude Code won't start
```bash
# Check Node version
node --version  # Should be 20+

# Reinstall Claude Code
npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code

# Clear cache
claude cache clear
```

### Context too large
```bash
# Use focused context
claude --context docs/CLAUDE-CODE-PROMPT.md#section-3

# Or reference sections in conversation
> Focusing only on Section 3 Database Schema, create the Prisma models
```

### Lost conversation context
```bash
# Continue previous session
claude --continue

# Or start fresh with summary
> We've completed Phase 1 and 2. We're now on Phase 3, Assessment Data.
> The monorepo is set up, auth works, and core CRUD is done.
> Let's continue with implementing the Assessment endpoints.
```

---

## Tips for Effective Claude Code Usage

1. **Be Specific** - Reference section numbers from the prompt
2. **Iterate Small** - Build one component/endpoint at a time
3. **Test Continuously** - Ask Claude to write tests alongside code
4. **Commit Often** - Keep git history clean with focused commits
5. **Review Everything** - Don't blindly accept code, understand it
6. **Use the Prompt** - The prompt is your source of truth
7. **Document Decisions** - Note any deviations from the prompt

---

*Ready to build! Start with Step 1 and work through systematically.*
