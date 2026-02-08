# ONYX REPORT - Claude Code Development Prompt
## Comprehensive Platform Build Instructions v2.0

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Platform:** B2B SaaS for Facility Condition Assessment  
**Target Market:** Commercial Real Estate (Primary), Healthcare, Higher Ed (Secondary)

---

# SECTION 1: PROJECT IDENTITY

## 1.1 What We're Building

**Onyx Report** is a B2B SaaS platform that transforms facility condition assessment data into actionable intelligence for capital planning decisions. The platform helps commercial real estate organizations assess, manage, and report on building conditions across distributed portfolios.

### Target Customers
- **Primary:** Property management firms, corporate RE departments, mid-market REITs managing 25-500+ buildings
- **Secondary:** Healthcare systems, universities, government agencies

### Core Value Proposition
> "See clearly. Decide confidently. Plan strategically."

**Key Differentiators:**
1. **Multi-branch architecture** - True distributed portfolio management
2. **Offline-first mobile** - Field work without connectivity
3. **Uniformat II standard** - Industry-compliant element classification
4. **Automated FCI/RUL** - Real-time condition calculations
5. **Role-based workflows** - Purpose-built for each user type

### What We DON'T Build
- Work orders / CMMS functionality
- Space management / floor plans
- Real-time IoT monitoring
- CAD/Design tools
- Tenant/lease management

---

## 1.2 Entity Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                        ORGANIZATION                              │
│                    (Tenant / Customer)                           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  BRANCH  │   │  BRANCH  │   │  BRANCH  │
    │ (Region) │   │(Portfolio)│   │ (Campus) │
    └────┬─────┘   └────┬─────┘   └────┬─────┘
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    ▼         ▼    ▼         ▼    ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│BUILDING│ │BUILDING│ │BUILDING│ │BUILDING│
└───┬────┘ └────────┘ └───┬────┘ └────────┘
    │                     │
    ▼                     ▼
┌────────────┐       ┌────────────┐
│ ASSESSMENT │       │ ASSESSMENT │
│(Point-in-  │       │(Annual     │
│ time eval) │       │ inspection)│
└─────┬──────┘       └─────┬──────┘
      │                    │
      ▼                    ▼
┌─────────────────────────────────────────┐
│         ASSESSMENT ELEMENTS              │
│    (Uniformat II building systems)       │
│                                          │
│  ┌─────────────────┐  ┌────────────────┐│
│  │   18 Type Fields │  │   Deficiencies ││
│  │   • Identity     │  │   • Category   ││
│  │   • Lifecycle    │  │   • Severity   ││
│  │   • Location     │  │   • Priority   ││
│  │   • Equipment    │  │   • Cost       ││
│  │   • Financial    │  │   • Photos     ││
│  │   • Condition    │  │                ││
│  └─────────────────┘  └────────────────┘│
│                                          │
│            ┌─────────┐                   │
│            │  PHOTOS │                   │
│            └─────────┘                   │
└─────────────────────────────────────────┘
```

---

## 1.3 Four User Personas

### 1. Org Admin (VP of Asset Management)
```
Scope:      ALL branches, buildings, users
Primary:    Setup, configuration, portfolio oversight
Workflow:   Create org → Define branches → Invite users → Monitor portfolio
Key Needs:  Portfolio-wide visibility, cross-branch comparison, investor reporting
```

### 2. Branch Manager (Regional Property Manager)
```
Scope:      ASSIGNED branches only
Primary:    Assessment management, team coordination, approvals
Workflow:   Create buildings → Create assessments → Assign team → Review & approve
Key Needs:  Progress tracking, CapEx planning, branch reporting, deadline management
```

### 3. Field Assessor (Building Engineer)
```
Scope:      ASSIGNED assessments only
Primary:    Field data collection, photos, offline work
Workflow:   Download assessment → Visit building → Assess elements → Submit
Key Needs:  Mobile-first, offline capable, fast data entry, camera integration
```

### 4. Executive Viewer (Head of Investments)
```
Scope:      READ-ONLY access to reports
Primary:    Executive dashboards, PDF reports, data exports
Workflow:   View dashboard → Drill into details → Export reports
Key Needs:  At-a-glance insights, acquisition due diligence data, board materials
```

---

## 1.4 The 5-Phase Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ONYX REPORT WORKFLOW                                 │
├─────────┬─────────────┬──────────────┬────────────┬────────────────────────┤
│ PHASE 1 │   PHASE 2   │   PHASE 3    │  PHASE 4   │       PHASE 5          │
│  SETUP  │PRE-ASSESSMENT│ FIELD WORK   │  REVIEW    │  ANALYTICS/PLANNING    │
├─────────┼─────────────┼──────────────┼────────────┼────────────────────────┤
│         │             │              │            │                        │
│ Org     │ Branch Mgr  │  Assessor    │ Branch Mgr │ All Roles              │
│ Admin   │ creates     │  performs    │ reviews    │ view dashboards        │
│ creates │ assessment  │  mobile      │ & approves │ & generate reports     │
│ org,    │ & assigns   │  field       │ assessment │                        │
│ branches│ assessors   │  assessment  │            │                        │
│ users   │             │              │            │                        │
│         │             │              │            │                        │
├─────────┼─────────────┼──────────────┼────────────┼────────────────────────┤
│Outputs: │Outputs:     │Outputs:      │Outputs:    │Outputs:                │
│• Org    │• Assessment │• 18 Type     │• Validated │• FCI dashboards        │
│  config │  scope      │  Fields data │  data      │• Trend analysis        │
│• Branch │• Element    │• Condition   │• Calculated│• PDF/Excel reports     │
│  struct │  selection  │  ratings     │  FCI       │• CapEx forecasts       │
│• Users  │• Deadlines  │• Deficiencies│• Approved  │• Investment insights   │
│• RBAC   │• Assignees  │• Photos      │  assessment│                        │
└─────────┴─────────────┴──────────────┴────────────┴────────────────────────┘
```

---

## 1.5 Key Domain Concepts

### FCI (Facility Condition Index)
```
                    Total Deferred Maintenance
         FCI = ─────────────────────────────────── × 100
                  Current Replacement Value

┌──────────────┬────────────┬─────────────────────────────┐
│   FCI Range  │  Category  │        Action Required      │
├──────────────┼────────────┼─────────────────────────────┤
│   0% - 5%    │   GOOD     │ Routine maintenance only    │
│   5% - 10%   │   FAIR     │ Minor repairs needed        │
│  10% - 30%   │   POOR     │ Significant investment req  │
│   30%+       │  CRITICAL  │ Major renovation/replace    │
└──────────────┴────────────┴─────────────────────────────┘
```

### RUL (Remaining Useful Life)
```
RUL = (Year Installed + Lifetime Years) - Current Year

Example: HVAC unit installed 2015, lifetime 20 years
         RUL = (2015 + 20) - 2026 = 9 years remaining
         
When RUL ≤ 0: Element is past expected life, flag for replacement
```

### Uniformat II Classification
```
7 Major System Groups → 150+ Individual Elements

┌────────────────────────────────────────────────────────────┐
│ SYSTEM GROUP        │ CODE RANGE │ EXAMPLE ELEMENTS       │
├─────────────────────┼────────────┼────────────────────────┤
│ Electrical          │ D50xx      │ Switchgear, Lighting   │
│ Plumbing            │ D20xx      │ Fixtures, Piping       │
│ Mechanical (HVAC)   │ D30xx      │ Boilers, AHUs, Chillers│
│ Conveying (Elevator)│ D10xx      │ Elevators, Escalators  │
│ Site                │ G10-G30xx  │ Parking, Landscaping   │
│ Structural          │ A10-B10xx  │ Foundation, Superstruc │
│ Architecture        │ B20-C30xx  │ Roofing, Interiors     │
└─────────────────────┴────────────┴────────────────────────┘
```

### 18 Type Fields for Assessment Elements
```
┌─────────────────────────────────────────────────────────────┐
│                    18 TYPE FIELDS                            │
├─────────────────────────────────────────────────────────────┤
│ IDENTITY (1-3)        │ LIFECYCLE (4-6)                     │
│ 1. System Name        │ 4. Lifetime Years                   │
│ 2. Uniformat Code     │ 5. Year Installed                   │
│ 3. System Group       │ 6. Remaining Useful Life (calc)     │
├─────────────────────────────────────────────────────────────┤
│ QUANTITY (7-8)        │ LOCATION (9-11)                     │
│ 7. Unit of Measure    │ 9.  Location Description            │
│ 8. Quantity           │ 10. Floor                           │
│                       │ 11. Room                            │
├─────────────────────────────────────────────────────────────┤
│ EQUIPMENT (12-15)     │ FINANCIAL (16-18)                   │
│ 12. Manufacturer      │ 16. Cost per Unit                   │
│ 13. Model             │ 17. Renewal Factor                  │
│ 14. Serial Number     │ 18. Total Replacement Cost (calc)   │
│ 15. Asset ID          │                                     │
└─────────────────────────────────────────────────────────────┘
```

---

# SECTION 2: TECHNOLOGY STACK

## 2.1 Complete Stack Specification

### Frontend
```yaml
Framework:       React 18.x
Language:        TypeScript 5.x (strict mode)
Build Tool:      Vite 5.x
Styling:         Tailwind CSS 3.x
State (Server):  TanStack Query v5 (React Query)
State (Client):  Zustand 4.x
Routing:         React Router v6
Forms:           React Hook Form + Zod
Charts:          Recharts 2.x
Tables:          TanStack Table v8
Icons:           Lucide React
UI Components:   Custom + shadcn/ui patterns
PWA:             Workbox 7.x
Offline Storage: Dexie.js (IndexedDB wrapper)
```

### Backend
```yaml
Runtime:         Node.js 20.x LTS
Framework:       Express.js 4.x
Language:        TypeScript 5.x (strict mode)
ORM:             Prisma 5.x
Validation:      Zod 3.x
Auth Provider:   Auth0
JWT Library:     jose
File Upload:     Multer + Sharp (image processing)
PDF Generation:  @react-pdf/renderer or Puppeteer
Excel Export:    ExcelJS
Cron Jobs:       node-cron
Logging:         Pino
```

### Database
```yaml
Primary:         PostgreSQL 15.x
Cache:           Redis 7.x
File Storage:    AWS S3
Features:
  - UUID primary keys
  - Row-Level Security (RLS)
  - Soft deletes (deleted_at)
  - Audit columns
  - JSONB for flexible data
```

### Infrastructure
```yaml
Compute:         AWS ECS Fargate (containerized)
Database:        AWS RDS PostgreSQL (Multi-AZ)
Cache:           AWS ElastiCache (Redis)
Storage:         AWS S3 (photos, exports)
CDN:             AWS CloudFront
DNS:             AWS Route 53
Secrets:         AWS Secrets Manager
Monitoring:      AWS CloudWatch + Sentry
CI/CD:           GitHub Actions
IaC:             Terraform
```

---

## 2.2 Project Structure

```
onyx-report/
│
├── apps/
│   │
│   ├── web/                          # React Frontend Application
│   │   ├── public/
│   │   │   ├── manifest.json         # PWA manifest
│   │   │   ├── sw.js                 # Service worker
│   │   │   └── icons/                # App icons
│   │   │
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Base UI components
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Input.tsx
│   │   │   │   │   ├── Select.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── Table.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Toast.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   │
│   │   │   │   ├── layout/           # Layout components
│   │   │   │   │   ├── AppLayout.tsx
│   │   │   │   │   ├── Sidebar.tsx
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── MobileNav.tsx
│   │   │   │   │   └── PageHeader.tsx
│   │   │   │   │
│   │   │   │   ├── features/         # Feature-specific components
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   ├── branches/
│   │   │   │   │   ├── buildings/
│   │   │   │   │   ├── assessments/
│   │   │   │   │   ├── elements/
│   │   │   │   │   ├── deficiencies/
│   │   │   │   │   ├── photos/
│   │   │   │   │   ├── reports/
│   │   │   │   │   └── users/
│   │   │   │   │
│   │   │   │   └── charts/           # Data visualization
│   │   │   │       ├── FCIGauge.tsx
│   │   │   │       ├── FCITrendChart.tsx
│   │   │   │       ├── SystemBreakdown.tsx
│   │   │   │       └── ConditionDistribution.tsx
│   │   │   │
│   │   │   ├── pages/                # Route pages
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginPage.tsx
│   │   │   │   │   ├── ForgotPasswordPage.tsx
│   │   │   │   │   └── AcceptInvitePage.tsx
│   │   │   │   │
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── DashboardPage.tsx
│   │   │   │   │   └── PortfolioDashboard.tsx
│   │   │   │   │
│   │   │   │   ├── branches/
│   │   │   │   │   ├── BranchListPage.tsx
│   │   │   │   │   └── BranchDetailPage.tsx
│   │   │   │   │
│   │   │   │   ├── buildings/
│   │   │   │   │   ├── BuildingListPage.tsx
│   │   │   │   │   ├── BuildingDetailPage.tsx
│   │   │   │   │   └── BuildingFormPage.tsx
│   │   │   │   │
│   │   │   │   ├── assessments/
│   │   │   │   │   ├── AssessmentListPage.tsx
│   │   │   │   │   ├── AssessmentDetailPage.tsx
│   │   │   │   │   ├── AssessmentCreatePage.tsx
│   │   │   │   │   ├── AssessmentReviewPage.tsx
│   │   │   │   │   └── ElementAssessmentPage.tsx
│   │   │   │   │
│   │   │   │   ├── reports/
│   │   │   │   │   ├── ReportsPage.tsx
│   │   │   │   │   └── BuildingReportPage.tsx
│   │   │   │   │
│   │   │   │   └── settings/
│   │   │   │       ├── SettingsPage.tsx
│   │   │   │       ├── UserManagementPage.tsx
│   │   │   │       └── OrganizationPage.tsx
│   │   │   │
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useBuildings.ts
│   │   │   │   ├── useAssessments.ts
│   │   │   │   ├── useOffline.ts
│   │   │   │   ├── useSync.ts
│   │   │   │   └── useCamera.ts
│   │   │   │
│   │   │   ├── services/             # API client
│   │   │   │   ├── api.ts            # Base Axios instance
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── buildings.service.ts
│   │   │   │   ├── assessments.service.ts
│   │   │   │   └── sync.service.ts
│   │   │   │
│   │   │   ├── stores/               # Zustand stores
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── uiStore.ts
│   │   │   │   └── offlineStore.ts
│   │   │   │
│   │   │   ├── lib/                  # Utilities
│   │   │   │   ├── utils.ts
│   │   │   │   ├── formatters.ts
│   │   │   │   ├── validators.ts
│   │   │   │   ├── fci.ts            # FCI calculations
│   │   │   │   ├── offline-db.ts     # IndexedDB setup
│   │   │   │   └── query-keys.ts
│   │   │   │
│   │   │   ├── types/                # TypeScript types
│   │   │   │   ├── api.types.ts
│   │   │   │   ├── entities.types.ts
│   │   │   │   └── forms.types.ts
│   │   │   │
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── routes.tsx
│   │   │
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   │
│   └── api/                          # Express Backend Application
│       ├── src/
│       │   ├── routes/               # API route definitions
│       │   │   ├── index.ts
│       │   │   ├── auth.routes.ts
│       │   │   ├── organizations.routes.ts
│       │   │   ├── branches.routes.ts
│       │   │   ├── buildings.routes.ts
│       │   │   ├── assessments.routes.ts
│       │   │   ├── elements.routes.ts
│       │   │   ├── deficiencies.routes.ts
│       │   │   ├── photos.routes.ts
│       │   │   ├── users.routes.ts
│       │   │   ├── reports.routes.ts
│       │   │   └── sync.routes.ts
│       │   │
│       │   ├── controllers/          # Request handlers
│       │   │   ├── auth.controller.ts
│       │   │   ├── organizations.controller.ts
│       │   │   ├── branches.controller.ts
│       │   │   ├── buildings.controller.ts
│       │   │   ├── assessments.controller.ts
│       │   │   ├── elements.controller.ts
│       │   │   ├── deficiencies.controller.ts
│       │   │   ├── photos.controller.ts
│       │   │   ├── users.controller.ts
│       │   │   ├── reports.controller.ts
│       │   │   └── sync.controller.ts
│       │   │
│       │   ├── services/             # Business logic
│       │   │   ├── auth.service.ts
│       │   │   ├── organization.service.ts
│       │   │   ├── branch.service.ts
│       │   │   ├── building.service.ts
│       │   │   ├── assessment.service.ts
│       │   │   ├── element.service.ts
│       │   │   ├── deficiency.service.ts
│       │   │   ├── photo.service.ts
│       │   │   ├── user.service.ts
│       │   │   ├── report.service.ts
│       │   │   ├── fci.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── sync.service.ts
│       │   │
│       │   ├── middleware/           # Express middleware
│       │   │   ├── auth.middleware.ts
│       │   │   ├── rbac.middleware.ts
│       │   │   ├── tenant.middleware.ts
│       │   │   ├── validate.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── rate-limit.middleware.ts
│       │   │
│       │   ├── validators/           # Zod schemas
│       │   │   ├── auth.validator.ts
│       │   │   ├── building.validator.ts
│       │   │   ├── assessment.validator.ts
│       │   │   └── common.validator.ts
│       │   │
│       │   ├── utils/                # Helpers
│       │   │   ├── response.ts
│       │   │   ├── errors.ts
│       │   │   ├── s3.ts
│       │   │   ├── pdf.ts
│       │   │   └── excel.ts
│       │   │
│       │   ├── types/                # TypeScript types
│       │   │   ├── express.d.ts
│       │   │   └── api.types.ts
│       │   │
│       │   ├── config/               # Configuration
│       │   │   ├── index.ts
│       │   │   ├── database.ts
│       │   │   └── auth0.ts
│       │   │
│       │   └── app.ts                # Express app setup
│       │
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   ├── migrations/           # Migration history
│       │   └── seed/
│       │       ├── index.ts
│       │       ├── uniformat.seed.ts
│       │       └── categories.seed.ts
│       │
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/
│       │
│       ├── tsconfig.json
│       └── package.json
│
│
├── packages/
│   └── shared/                       # Shared code between apps
│       ├── src/
│       │   ├── types/
│       │   │   ├── entities.ts
│       │   │   ├── api.ts
│       │   │   └── enums.ts
│       │   │
│       │   ├── constants/
│       │   │   ├── fci.ts
│       │   │   ├── roles.ts
│       │   │   └── status.ts
│       │   │
│       │   └── utils/
│       │       ├── fci-calculator.ts
│       │       └── formatters.ts
│       │
│       ├── tsconfig.json
│       └── package.json
│
│
├── infrastructure/
│   ├── terraform/                    # Infrastructure as Code
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   │
│   └── docker/
│       ├── Dockerfile.api
│       ├── Dockerfile.web
│       └── docker-compose.yml
│
│
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build
│       ├── deploy-staging.yml
│       └── deploy-production.yml
│
│
├── docs/
│   ├── api/                          # OpenAPI specs
│   ├── architecture/                 # Architecture diagrams
│   └── runbooks/                     # Operations guides
│
│
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspaces config
├── turbo.json                        # Turborepo config
├── .env.example                      # Environment template
├── .eslintrc.js                      # ESLint config
├── .prettierrc                       # Prettier config
└── README.md
```

---

# SECTION 3: DATABASE SCHEMA

## 3.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ORGANIZATION & USERS
// ============================================

model Organization {
  id                String    @id @default(uuid()) @db.Uuid
  name              String    @db.VarChar(255)
  slug              String    @unique @db.VarChar(100)
  settings          Json      @default("{}")
  subscriptionTier  String    @default("starter") @map("subscription_tier") @db.VarChar(50)
  subscriptionStatus String   @default("active") @map("subscription_status") @db.VarChar(50)
  maxBuildings      Int       @default(25) @map("max_buildings")
  maxUsers          Int       @default(10) @map("max_users")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  deletedAt         DateTime? @map("deleted_at")

  branches    Branch[]
  buildings   Building[]
  users       User[]
  assessments Assessment[]
  photos      Photo[]

  @@map("organizations")
}

model User {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  auth0Id        String?   @unique @map("auth0_id") @db.VarChar(255)
  email          String    @db.VarChar(255)
  firstName      String?   @map("first_name") @db.VarChar(100)
  lastName       String?   @map("last_name") @db.VarChar(100)
  role           UserRole
  phone          String?   @db.VarChar(50)
  avatarUrl      String?   @map("avatar_url") @db.VarChar(500)
  isActive       Boolean   @default(true) @map("is_active")
  lastLoginAt    DateTime? @map("last_login_at")
  inviteToken    String?   @unique @map("invite_token") @db.VarChar(255)
  inviteExpiresAt DateTime? @map("invite_expires_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  organization          Organization           @relation(fields: [organizationId], references: [id])
  userBranches          UserBranch[]
  createdAssessments    Assessment[]           @relation("AssessmentCreator")
  approvedAssessments   Assessment[]           @relation("AssessmentApprover")
  assignedAssessments   AssessmentAssignee[]
  assessedElements      AssessmentElement[]
  createdDeficiencies   Deficiency[]
  uploadedPhotos        Photo[]
  syncQueueItems        SyncQueue[]

  @@unique([organizationId, email])
  @@map("users")
}

enum UserRole {
  org_admin
  branch_manager
  assessor
  viewer
}

model UserBranch {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @map("user_id") @db.Uuid
  branchId  String   @map("branch_id") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  branch Branch @relation(fields: [branchId], references: [id], onDelete: Cascade)

  @@unique([userId, branchId])
  @@map("user_branches")
}

// ============================================
// BRANCHES & BUILDINGS
// ============================================

model Branch {
  id             String    @id @default(uuid()) @db.Uuid
  organizationId String    @map("organization_id") @db.Uuid
  name           String    @db.VarChar(255)
  code           String?   @db.VarChar(50)
  addressLine1   String?   @map("address_line1") @db.VarChar(255)
  addressLine2   String?   @map("address_line2") @db.VarChar(255)
  city           String?   @db.VarChar(100)
  state          String?   @db.VarChar(100)
  postalCode     String?   @map("postal_code") @db.VarChar(20)
  country        String    @default("USA") @db.VarChar(100)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")
  deletedAt      DateTime? @map("deleted_at")

  organization Organization  @relation(fields: [organizationId], references: [id])
  buildings    Building[]
  assessments  Assessment[]
  userBranches UserBranch[]

  @@unique([organizationId, name])
  @@map("branches")
}

model Building {
  id                       String    @id @default(uuid()) @db.Uuid
  organizationId           String    @map("organization_id") @db.Uuid
  branchId                 String    @map("branch_id") @db.Uuid
  name                     String    @db.VarChar(255)
  code                     String?   @db.VarChar(50)
  addressLine1             String?   @map("address_line1") @db.VarChar(255)
  addressLine2             String?   @map("address_line2") @db.VarChar(255)
  city                     String?   @db.VarChar(100)
  state                    String?   @db.VarChar(100)
  postalCode               String?   @map("postal_code") @db.VarChar(20)
  country                  String    @default("USA") @db.VarChar(100)
  yearBuilt                Int?      @map("year_built")
  grossSquareFeet          Decimal?  @map("gross_square_feet") @db.Decimal(12, 2)
  currentReplacementValue  Decimal?  @map("current_replacement_value") @db.Decimal(15, 2)
  buildingType             String?   @map("building_type") @db.VarChar(100)
  numFloors                Int?      @map("num_floors")
  description              String?   @db.Text
  latitude                 Decimal?  @db.Decimal(10, 8)
  longitude                Decimal?  @db.Decimal(11, 8)
  imageUrl                 String?   @map("image_url") @db.VarChar(500)
  // Calculated fields (updated by triggers/service)
  currentFci               Decimal   @default(0) @map("current_fci") @db.Decimal(5, 4)
  totalDeferredMaintenance Decimal   @default(0) @map("total_deferred_maintenance") @db.Decimal(15, 2)
  lastAssessmentDate       DateTime? @map("last_assessment_date")
  createdAt                DateTime  @default(now()) @map("created_at")
  updatedAt                DateTime  @updatedAt @map("updated_at")
  createdBy                String?   @map("created_by") @db.Uuid
  updatedBy                String?   @map("updated_by") @db.Uuid
  deletedAt                DateTime? @map("deleted_at")

  organization Organization @relation(fields: [organizationId], references: [id])
  branch       Branch       @relation(fields: [branchId], references: [id])
  assessments  Assessment[]

  @@unique([branchId, name])
  @@index([organizationId])
  @@index([branchId])
  @@index([currentFci])
  @@map("buildings")
}

// ============================================
// ASSESSMENTS
// ============================================

model Assessment {
  id                       String           @id @default(uuid()) @db.Uuid
  organizationId           String           @map("organization_id") @db.Uuid
  branchId                 String           @map("branch_id") @db.Uuid
  buildingId               String           @map("building_id") @db.Uuid
  name                     String           @db.VarChar(255)
  description              String?          @db.Text
  status                   AssessmentStatus @default(draft)
  targetCompletionDate     DateTime?        @map("target_completion_date") @db.Date
  startedAt                DateTime?        @map("started_at")
  submittedAt              DateTime?        @map("submitted_at")
  approvedAt               DateTime?        @map("approved_at")
  approvedById             String?          @map("approved_by") @db.Uuid
  rejectionReason          String?          @map("rejection_reason") @db.Text
  // Calculated fields
  totalElements            Int              @default(0) @map("total_elements")
  completedElements        Int              @default(0) @map("completed_elements")
  totalDeficiencies        Int              @default(0) @map("total_deficiencies")
  totalDeferredMaintenance Decimal          @default(0) @map("total_deferred_maintenance") @db.Decimal(15, 2)
  calculatedFci            Decimal?         @map("calculated_fci") @db.Decimal(5, 4)
  createdAt                DateTime         @default(now()) @map("created_at")
  updatedAt                DateTime         @updatedAt @map("updated_at")
  createdById              String?          @map("created_by") @db.Uuid
  updatedBy                String?          @map("updated_by") @db.Uuid
  deletedAt                DateTime?        @map("deleted_at")

  organization Organization          @relation(fields: [organizationId], references: [id])
  branch       Branch                @relation(fields: [branchId], references: [id])
  building     Building              @relation(fields: [buildingId], references: [id])
  createdBy    User?                 @relation("AssessmentCreator", fields: [createdById], references: [id])
  approvedBy   User?                 @relation("AssessmentApprover", fields: [approvedById], references: [id])
  assignees    AssessmentAssignee[]
  elements     AssessmentElement[]

  @@index([organizationId])
  @@index([buildingId])
  @@index([status])
  @@map("assessments")
}

enum AssessmentStatus {
  draft
  in_progress
  submitted
  in_review
  approved
  rejected
}

model AssessmentAssignee {
  id           String   @id @default(uuid()) @db.Uuid
  assessmentId String   @map("assessment_id") @db.Uuid
  userId       String   @map("user_id") @db.Uuid
  assignedAt   DateTime @default(now()) @map("assigned_at")
  assignedById String?  @map("assigned_by") @db.Uuid

  assessment Assessment @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  user       User       @relation(fields: [userId], references: [id])

  @@unique([assessmentId, userId])
  @@map("assessment_assignees")
}

// ============================================
// UNIFORMAT & ELEMENTS
// ============================================

model UniformatElement {
  id                   String  @id @default(uuid()) @db.Uuid
  code                 String  @unique @db.VarChar(20)
  name                 String  @db.VarChar(255)
  description          String? @db.Text
  systemGroup          String  @map("system_group") @db.VarChar(100)
  level                Int     @db.SmallInt
  parentCode           String? @map("parent_code") @db.VarChar(20)
  defaultLifetimeYears Int?    @map("default_lifetime_years")
  defaultUnitOfMeasure String? @map("default_unit_of_measure") @db.VarChar(50)
  isActive             Boolean @default(true) @map("is_active")
  sortOrder            Int?    @map("sort_order")

  assessmentElements AssessmentElement[]

  @@index([systemGroup])
  @@index([level])
  @@map("uniformat_elements")
}

model AssessmentElement {
  id                   String    @id @default(uuid()) @db.Uuid
  assessmentId         String    @map("assessment_id") @db.Uuid
  uniformatElementId   String    @map("uniformat_element_id") @db.Uuid
  // Type Fields 1-3: Identity
  systemName           String?   @map("system_name") @db.VarChar(255)
  uniformatCode        String    @map("uniformat_code") @db.VarChar(20)
  systemGroup          String    @map("system_group") @db.VarChar(100)
  // Type Fields 4-6: Lifecycle
  lifetimeYears        Int?      @map("lifetime_years")
  yearInstalled        Int?      @map("year_installed")
  remainingUsefulLife  Int?      @map("remaining_useful_life")
  // Type Fields 7-8: Quantity
  unitOfMeasure        String?   @map("unit_of_measure") @db.VarChar(50)
  quantity             Decimal?  @db.Decimal(12, 2)
  // Type Fields 9-11: Location
  locationDescription  String?   @map("location_description") @db.Text
  floor                String?   @db.VarChar(50)
  room                 String?   @db.VarChar(100)
  // Type Fields 12-15: Equipment
  manufacturer         String?   @db.VarChar(255)
  model                String?   @db.VarChar(255)
  serialNumber         String?   @map("serial_number") @db.VarChar(255)
  assetId              String?   @map("asset_id") @db.VarChar(255)
  // Type Fields 16-18: Financial
  costPerUnit          Decimal?  @map("cost_per_unit") @db.Decimal(12, 2)
  renewalFactor        Decimal   @default(1.0) @map("renewal_factor") @db.Decimal(5, 2)
  totalReplacementCost Decimal?  @map("total_replacement_cost") @db.Decimal(15, 2)
  // Condition Assessment
  conditionRating      Int?      @map("condition_rating") @db.SmallInt
  conditionNotes       String?   @map("condition_notes") @db.Text
  // Status
  status               ElementStatus @default(pending)
  assessedAt           DateTime? @map("assessed_at")
  assessedById         String?   @map("assessed_by") @db.Uuid
  createdAt            DateTime  @default(now()) @map("created_at")
  updatedAt            DateTime  @updatedAt @map("updated_at")
  deletedAt            DateTime? @map("deleted_at")

  assessment       Assessment       @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  uniformatElement UniformatElement @relation(fields: [uniformatElementId], references: [id])
  assessedBy       User?            @relation(fields: [assessedById], references: [id])
  deficiencies     Deficiency[]
  photos           Photo[]

  @@index([assessmentId])
  @@index([uniformatCode])
  @@index([status])
  @@map("assessment_elements")
}

enum ElementStatus {
  pending
  in_progress
  completed
  skipped
}

// ============================================
// DEFICIENCIES
// ============================================

model DeficiencyCategory {
  id          String  @id @default(uuid()) @db.Uuid
  code        String  @unique @db.VarChar(50)
  name        String  @db.VarChar(255)
  description String? @db.Text
  color       String? @db.VarChar(7)
  sortOrder   Int?    @map("sort_order")
  isActive    Boolean @default(true) @map("is_active")

  deficiencies Deficiency[]

  @@map("deficiency_categories")
}

model Deficiency {
  id                  String              @id @default(uuid()) @db.Uuid
  assessmentElementId String              @map("assessment_element_id") @db.Uuid
  categoryId          String?             @map("category_id") @db.Uuid
  title               String              @db.VarChar(255)
  description         String?             @db.Text
  priority            DeficiencyPriority  @default(medium_term)
  severity            DeficiencySeverity  @default(moderate)
  estimatedCost       Decimal?            @map("estimated_cost") @db.Decimal(12, 2)
  quantity            Decimal             @default(1) @db.Decimal(12, 2)
  unitOfMeasure       String?             @map("unit_of_measure") @db.VarChar(50)
  totalCost           Decimal?            @map("total_cost") @db.Decimal(15, 2)
  recommendedAction   String?             @map("recommended_action") @db.Text
  targetYear          Int?                @map("target_year")
  createdAt           DateTime            @default(now()) @map("created_at")
  updatedAt           DateTime            @updatedAt @map("updated_at")
  createdById         String?             @map("created_by") @db.Uuid
  deletedAt           DateTime?           @map("deleted_at")

  assessmentElement AssessmentElement   @relation(fields: [assessmentElementId], references: [id], onDelete: Cascade)
  category          DeficiencyCategory? @relation(fields: [categoryId], references: [id])
  createdBy         User?               @relation(fields: [createdById], references: [id])
  photos            Photo[]

  @@index([assessmentElementId])
  @@index([priority])
  @@map("deficiencies")
}

enum DeficiencyPriority {
  immediate   // 0-1 years
  short_term  // 1-3 years
  medium_term // 3-5 years
  long_term   // 5-10 years
}

enum DeficiencySeverity {
  minor
  moderate
  major
  critical
}

// ============================================
// PHOTOS
// ============================================

model Photo {
  id                  String    @id @default(uuid()) @db.Uuid
  organizationId      String    @map("organization_id") @db.Uuid
  assessmentElementId String?   @map("assessment_element_id") @db.Uuid
  deficiencyId        String?   @map("deficiency_id") @db.Uuid
  filename            String    @db.VarChar(255)
  originalFilename    String?   @map("original_filename") @db.VarChar(255)
  mimeType            String?   @map("mime_type") @db.VarChar(100)
  fileSize            Int?      @map("file_size")
  s3Key               String    @map("s3_key") @db.VarChar(500)
  s3Bucket            String    @map("s3_bucket") @db.VarChar(255)
  thumbnailS3Key      String?   @map("thumbnail_s3_key") @db.VarChar(500)
  caption             String?   @db.Text
  latitude            Decimal?  @db.Decimal(10, 8)
  longitude           Decimal?  @db.Decimal(11, 8)
  takenAt             DateTime? @map("taken_at")
  createdAt           DateTime  @default(now()) @map("created_at")
  uploadedById        String?   @map("uploaded_by") @db.Uuid
  deletedAt           DateTime? @map("deleted_at")

  organization      Organization       @relation(fields: [organizationId], references: [id])
  assessmentElement AssessmentElement? @relation(fields: [assessmentElementId], references: [id], onDelete: Cascade)
  deficiency        Deficiency?        @relation(fields: [deficiencyId], references: [id], onDelete: Cascade)
  uploadedBy        User?              @relation(fields: [uploadedById], references: [id])

  @@index([assessmentElementId])
  @@index([deficiencyId])
  @@map("photos")
}

// ============================================
// SYNC (Offline Support)
// ============================================

model SyncQueue {
  id          String     @id @default(uuid()) @db.Uuid
  userId      String     @map("user_id") @db.Uuid
  entityType  String     @map("entity_type") @db.VarChar(50)
  entityId    String     @map("entity_id") @db.Uuid
  operation   String     @db.VarChar(20)
  payload     Json
  status      SyncStatus @default(pending)
  attempts    Int        @default(0)
  lastError   String?    @map("last_error") @db.Text
  createdAt   DateTime   @default(now()) @map("created_at")
  processedAt DateTime?  @map("processed_at")

  user User @relation(fields: [userId], references: [id])

  @@index([status])
  @@index([userId])
  @@map("sync_queue")
}

enum SyncStatus {
  pending
  processing
  completed
  failed
}
```

---

## 3.2 Seed Data

### Uniformat II Elements (Complete)
```typescript
// prisma/seed/uniformat.seed.ts

export const uniformatElements = [
  // ============== ELECTRICAL (D50xx, G40xx) ==============
  { code: 'D5010', name: 'Electrical Service & Distribution', systemGroup: 'Electrical', level: 2, lifetimeYears: 40 },
  { code: 'D5010.10', name: 'High Tension Service', systemGroup: 'Electrical', level: 3, lifetimeYears: 40, parentCode: 'D5010' },
  { code: 'D5010.20', name: 'Low Tension Service', systemGroup: 'Electrical', level: 3, lifetimeYears: 40, parentCode: 'D5010' },
  { code: 'D5010.30', name: 'Main Switchgear', systemGroup: 'Electrical', level: 3, lifetimeYears: 35, parentCode: 'D5010' },
  { code: 'D5010.40', name: 'Branch Circuit Panels', systemGroup: 'Electrical', level: 3, lifetimeYears: 40, parentCode: 'D5010' },
  { code: 'D5020', name: 'Lighting & Branch Wiring', systemGroup: 'Electrical', level: 2, lifetimeYears: 30 },
  { code: 'D5020.10', name: 'Branch Wiring', systemGroup: 'Electrical', level: 3, lifetimeYears: 40, parentCode: 'D5020' },
  { code: 'D5020.20', name: 'Lighting Fixtures', systemGroup: 'Electrical', level: 3, lifetimeYears: 20, parentCode: 'D5020' },
  { code: 'D5020.30', name: 'Emergency Lighting', systemGroup: 'Electrical', level: 3, lifetimeYears: 15, parentCode: 'D5020' },
  { code: 'D5020.40', name: 'Exit Signs', systemGroup: 'Electrical', level: 3, lifetimeYears: 15, parentCode: 'D5020' },
  { code: 'D5030', name: 'Communications & Security', systemGroup: 'Electrical', level: 2, lifetimeYears: 15 },
  { code: 'D5030.10', name: 'Fire Alarm System', systemGroup: 'Electrical', level: 3, lifetimeYears: 20, parentCode: 'D5030' },
  { code: 'D5030.20', name: 'Security System', systemGroup: 'Electrical', level: 3, lifetimeYears: 15, parentCode: 'D5030' },
  { code: 'D5030.30', name: 'Data/Telecom Cabling', systemGroup: 'Electrical', level: 3, lifetimeYears: 20, parentCode: 'D5030' },
  { code: 'D5090', name: 'Other Electrical Systems', systemGroup: 'Electrical', level: 2, lifetimeYears: 25 },
  { code: 'D5090.10', name: 'Generator', systemGroup: 'Electrical', level: 3, lifetimeYears: 30, parentCode: 'D5090' },
  { code: 'D5090.20', name: 'UPS System', systemGroup: 'Electrical', level: 3, lifetimeYears: 12, parentCode: 'D5090' },
  
  // Site Electrical
  { code: 'G4010', name: 'Site Electrical Distribution', systemGroup: 'Electrical', level: 2, lifetimeYears: 40 },
  { code: 'G4020', name: 'Site Lighting', systemGroup: 'Electrical', level: 2, lifetimeYears: 25 },
  { code: 'G4030', name: 'Site Communication & Security', systemGroup: 'Electrical', level: 2, lifetimeYears: 15 },

  // ============== PLUMBING (D20xx, D40xx) ==============
  { code: 'D2010', name: 'Plumbing Fixtures', systemGroup: 'Plumbing', level: 2, lifetimeYears: 25 },
  { code: 'D2010.10', name: 'Water Closets', systemGroup: 'Plumbing', level: 3, lifetimeYears: 30, parentCode: 'D2010' },
  { code: 'D2010.20', name: 'Urinals', systemGroup: 'Plumbing', level: 3, lifetimeYears: 30, parentCode: 'D2010' },
  { code: 'D2010.30', name: 'Lavatories', systemGroup: 'Plumbing', level: 3, lifetimeYears: 25, parentCode: 'D2010' },
  { code: 'D2010.40', name: 'Sinks', systemGroup: 'Plumbing', level: 3, lifetimeYears: 25, parentCode: 'D2010' },
  { code: 'D2010.50', name: 'Showers/Tubs', systemGroup: 'Plumbing', level: 3, lifetimeYears: 25, parentCode: 'D2010' },
  { code: 'D2010.60', name: 'Drinking Fountains', systemGroup: 'Plumbing', level: 3, lifetimeYears: 15, parentCode: 'D2010' },
  { code: 'D2020', name: 'Domestic Water Distribution', systemGroup: 'Plumbing', level: 2, lifetimeYears: 40 },
  { code: 'D2020.10', name: 'Cold Water Piping', systemGroup: 'Plumbing', level: 3, lifetimeYears: 50, parentCode: 'D2020' },
  { code: 'D2020.20', name: 'Hot Water Piping', systemGroup: 'Plumbing', level: 3, lifetimeYears: 40, parentCode: 'D2020' },
  { code: 'D2020.30', name: 'Domestic Water Heater', systemGroup: 'Plumbing', level: 3, lifetimeYears: 15, parentCode: 'D2020' },
  { code: 'D2020.40', name: 'Water Treatment', systemGroup: 'Plumbing', level: 3, lifetimeYears: 20, parentCode: 'D2020' },
  { code: 'D2030', name: 'Sanitary Waste', systemGroup: 'Plumbing', level: 2, lifetimeYears: 50 },
  { code: 'D2030.10', name: 'Waste Piping', systemGroup: 'Plumbing', level: 3, lifetimeYears: 50, parentCode: 'D2030' },
  { code: 'D2030.20', name: 'Vent Piping', systemGroup: 'Plumbing', level: 3, lifetimeYears: 50, parentCode: 'D2030' },
  { code: 'D2030.30', name: 'Floor Drains', systemGroup: 'Plumbing', level: 3, lifetimeYears: 40, parentCode: 'D2030' },
  { code: 'D2040', name: 'Rain Water Drainage', systemGroup: 'Plumbing', level: 2, lifetimeYears: 40 },
  { code: 'D2090', name: 'Other Plumbing Systems', systemGroup: 'Plumbing', level: 2, lifetimeYears: 30 },
  
  // Fire Protection
  { code: 'D4010', name: 'Sprinklers', systemGroup: 'Plumbing', level: 2, lifetimeYears: 50 },
  { code: 'D4010.10', name: 'Wet Sprinkler System', systemGroup: 'Plumbing', level: 3, lifetimeYears: 50, parentCode: 'D4010' },
  { code: 'D4010.20', name: 'Dry Sprinkler System', systemGroup: 'Plumbing', level: 3, lifetimeYears: 50, parentCode: 'D4010' },
  { code: 'D4020', name: 'Standpipes', systemGroup: 'Plumbing', level: 2, lifetimeYears: 50 },
  { code: 'D4030', name: 'Fire Protection Specialties', systemGroup: 'Plumbing', level: 2, lifetimeYears: 25 },
  { code: 'D4030.10', name: 'Fire Extinguishers', systemGroup: 'Plumbing', level: 3, lifetimeYears: 12, parentCode: 'D4030' },
  { code: 'D4030.20', name: 'Fire Hose Cabinets', systemGroup: 'Plumbing', level: 3, lifetimeYears: 30, parentCode: 'D4030' },

  // ============== MECHANICAL / HVAC (D30xx) ==============
  { code: 'D3010', name: 'Energy Supply', systemGroup: 'Mechanical', level: 2, lifetimeYears: 25 },
  { code: 'D3010.10', name: 'Oil Supply System', systemGroup: 'Mechanical', level: 3, lifetimeYears: 30, parentCode: 'D3010' },
  { code: 'D3010.20', name: 'Gas Supply System', systemGroup: 'Mechanical', level: 3, lifetimeYears: 40, parentCode: 'D3010' },
  { code: 'D3020', name: 'Heat Generating Systems', systemGroup: 'Mechanical', level: 2, lifetimeYears: 25 },
  { code: 'D3020.10', name: 'Boilers', systemGroup: 'Mechanical', level: 3, lifetimeYears: 30, parentCode: 'D3020' },
  { code: 'D3020.20', name: 'Furnaces', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3020' },
  { code: 'D3020.30', name: 'Auxiliary Equipment', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3020' },
  { code: 'D3030', name: 'Cooling Generating Systems', systemGroup: 'Mechanical', level: 2, lifetimeYears: 20 },
  { code: 'D3030.10', name: 'Chilled Water Plant', systemGroup: 'Mechanical', level: 3, lifetimeYears: 25, parentCode: 'D3030' },
  { code: 'D3030.20', name: 'Direct Expansion Systems', systemGroup: 'Mechanical', level: 3, lifetimeYears: 15, parentCode: 'D3030' },
  { code: 'D3030.30', name: 'Cooling Towers', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3030' },
  { code: 'D3040', name: 'Distribution Systems', systemGroup: 'Mechanical', level: 2, lifetimeYears: 30 },
  { code: 'D3040.10', name: 'Air Distribution', systemGroup: 'Mechanical', level: 3, lifetimeYears: 30, parentCode: 'D3040' },
  { code: 'D3040.20', name: 'Exhaust Systems', systemGroup: 'Mechanical', level: 3, lifetimeYears: 25, parentCode: 'D3040' },
  { code: 'D3040.30', name: 'Hydronic Distribution', systemGroup: 'Mechanical', level: 3, lifetimeYears: 30, parentCode: 'D3040' },
  { code: 'D3050', name: 'Terminal & Package Units', systemGroup: 'Mechanical', level: 2, lifetimeYears: 15 },
  { code: 'D3050.10', name: 'Air Handling Units', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3050' },
  { code: 'D3050.20', name: 'Fan Coil Units', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3050' },
  { code: 'D3050.30', name: 'Unit Heaters', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3050' },
  { code: 'D3050.40', name: 'VAV Boxes', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3050' },
  { code: 'D3050.50', name: 'Split Systems', systemGroup: 'Mechanical', level: 3, lifetimeYears: 15, parentCode: 'D3050' },
  { code: 'D3050.60', name: 'Package Units (RTUs)', systemGroup: 'Mechanical', level: 3, lifetimeYears: 15, parentCode: 'D3050' },
  { code: 'D3060', name: 'Controls & Instrumentation', systemGroup: 'Mechanical', level: 2, lifetimeYears: 15 },
  { code: 'D3060.10', name: 'BAS/DDC Controls', systemGroup: 'Mechanical', level: 3, lifetimeYears: 15, parentCode: 'D3060' },
  { code: 'D3060.20', name: 'Pneumatic Controls', systemGroup: 'Mechanical', level: 3, lifetimeYears: 20, parentCode: 'D3060' },
  { code: 'D3090', name: 'Other HVAC Systems', systemGroup: 'Mechanical', level: 2, lifetimeYears: 20 },

  // ============== CONVEYING / ELEVATOR (D10xx) ==============
  { code: 'D1010', name: 'Elevators & Lifts', systemGroup: 'Conveying', level: 2, lifetimeYears: 25 },
  { code: 'D1010.10', name: 'Traction Elevators', systemGroup: 'Conveying', level: 3, lifetimeYears: 25, parentCode: 'D1010' },
  { code: 'D1010.20', name: 'Hydraulic Elevators', systemGroup: 'Conveying', level: 3, lifetimeYears: 20, parentCode: 'D1010' },
  { code: 'D1010.30', name: 'Freight Elevators', systemGroup: 'Conveying', level: 3, lifetimeYears: 25, parentCode: 'D1010' },
  { code: 'D1010.40', name: 'Wheelchair Lifts', systemGroup: 'Conveying', level: 3, lifetimeYears: 15, parentCode: 'D1010' },
  { code: 'D1020', name: 'Escalators & Moving Walks', systemGroup: 'Conveying', level: 2, lifetimeYears: 25 },
  { code: 'D1090', name: 'Other Conveying Systems', systemGroup: 'Conveying', level: 2, lifetimeYears: 20 },

  // ============== SITE (G10xx - G30xx) ==============
  { code: 'G1010', name: 'Site Clearing', systemGroup: 'Site', level: 2, lifetimeYears: null },
  { code: 'G1020', name: 'Site Earthwork', systemGroup: 'Site', level: 2, lifetimeYears: null },
  { code: 'G1030', name: 'Site Utilities', systemGroup: 'Site', level: 2, lifetimeYears: 50 },
  { code: 'G2010', name: 'Roadways', systemGroup: 'Site', level: 2, lifetimeYears: 25 },
  { code: 'G2010.10', name: 'Paving - Asphalt', systemGroup: 'Site', level: 3, lifetimeYears: 20, parentCode: 'G2010' },
  { code: 'G2010.20', name: 'Paving - Concrete', systemGroup: 'Site', level: 3, lifetimeYears: 30, parentCode: 'G2010' },
  { code: 'G2020', name: 'Parking Lots', systemGroup: 'Site', level: 2, lifetimeYears: 20 },
  { code: 'G2020.10', name: 'Surface Parking', systemGroup: 'Site', level: 3, lifetimeYears: 20, parentCode: 'G2020' },
  { code: 'G2020.20', name: 'Parking Structure', systemGroup: 'Site', level: 3, lifetimeYears: 50, parentCode: 'G2020' },
  { code: 'G2030', name: 'Pedestrian Paving', systemGroup: 'Site', level: 2, lifetimeYears: 25 },
  { code: 'G2030.10', name: 'Sidewalks', systemGroup: 'Site', level: 3, lifetimeYears: 25, parentCode: 'G2030' },
  { code: 'G2030.20', name: 'Plazas', systemGroup: 'Site', level: 3, lifetimeYears: 30, parentCode: 'G2030' },
  { code: 'G2040', name: 'Site Development', systemGroup: 'Site', level: 2, lifetimeYears: 30 },
  { code: 'G2040.10', name: 'Fences & Gates', systemGroup: 'Site', level: 3, lifetimeYears: 25, parentCode: 'G2040' },
  { code: 'G2040.20', name: 'Retaining Walls', systemGroup: 'Site', level: 3, lifetimeYears: 50, parentCode: 'G2040' },
  { code: 'G2040.30', name: 'Site Signage', systemGroup: 'Site', level: 3, lifetimeYears: 15, parentCode: 'G2040' },
  { code: 'G2050', name: 'Landscaping', systemGroup: 'Site', level: 2, lifetimeYears: 15 },
  { code: 'G2050.10', name: 'Lawns & Planting', systemGroup: 'Site', level: 3, lifetimeYears: null, parentCode: 'G2050' },
  { code: 'G2050.20', name: 'Irrigation System', systemGroup: 'Site', level: 3, lifetimeYears: 20, parentCode: 'G2050' },
  { code: 'G3010', name: 'Water Supply', systemGroup: 'Site', level: 2, lifetimeYears: 50 },
  { code: 'G3020', name: 'Sanitary Sewer', systemGroup: 'Site', level: 2, lifetimeYears: 50 },
  { code: 'G3030', name: 'Storm Sewer', systemGroup: 'Site', level: 2, lifetimeYears: 50 },
  { code: 'G3040', name: 'Heating Distribution', systemGroup: 'Site', level: 2, lifetimeYears: 40 },
  { code: 'G3050', name: 'Cooling Distribution', systemGroup: 'Site', level: 2, lifetimeYears: 40 },
  { code: 'G3060', name: 'Fuel Distribution', systemGroup: 'Site', level: 2, lifetimeYears: 30 },

  // ============== STRUCTURAL (A10xx, B10xx) ==============
  { code: 'A1010', name: 'Standard Foundations', systemGroup: 'Structural', level: 2, lifetimeYears: 100 },
  { code: 'A1020', name: 'Special Foundations', systemGroup: 'Structural', level: 2, lifetimeYears: 100 },
  { code: 'A1030', name: 'Slab on Grade', systemGroup: 'Structural', level: 2, lifetimeYears: 75 },
  { code: 'B1010', name: 'Floor Construction', systemGroup: 'Structural', level: 2, lifetimeYears: 75 },
  { code: 'B1010.10', name: 'Structural Floor', systemGroup: 'Structural', level: 3, lifetimeYears: 75, parentCode: 'B1010' },
  { code: 'B1010.20', name: 'Floor Deck', systemGroup: 'Structural', level: 3, lifetimeYears: 75, parentCode: 'B1010' },
  { code: 'B1020', name: 'Roof Construction', systemGroup: 'Structural', level: 2, lifetimeYears: 75 },
  { code: 'B1020.10', name: 'Structural Roof', systemGroup: 'Structural', level: 3, lifetimeYears: 75, parentCode: 'B1020' },
  { code: 'B1020.20', name: 'Roof Deck', systemGroup: 'Structural', level: 3, lifetimeYears: 50, parentCode: 'B1020' },

  // ============== ARCHITECTURE (B20xx - C30xx) ==============
  // Exterior Enclosure
  { code: 'B2010', name: 'Exterior Walls', systemGroup: 'Architecture', level: 2, lifetimeYears: 50 },
  { code: 'B2010.10', name: 'Exterior Wall Construction', systemGroup: 'Architecture', level: 3, lifetimeYears: 50, parentCode: 'B2010' },
  { code: 'B2010.20', name: 'Exterior Wall Finishes', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B2010' },
  { code: 'B2020', name: 'Exterior Windows', systemGroup: 'Architecture', level: 2, lifetimeYears: 30 },
  { code: 'B2020.10', name: 'Windows', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'B2020' },
  { code: 'B2020.20', name: 'Curtain Walls', systemGroup: 'Architecture', level: 3, lifetimeYears: 35, parentCode: 'B2020' },
  { code: 'B2020.30', name: 'Storefronts', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'B2020' },
  { code: 'B2030', name: 'Exterior Doors', systemGroup: 'Architecture', level: 2, lifetimeYears: 25 },
  { code: 'B2030.10', name: 'Entry Doors', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B2030' },
  { code: 'B2030.20', name: 'Overhead Doors', systemGroup: 'Architecture', level: 3, lifetimeYears: 20, parentCode: 'B2030' },
  { code: 'B2030.30', name: 'Automatic Doors', systemGroup: 'Architecture', level: 3, lifetimeYears: 15, parentCode: 'B2030' },
  
  // Roofing
  { code: 'B3010', name: 'Roofing', systemGroup: 'Architecture', level: 2, lifetimeYears: 25 },
  { code: 'B3010.10', name: 'Built-Up Roofing', systemGroup: 'Architecture', level: 3, lifetimeYears: 20, parentCode: 'B3010' },
  { code: 'B3010.20', name: 'Single-Ply Membrane', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B3010' },
  { code: 'B3010.30', name: 'Metal Roofing', systemGroup: 'Architecture', level: 3, lifetimeYears: 40, parentCode: 'B3010' },
  { code: 'B3010.40', name: 'Shingle Roofing', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B3010' },
  { code: 'B3010.50', name: 'Roof Insulation', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'B3010' },
  { code: 'B3020', name: 'Roof Appurtenances', systemGroup: 'Architecture', level: 2, lifetimeYears: 20 },
  { code: 'B3020.10', name: 'Roof Hatches/Skylights', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B3020' },
  { code: 'B3020.20', name: 'Gutters & Downspouts', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'B3020' },
  { code: 'B3020.30', name: 'Roof Accessories', systemGroup: 'Architecture', level: 3, lifetimeYears: 20, parentCode: 'B3020' },
  
  // Interior Construction
  { code: 'C1010', name: 'Partitions', systemGroup: 'Architecture', level: 2, lifetimeYears: 40 },
  { code: 'C1010.10', name: 'Fixed Partitions', systemGroup: 'Architecture', level: 3, lifetimeYears: 40, parentCode: 'C1010' },
  { code: 'C1010.20', name: 'Demountable Partitions', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'C1010' },
  { code: 'C1010.30', name: 'Toilet Partitions', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'C1010' },
  { code: 'C1020', name: 'Interior Doors', systemGroup: 'Architecture', level: 2, lifetimeYears: 30 },
  { code: 'C1020.10', name: 'Wood Doors', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'C1020' },
  { code: 'C1020.20', name: 'Metal Doors', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'C1020' },
  { code: 'C1020.30', name: 'Door Hardware', systemGroup: 'Architecture', level: 3, lifetimeYears: 20, parentCode: 'C1020' },
  { code: 'C1030', name: 'Fittings', systemGroup: 'Architecture', level: 2, lifetimeYears: 20 },
  
  // Staircases
  { code: 'C2010', name: 'Stair Construction', systemGroup: 'Architecture', level: 2, lifetimeYears: 75 },
  { code: 'C2020', name: 'Stair Finishes', systemGroup: 'Architecture', level: 2, lifetimeYears: 25 },
  
  // Interior Finishes
  { code: 'C3010', name: 'Wall Finishes', systemGroup: 'Architecture', level: 2, lifetimeYears: 15 },
  { code: 'C3010.10', name: 'Paint', systemGroup: 'Architecture', level: 3, lifetimeYears: 8, parentCode: 'C3010' },
  { code: 'C3010.20', name: 'Wall Coverings', systemGroup: 'Architecture', level: 3, lifetimeYears: 15, parentCode: 'C3010' },
  { code: 'C3010.30', name: 'Tile', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'C3010' },
  { code: 'C3020', name: 'Floor Finishes', systemGroup: 'Architecture', level: 2, lifetimeYears: 15 },
  { code: 'C3020.10', name: 'Carpet', systemGroup: 'Architecture', level: 3, lifetimeYears: 10, parentCode: 'C3020' },
  { code: 'C3020.20', name: 'Resilient Flooring', systemGroup: 'Architecture', level: 3, lifetimeYears: 20, parentCode: 'C3020' },
  { code: 'C3020.30', name: 'Ceramic Tile', systemGroup: 'Architecture', level: 3, lifetimeYears: 40, parentCode: 'C3020' },
  { code: 'C3020.40', name: 'Hardwood Flooring', systemGroup: 'Architecture', level: 3, lifetimeYears: 50, parentCode: 'C3020' },
  { code: 'C3020.50', name: 'Concrete/Epoxy', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'C3020' },
  { code: 'C3030', name: 'Ceiling Finishes', systemGroup: 'Architecture', level: 2, lifetimeYears: 25 },
  { code: 'C3030.10', name: 'Acoustical Ceilings', systemGroup: 'Architecture', level: 3, lifetimeYears: 25, parentCode: 'C3030' },
  { code: 'C3030.20', name: 'Gypsum Ceilings', systemGroup: 'Architecture', level: 3, lifetimeYears: 40, parentCode: 'C3030' },
  { code: 'C3030.30', name: 'Specialty Ceilings', systemGroup: 'Architecture', level: 3, lifetimeYears: 30, parentCode: 'C3030' },
];
```

### Deficiency Categories
```typescript
// prisma/seed/categories.seed.ts

export const deficiencyCategories = [
  { code: 'INTEGRITY', name: 'Structural Integrity', color: '#EF4444', sortOrder: 1 },
  { code: 'LIFECYCLE', name: 'End of Useful Life', color: '#F97316', sortOrder: 2 },
  { code: 'RELIABILITY', name: 'Reliability/Failure Risk', color: '#EAB308', sortOrder: 3 },
  { code: 'LIFE_SAFETY', name: 'Life Safety', color: '#DC2626', sortOrder: 4 },
  { code: 'FIRE_PROTECTION', name: 'Fire Protection', color: '#B91C1C', sortOrder: 5 },
  { code: 'REGULATORY', name: 'Regulatory Compliance', color: '#7C3AED', sortOrder: 6 },
  { code: 'ACCESSIBILITY', name: 'ADA/Accessibility', color: '#3B82F6', sortOrder: 7 },
  { code: 'ENERGY', name: 'Energy Efficiency', color: '#22C55E', sortOrder: 8 },
  { code: 'WATER', name: 'Water Efficiency', color: '#06B6D4', sortOrder: 9 },
  { code: 'ENVIRONMENTAL', name: 'Environmental/Hazmat', color: '#10B981', sortOrder: 10 },
  { code: 'APPEARANCE', name: 'Appearance/Aesthetics', color: '#8B5CF6', sortOrder: 11 },
  { code: 'FUNCTIONALITY', name: 'Functionality', color: '#6366F1', sortOrder: 12 },
  { code: 'MAINTENANCE', name: 'Deferred Maintenance', color: '#64748B', sortOrder: 13 },
  { code: 'CAPACITY', name: 'Capacity/Adequacy', color: '#F59E0B', sortOrder: 14 },
  { code: 'TECHNOLOGY', name: 'Technology Obsolescence', color: '#EC4899', sortOrder: 15 },
  { code: 'OTHER', name: 'Other', color: '#94A3B8', sortOrder: 16 },
];
```

---

# SECTION 4: API SPECIFICATION

## 4.1 Authentication

### Auth0 Configuration
```typescript
// JWT payload structure
interface JWTPayload {
  sub: string;           // Auth0 user ID
  email: string;
  org_id: string;        // Organization UUID
  role: UserRole;
  branch_ids: string[];  // Assigned branch UUIDs (for branch_manager, assessor)
  permissions: string[];
}

// API middleware extracts and validates JWT
// Sets req.user with authenticated user context
```

### Endpoints
```
POST /api/v1/auth/login         # Exchange Auth0 code for tokens
POST /api/v1/auth/refresh       # Refresh access token
POST /api/v1/auth/logout        # Invalidate refresh token
GET  /api/v1/auth/me            # Get current user profile
```

## 4.2 Core CRUD Endpoints

### Organizations
```
GET    /api/v1/organizations/:id           # Get org details (Org Admin)
PATCH  /api/v1/organizations/:id           # Update org settings (Org Admin)
GET    /api/v1/organizations/:id/stats     # Get org statistics
```

### Branches
```
GET    /api/v1/branches                    # List branches (filtered by role)
POST   /api/v1/branches                    # Create branch (Org Admin)
GET    /api/v1/branches/:id                # Get branch details
PATCH  /api/v1/branches/:id                # Update branch
DELETE /api/v1/branches/:id                # Soft delete branch
GET    /api/v1/branches/:id/stats          # Get branch statistics
GET    /api/v1/branches/:id/buildings      # List buildings in branch
```

### Buildings
```
GET    /api/v1/buildings                   # List buildings (with filters)
POST   /api/v1/buildings                   # Create building
GET    /api/v1/buildings/:id               # Get building details
PATCH  /api/v1/buildings/:id               # Update building
DELETE /api/v1/buildings/:id               # Soft delete building
GET    /api/v1/buildings/:id/stats         # Get building statistics
GET    /api/v1/buildings/:id/assessments   # List building assessments
GET    /api/v1/buildings/:id/history       # Get FCI history
```

### Assessments
```
GET    /api/v1/assessments                 # List assessments (with filters)
POST   /api/v1/assessments                 # Create assessment
GET    /api/v1/assessments/:id             # Get assessment details
PATCH  /api/v1/assessments/:id             # Update assessment
DELETE /api/v1/assessments/:id             # Soft delete assessment

# Workflow Actions
POST   /api/v1/assessments/:id/start       # Start assessment
POST   /api/v1/assessments/:id/submit      # Submit for review
POST   /api/v1/assessments/:id/approve     # Approve (Branch Manager)
POST   /api/v1/assessments/:id/reject      # Reject with reason

# Elements
GET    /api/v1/assessments/:id/elements    # List elements
POST   /api/v1/assessments/:id/elements    # Add elements (bulk)

# Assignees
GET    /api/v1/assessments/:id/assignees   # List assignees
POST   /api/v1/assessments/:id/assignees   # Add assignee
DELETE /api/v1/assessments/:id/assignees/:userId # Remove assignee
```

### Elements
```
GET    /api/v1/elements/:id                # Get element details
PATCH  /api/v1/elements/:id                # Update element (18 Type Fields)
POST   /api/v1/elements/:id/complete       # Mark as completed
POST   /api/v1/elements/:id/skip           # Mark as skipped

# Deficiencies
GET    /api/v1/elements/:id/deficiencies   # List element deficiencies
POST   /api/v1/elements/:id/deficiencies   # Add deficiency

# Photos
GET    /api/v1/elements/:id/photos         # List element photos
POST   /api/v1/elements/:id/photos         # Upload photo
```

### Deficiencies
```
GET    /api/v1/deficiencies/:id            # Get deficiency details
PATCH  /api/v1/deficiencies/:id            # Update deficiency
DELETE /api/v1/deficiencies/:id            # Soft delete deficiency

# Photos
GET    /api/v1/deficiencies/:id/photos     # List deficiency photos
POST   /api/v1/deficiencies/:id/photos     # Upload photo
```

### Photos
```
DELETE /api/v1/photos/:id                  # Soft delete photo
GET    /api/v1/photos/:id/download         # Get signed download URL
```

### Users
```
GET    /api/v1/users                       # List org users (Org Admin)
POST   /api/v1/users/invite                # Invite new user
GET    /api/v1/users/:id                   # Get user details
PATCH  /api/v1/users/:id                   # Update user
DELETE /api/v1/users/:id                   # Deactivate user
POST   /api/v1/users/:id/resend-invite     # Resend invitation

# Branch Assignments
GET    /api/v1/users/:id/branches          # List user's branches
POST   /api/v1/users/:id/branches          # Assign to branch
DELETE /api/v1/users/:id/branches/:branchId # Remove from branch
```

### Reference Data
```
GET    /api/v1/uniformat                   # Get all Uniformat elements
GET    /api/v1/uniformat/groups            # Get system groups only
GET    /api/v1/uniformat/:code             # Get single element by code
GET    /api/v1/deficiency-categories       # Get all categories
```

### Reports & Analytics
```
GET    /api/v1/analytics/portfolio         # Portfolio overview (Org Admin)
GET    /api/v1/analytics/portfolio/trends  # FCI trends
GET    /api/v1/analytics/portfolio/systems # By system group
GET    /api/v1/analytics/branches/:id      # Branch analytics
GET    /api/v1/analytics/buildings/:id     # Building analytics

GET    /api/v1/reports/building/:id        # Building condition report
GET    /api/v1/reports/building/:id/pdf    # Generate PDF
GET    /api/v1/reports/building/:id/excel  # Generate Excel
GET    /api/v1/reports/assessment/:id      # Assessment report
GET    /api/v1/reports/assessment/:id/pdf  # Generate PDF
```

### Offline Sync
```
POST   /api/v1/sync/push                   # Push offline changes
GET    /api/v1/sync/pull                   # Pull updates since timestamp
GET    /api/v1/sync/status                 # Get sync status
```

---

## 4.3 Response Format

### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;       // Machine-readable error code
    message: string;    // Human-readable message
    details?: Record<string, string[]>; // Field-specific errors
  };
}
```

### Error Codes
```
UNAUTHORIZED          401  - Missing or invalid authentication
FORBIDDEN             403  - Insufficient permissions
NOT_FOUND             404  - Resource not found
VALIDATION_ERROR      400  - Invalid request data
CONFLICT              409  - Resource conflict (duplicate)
RATE_LIMITED          429  - Too many requests
INTERNAL_ERROR        500  - Server error
```

---

# SECTION 5: IMPLEMENTATION PHASES

## Phase 1: Foundation (Weeks 1-4)

### Week 1-2: Project Setup
```
□ Initialize pnpm monorepo workspace
□ Setup apps/web with Vite + React + TypeScript
□ Setup apps/api with Express + TypeScript
□ Configure shared packages/shared
□ Setup Prisma with PostgreSQL
□ Configure ESLint, Prettier, Husky
□ Create docker-compose.yml for local dev
□ Setup GitHub Actions CI pipeline
□ Create environment configuration
```

### Week 3-4: Authentication & Core Infrastructure
```
□ Configure Auth0 tenant and application
□ Implement JWT middleware
□ Implement RBAC middleware
□ Implement tenant isolation middleware
□ Create base API response helpers
□ Setup global error handling
□ Configure logging (Pino)
□ Setup database migrations workflow
□ Create seed scripts (Uniformat, Categories)
```

**Milestone:** Authenticated API skeleton running locally

---

## Phase 2: Core API Development (Weeks 5-8)

### Week 5-6: Organization & User Management
```
□ Organizations CRUD endpoints
□ Branches CRUD endpoints
□ Users CRUD with invitation flow
□ User-Branch assignments
□ Email service for invitations
□ Password reset flow
□ Unit tests for services
```

### Week 7-8: Building & Assessment API
```
□ Buildings CRUD endpoints
□ Assessments CRUD endpoints
□ Assessment workflow (start, submit, approve, reject)
□ Assessment elements CRUD
□ Bulk element creation from Uniformat selection
□ Assessment assignee management
□ Integration tests for API
```

**Milestone:** Complete backend API for core entities

---

## Phase 3: Assessment Data & Photos (Weeks 9-12)

### Week 9-10: Element Assessment & Deficiencies
```
□ 18 Type Fields data model and validation
□ Element assessment update endpoint
□ Element status management (complete, skip)
□ Deficiencies CRUD endpoints
□ FCI calculation service
□ RUL calculation (triggered on save)
□ Building stats aggregation
```

### Week 11-12: Photo Management
```
□ Configure AWS S3 bucket
□ Photo upload endpoint (multipart)
□ Image processing (resize, thumbnail)
□ Photo metadata extraction (EXIF GPS, datetime)
□ Signed URL generation for downloads
□ Photo deletion (soft delete)
□ Storage cleanup job
```

**Milestone:** Complete assessment data entry API

---

## Phase 4: Frontend Core (Weeks 13-16)

### Week 13-14: Auth & Layout
```
□ Login page with Auth0 integration
□ Password reset flow
□ Accept invitation flow
□ App layout with sidebar navigation
□ Role-based menu rendering
□ User profile page
□ Settings page
□ Toast notifications
```

### Week 15-16: Building Management UI
```
□ Branch list page
□ Branch detail page
□ Building list page with filters
□ Building detail page
□ Building form (create/edit)
□ Building card component
□ FCI gauge component
□ Stats display components
```

**Milestone:** Functional building management UI

---

## Phase 5: Assessment UI (Weeks 17-20)

### Week 17-18: Assessment Creation & Management
```
□ Assessment list page with filters
□ Assessment creation wizard
□ Uniformat element tree selector
□ Element configuration (lifetimes, costs)
□ Assessor assignment interface
□ Assessment detail page
□ Progress tracking component
```

### Week 19-20: Field Assessment Interface
```
□ Assessor dashboard (my assessments)
□ Element list view
□ Element assessment form (18 fields)
□ Condition rating component (1-5)
□ Deficiency entry form
□ Photo capture component (camera)
□ Photo gallery viewer
□ Assessment submission flow
```

**Milestone:** Complete assessment workflow UI

---

## Phase 6: Review & Reports (Weeks 21-24)

### Week 21-22: Review Workflow
```
□ Review dashboard for Branch Manager
□ Element review checklist
□ Photo verification interface
□ Cost validation tools
□ Approve/reject dialog
□ Rejection reason input
□ Email notifications
```

### Week 23-24: Dashboards & Reports
```
□ Portfolio dashboard (Org Admin)
□ Branch dashboard
□ Executive dashboard (Viewer)
□ FCI trend chart
□ System breakdown chart
□ Deficiency priority chart
□ Building condition report page
□ PDF report generation
□ Excel export
```

**Milestone:** Complete reporting and analytics

---

## Phase 7: PWA & Offline (Weeks 25-28)

### Week 25-26: PWA Foundation
```
□ Configure Workbox service worker
□ PWA manifest configuration
□ App install prompt
□ Setup IndexedDB with Dexie
□ Offline data caching strategy
□ Network status detection
□ Offline indicator UI
```

### Week 27-28: Sync Implementation
```
□ Sync queue implementation
□ Background sync for data
□ Photo upload queue
□ Conflict detection
□ Conflict resolution UI
□ Sync status display
□ Retry mechanism
□ E2E offline testing
```

**Milestone:** Fully functional offline-capable PWA

---

## Phase 8: Polish & Launch (Weeks 29-32)

### Week 29-30: Mobile Optimization
```
□ Responsive layouts for all pages
□ Touch-optimized components
□ Mobile navigation (bottom nav)
□ Performance optimization
□ Image lazy loading
□ Code splitting
□ Bundle size optimization
```

### Week 31-32: Launch Preparation
```
□ Security audit
□ Penetration testing
□ Load testing
□ Accessibility audit (WCAG 2.1 AA)
□ Documentation
□ Admin runbooks
□ Beta testing
□ Bug fixes
□ Production deployment
```

**Milestone:** Production-ready platform launch

---

# SECTION 6: DESIGN SYSTEM

## 6.1 Colors

```typescript
const colors = {
  // Primary
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main primary
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  
  // FCI Scale
  fci: {
    good: '#22C55E',      // 0-5%
    fair: '#EAB308',      // 5-10%
    poor: '#F97316',      // 10-30%
    critical: '#EF4444',  // 30%+
  },
  
  // Condition Rating
  condition: {
    1: '#EF4444',  // Failed/Critical
    2: '#F97316',  // Poor
    3: '#EAB308',  // Fair
    4: '#84CC16',  // Good
    5: '#22C55E',  // Excellent
  },
  
  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};
```

## 6.2 Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },
};
```

## 6.3 Spacing

```typescript
// Use Tailwind's default spacing scale
// 4px base unit (0.25rem)
// p-1 = 4px, p-2 = 8px, p-4 = 16px, etc.
```

---

# SECTION 7: CODING STANDARDS

## 7.1 TypeScript

```typescript
// tsconfig.json settings
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Use explicit return types
function calculateFCI(dm: number, crv: number): number {
  return crv > 0 ? dm / crv : 0;
}

// Use interfaces for object shapes
interface Building {
  id: string;
  name: string;
  currentFci: number;
}

// Use type for unions
type AssessmentStatus = 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
```

## 7.2 React Components

```typescript
// Use functional components with TypeScript
interface BuildingCardProps {
  building: Building;
  onClick?: (id: string) => void;
  className?: string;
}

export function BuildingCard({ building, onClick, className }: BuildingCardProps) {
  return (
    <div className={cn('rounded-lg border bg-white p-4', className)}>
      {/* ... */}
    </div>
  );
}

// Use custom hooks for data fetching
function useBuilding(id: string) {
  return useQuery({
    queryKey: ['building', id],
    queryFn: () => buildingService.getById(id),
    enabled: !!id,
  });
}
```

## 7.3 API Controllers

```typescript
// Use async/await with try/catch
export const createBuilding = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = buildingSchema.parse(req.body);
    const building = await buildingService.create(validated, req.user.organizationId);
    res.status(201).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
};
```

## 7.4 Naming Conventions

```
Files:
- Components: PascalCase (BuildingCard.tsx)
- Hooks: camelCase with 'use' prefix (useBuilding.ts)
- Services: camelCase with .service suffix (building.service.ts)
- Types: PascalCase (Building.ts)

Variables:
- Components: PascalCase
- Functions/Methods: camelCase
- Constants: SCREAMING_SNAKE_CASE
- Boolean: is/has/can prefix (isLoading, hasError)

Database:
- Tables: snake_case, plural (assessment_elements)
- Columns: snake_case (created_at)
- Foreign keys: singular_table_id (building_id)
```

---

# SECTION 8: TESTING REQUIREMENTS

## 8.1 Coverage Targets

```
Unit Tests:      80%+ coverage
Integration:     Critical paths 100%
E2E:             Happy paths + key error scenarios
```

## 8.2 Test Examples

### Unit Test (Service)
```typescript
describe('FCIService', () => {
  describe('calculateFCI', () => {
    it('returns 0 when CRV is 0', () => {
      expect(calculateFCI(100000, 0)).toBe(0);
    });

    it('calculates FCI correctly', () => {
      expect(calculateFCI(500000, 10000000)).toBeCloseTo(0.05);
    });
  });
});
```

### Integration Test (API)
```typescript
describe('POST /api/v1/buildings', () => {
  it('creates building with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/buildings')
      .set('Authorization', `Bearer ${token}`)
      .send(validBuildingData);

    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe(validBuildingData.name);
  });
});
```

### Component Test
```typescript
describe('BuildingCard', () => {
  it('renders building name and FCI', () => {
    render(<BuildingCard building={mockBuilding} />);
    
    expect(screen.getByText(mockBuilding.name)).toBeInTheDocument();
    expect(screen.getByText('12.5%')).toBeInTheDocument();
  });
});
```

---

# SECTION 9: ENVIRONMENT VARIABLES

```bash
# .env.example

# Application
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
WEB_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://onyx:onyx@localhost:5432/onyx_dev

# Auth0
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=xxxxx
AUTH0_CLIENT_SECRET=xxxxx
AUTH0_AUDIENCE=https://api.onyxreport.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
S3_BUCKET=onyx-photos-dev
S3_REGION=us-east-1
CLOUDFRONT_URL=https://d123.cloudfront.net

# Redis
REDIS_URL=redis://localhost:6379

# Email (SendGrid)
SENDGRID_API_KEY=xxxxx
FROM_EMAIL=noreply@onyxreport.com

# Sentry (Error Tracking)
SENTRY_DSN=xxxxx

# Feature Flags
ENABLE_OFFLINE_SYNC=true
ENABLE_PDF_EXPORT=true
```

---

# SECTION 10: QUICK REFERENCE

## FCI Categories
```
0% - 5%   = Good     (Green  #22C55E)
5% - 10%  = Fair     (Yellow #EAB308)
10% - 30% = Poor     (Orange #F97316)
30%+      = Critical (Red    #EF4444)
```

## Condition Ratings
```
1 = Failed/Critical (Replace immediately)
2 = Poor           (Replace within 1-2 years)
3 = Fair           (Repair/replace 3-5 years)
4 = Good           (Minor maintenance)
5 = Excellent      (New or like-new)
```

## Priority Levels
```
Immediate  = 0-1 years  (Safety/critical)
Short-term = 1-3 years  (Prevent failure)
Medium     = 3-5 years  (Planned renewal)
Long-term  = 5-10 years (Future planning)
```

## Assessment Status Flow
```
draft → in_progress → submitted → in_review → approved
                                           ↘ rejected
```

## User Roles → Permissions
```
org_admin:      ALL operations
branch_manager: Branch-scoped CRUD, approve assessments
assessor:       Assessment data entry only
viewer:         Read-only, reports only
```

---

# SECTION 11: CLAUDE CODE USAGE

## How to Use This Prompt

1. **Initialize Project**
   ```
   "Create the monorepo structure as specified in Section 2.2"
   "Setup Prisma schema based on Section 3.1"
   ```

2. **Implement Features**
   ```
   "Implement the Buildings API endpoints from Section 4.2"
   "Create the BuildingCard component following Section 6 design system"
   ```

3. **Follow Phases**
   ```
   "What tasks should I complete for Phase 1, Week 1-2?"
   "Implement the authentication middleware from Phase 1"
   ```

4. **Reference Standards**
   ```
   "Review my code against the coding standards in Section 7"
   "Does this API response match the format in Section 4.3?"
   ```

## Key Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev           # Both web and api
pnpm dev:web       # Web only
pnpm dev:api       # API only

# Database
pnpm db:migrate    # Run migrations
pnpm db:seed       # Seed data
pnpm db:studio     # Prisma Studio

# Testing
pnpm test          # Run all tests
pnpm test:unit     # Unit tests
pnpm test:e2e      # E2E tests

# Build
pnpm build         # Production build
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check
```

---

# SECTION 12: SECURITY & COMPLIANCE

## 12.1 Authentication & Authorization

### Auth0 Configuration
```typescript
// Auth0 tenant settings
{
  domain: 'onyx-report.auth0.com',
  clientId: 'web-app-client-id',
  audience: 'https://api.onyxreport.com',
  
  // Connections
  connections: ['Username-Password-Authentication', 'google-oauth2'],
  
  // Rules/Actions
  rules: [
    'add-organization-to-token',
    'add-role-to-token',
    'add-branch-access-to-token'
  ]
}
```

### JWT Token Structure
```typescript
interface AccessToken {
  // Standard claims
  sub: string;              // Auth0 user ID
  aud: string;              // API audience
  iat: number;              // Issued at
  exp: number;              // Expiration (15 min)
  
  // Custom claims (namespace required by Auth0)
  'https://onyxreport.com/org_id': string;
  'https://onyxreport.com/role': UserRole;
  'https://onyxreport.com/branch_ids': string[];
  'https://onyxreport.com/permissions': string[];
}
```

### Permission Matrix
```
┌─────────────────────────┬───────────┬────────────────┬──────────┬────────┐
│ Resource                │ Org Admin │ Branch Manager │ Assessor │ Viewer │
├─────────────────────────┼───────────┼────────────────┼──────────┼────────┤
│ Organizations           │ RW        │ R              │ -        │ R      │
│ Branches (all)          │ RWCD      │ -              │ -        │ -      │
│ Branches (assigned)     │ RWCD      │ RW             │ R        │ R      │
│ Buildings (all)         │ RWCD      │ -              │ -        │ -      │
│ Buildings (in branch)   │ RWCD      │ RWCD           │ R        │ R      │
│ Assessments (create)    │ ✓         │ ✓              │ -        │ -      │
│ Assessments (edit)      │ ✓         │ ✓              │ assigned │ -      │
│ Assessments (approve)   │ ✓         │ ✓              │ -        │ -      │
│ Elements (assess)       │ ✓         │ ✓              │ assigned │ -      │
│ Deficiencies            │ RWCD      │ RWCD           │ RWC      │ R      │
│ Photos                  │ RWCD      │ RWCD           │ RWC      │ R      │
│ Users (all)             │ RWCD      │ -              │ -        │ -      │
│ Users (in branch)       │ RWCD      │ R              │ -        │ -      │
│ Reports                 │ R         │ R              │ -        │ R      │
│ Analytics               │ R         │ R (branch)     │ -        │ R      │
└─────────────────────────┴───────────┴────────────────┴──────────┴────────┘

R = Read, W = Write/Update, C = Create, D = Delete
```

## 12.2 Data Protection

### Encryption
```
At Rest:
- AWS RDS: AES-256 encryption enabled
- AWS S3: Server-side encryption (SSE-S3)
- Redis: In-transit encryption (TLS)

In Transit:
- TLS 1.3 minimum for all connections
- HTTPS enforced (HSTS headers)
- Certificate pinning for mobile app
```

### Data Retention
```
- Active data: Retained indefinitely while subscription active
- Soft-deleted data: 90 days before permanent deletion
- Audit logs: 7 years (compliance requirement)
- Session data: 24 hours
- Refresh tokens: 7 days
```

### PII Handling
```typescript
// Fields considered PII
const piiFields = [
  'user.email',
  'user.firstName',
  'user.lastName',
  'user.phone',
  'organization.name',
  'building.address*',
];

// PII is excluded from logs
// PII requires explicit consent for export
```

## 12.3 Security Headers

```typescript
// Helmet.js configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://*.cloudfront.net"],
      connectSrc: ["'self'", "https://api.onyxreport.com"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
}));
```

## 12.4 Rate Limiting

```typescript
// Rate limit tiers
const rateLimits = {
  // Per IP (unauthenticated)
  anonymous: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  
  // Per user (authenticated)
  authenticated: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
  },
  
  // Sensitive endpoints
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Login attempts
  },
  
  // File uploads
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 20,
  },
};
```

## 12.5 Audit Logging

```typescript
// Events that require audit logging
const auditEvents = [
  // Authentication
  'auth.login.success',
  'auth.login.failure',
  'auth.logout',
  'auth.password.reset',
  
  // User management
  'user.created',
  'user.updated',
  'user.deleted',
  'user.role.changed',
  
  // Assessment workflow
  'assessment.created',
  'assessment.submitted',
  'assessment.approved',
  'assessment.rejected',
  
  // Data changes
  'building.created',
  'building.deleted',
  'deficiency.created',
  'photo.uploaded',
  'photo.deleted',
  
  // Admin actions
  'organization.settings.updated',
  'branch.created',
  'branch.deleted',
];

// Audit log structure
interface AuditLog {
  id: string;
  timestamp: Date;
  eventType: string;
  userId: string;
  organizationId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  previousValue?: any;
  newValue?: any;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}
```

---

# SECTION 13: DEPLOYMENT & DEVOPS

## 13.1 Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              AWS Cloud                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐                                                      │
│   │   Route 53   │ ◄── DNS Management                                   │
│   └──────┬───────┘                                                      │
│          │                                                               │
│   ┌──────▼───────┐                                                      │
│   │  CloudFront  │ ◄── CDN (Static assets + API caching)                │
│   └──────┬───────┘                                                      │
│          │                                                               │
│   ┌──────┴──────────────────────────────────────────┐                   │
│   │                                                  │                   │
│   │  ┌────────────┐          ┌────────────┐        │                   │
│   │  │   ALB      │          │   S3       │        │                   │
│   │  │ (API LB)   │          │ (Static +  │        │                   │
│   │  └─────┬──────┘          │  Photos)   │        │                   │
│   │        │                  └────────────┘        │                   │
│   │  ┌─────▼──────┐                                 │                   │
│   │  │  ECS      │ ◄── Fargate (API containers)    │                   │
│   │  │  Cluster  │     - api-service (2+ tasks)    │                   │
│   │  └─────┬──────┘     - worker-service (1 task)  │                   │
│   │        │                                        │                   │
│   │  ┌─────┴──────────────────┐                    │                   │
│   │  │                        │                    │                   │
│   │  │  ┌──────────┐  ┌──────────┐                │                   │
│   │  │  │   RDS    │  │  Redis   │                │                   │
│   │  │  │(Postgres)│  │(Elasti-  │                │                   │
│   │  │  │Multi-AZ  │  │ Cache)   │                │                   │
│   │  │  └──────────┘  └──────────┘                │                   │
│   │  │                                             │                   │
│   │  └─────────────── Private Subnets ────────────┘                   │
│   │                                                                     │
│   └──────────────────── VPC ────────────────────────────────────────────┘
│                                                                          │
│   Supporting Services:                                                   │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐          │
│   │  Secrets   │ │ CloudWatch │ │   SES      │ │   ECR      │          │
│   │  Manager   │ │  (Logs)    │ │  (Email)   │ │ (Images)   │          │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 13.2 Environment Configuration

```
Environments:
├── development    (local Docker Compose)
├── staging        (AWS - staging.onyxreport.com)
└── production     (AWS - app.onyxreport.com)

Branch Strategy:
├── main           → production (manual deploy)
├── staging        → staging (auto deploy)
└── feature/*      → PR previews (optional)
```

## 13.3 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            apps/web/dist
            apps/api/dist

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4
      - run: ./scripts/deploy.sh staging
```

## 13.4 Docker Configuration

```dockerfile
# docker/Dockerfile.api
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm i -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build:api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://onyx:onyx@postgres:5432/onyx_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  web:
    build:
      context: ..
      dockerfile: docker/Dockerfile.web
    ports:
      - "5173:80"

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: onyx
      POSTGRES_PASSWORD: onyx
      POSTGRES_DB: onyx_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 13.5 Monitoring & Alerting

```typescript
// CloudWatch metrics to monitor
const metrics = {
  api: [
    'RequestCount',
    'ResponseTime_p50',
    'ResponseTime_p95',
    'ResponseTime_p99',
    'ErrorRate_4xx',
    'ErrorRate_5xx',
  ],
  database: [
    'CPUUtilization',
    'DatabaseConnections',
    'FreeStorageSpace',
    'ReadIOPS',
    'WriteIOPS',
  ],
  cache: [
    'CacheHitRate',
    'CacheMisses',
    'BytesUsedForCache',
  ],
};

// Alert thresholds
const alerts = {
  'api.response_time_p95 > 500ms': 'warning',
  'api.response_time_p95 > 1000ms': 'critical',
  'api.error_rate_5xx > 1%': 'warning',
  'api.error_rate_5xx > 5%': 'critical',
  'database.cpu > 80%': 'warning',
  'database.storage < 20%': 'critical',
  'ecs.running_tasks < desired_tasks': 'critical',
};
```

## 13.6 Backup & Recovery

```
Database Backups:
- Automated daily snapshots (RDS)
- Point-in-time recovery enabled (35 day retention)
- Cross-region backup replication
- Weekly backup testing

S3 Backups:
- Versioning enabled on photo bucket
- Lifecycle policy: Move to Glacier after 90 days
- Cross-region replication for DR

Recovery Procedures:
1. Database: Restore from snapshot (RTO: 30 min)
2. Application: Redeploy from latest image (RTO: 10 min)
3. Full DR: Failover to secondary region (RTO: 1 hour)
```

---

# SECTION 14: NOTIFICATION SYSTEM

## 14.1 Email Templates

### Assessment Assignment
```html
Subject: You've been assigned to assess {{building.name}}

Hi {{assessor.firstName}},

You've been assigned to a new assessment:

Building: {{building.name}}
Branch: {{branch.name}}
Due Date: {{assessment.targetCompletionDate}}
Elements: {{assessment.totalElements}} to assess

[Start Assessment Button]

Best regards,
The Onyx Report Team
```

### Assessment Submitted
```html
Subject: Assessment ready for review - {{building.name}}

Hi {{branchManager.firstName}},

An assessment has been submitted for your review:

Building: {{building.name}}
Submitted by: {{assessor.fullName}}
Elements completed: {{assessment.completedElements}}/{{assessment.totalElements}}
Deficiencies found: {{assessment.totalDeficiencies}}

[Review Assessment Button]
```

### Assessment Approved
```html
Subject: Assessment approved - {{building.name}}

Hi {{assessor.firstName}},

Great news! Your assessment has been approved:

Building: {{building.name}}
Approved by: {{approver.fullName}}
FCI: {{assessment.calculatedFci}}%

[View Report Button]
```

## 14.2 Notification Triggers

```typescript
const notificationTriggers = [
  // Assessment lifecycle
  { event: 'assessment.assigned', recipients: ['assignee'], template: 'assessment-assigned' },
  { event: 'assessment.submitted', recipients: ['branch_managers'], template: 'assessment-submitted' },
  { event: 'assessment.approved', recipients: ['assignees', 'creator'], template: 'assessment-approved' },
  { event: 'assessment.rejected', recipients: ['assignees', 'creator'], template: 'assessment-rejected' },
  
  // Reminders
  { event: 'assessment.due_soon', recipients: ['assignees'], template: 'assessment-reminder', daysBeforeDue: 3 },
  { event: 'assessment.overdue', recipients: ['assignees', 'branch_managers'], template: 'assessment-overdue' },
  
  // User management
  { event: 'user.invited', recipients: ['invitee'], template: 'user-invitation' },
  { event: 'user.password_reset', recipients: ['user'], template: 'password-reset' },
];
```

## 14.3 In-App Notifications

```typescript
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

type NotificationType = 
  | 'assessment_assigned'
  | 'assessment_approved'
  | 'assessment_rejected'
  | 'assessment_due_soon'
  | 'comment_added'
  | 'system_announcement';

// API endpoints
GET  /api/v1/notifications              // List notifications
PATCH /api/v1/notifications/:id/read    // Mark as read
POST /api/v1/notifications/read-all     // Mark all as read
```

---

# SECTION 15: MVP SUCCESS CRITERIA

## 15.1 Functional Acceptance Criteria

### Core Workflow (Must Have)
```
□ Org Admin can create organization with branches
□ Org Admin can invite users with appropriate roles
□ Branch Manager can create buildings with CRV
□ Branch Manager can create assessments with element selection
□ Branch Manager can assign assessors to assessments
□ Assessor receives notification of assignment
□ Assessor can view assigned assessment on mobile
□ Assessor can enter 18 Type Fields for each element
□ Assessor can rate condition (1-5)
□ Assessor can add deficiencies with cost estimates
□ Assessor can capture and attach photos
□ Assessor can work offline and sync when connected
□ Assessor can submit assessment for review
□ Branch Manager can review submitted assessment
□ Branch Manager can approve or reject assessment
□ FCI calculates automatically upon approval
□ Building FCI updates to reflect latest assessment
□ All roles can view appropriate dashboards
□ Users can generate PDF reports
□ Users can export data to Excel
```

### Data Integrity (Must Have)
```
□ FCI calculation matches: (Total DM / CRV) × 100
□ RUL calculation: (Year Installed + Lifetime) - Current Year
□ Total costs aggregate correctly
□ Element completion counts are accurate
□ Assessment status transitions are enforced
□ Soft deletes preserve data integrity
```

### Security (Must Have)
```
□ JWT authentication on all API endpoints
□ RBAC middleware prevents unauthorized access
□ Organization isolation is enforced
□ Branch-scoped users cannot access other branches
□ Assessors can only modify assigned assessments
□ Viewers have read-only access
□ Passwords are hashed (bcrypt)
□ SQL injection is prevented
□ XSS is prevented
```

## 15.2 Non-Functional Requirements

### Performance
```
API Response Times:
- Simple queries: < 100ms (P95)
- Complex queries: < 300ms (P95)
- File uploads: < 5s for 10MB

Frontend Performance:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
- Time to Interactive: < 3.5s

Mobile Performance:
- Initial load (online): < 3s
- Initial load (cached): < 1s
- Sync (100 elements): < 30s
```

### Reliability
```
- Uptime SLA: 99.9%
- Mean Time to Recovery: < 30 minutes
- Backup Recovery: < 1 hour
- Zero data loss on sync conflicts
```

### Scalability
```
- Support 100 concurrent users per organization
- Support 10,000 buildings per organization
- Support 100 photos per assessment
- Database queries optimized with indexes
```

### Accessibility
```
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios met
- Focus indicators visible
```

## 15.3 Launch Checklist

```
Pre-Launch:
□ Security audit completed
□ Penetration testing passed
□ Load testing passed (100 users)
□ All P0 bugs resolved
□ Accessibility audit passed
□ Documentation complete
□ Support runbooks created
□ Backup procedures tested
□ Monitoring dashboards configured
□ Alert thresholds set

Launch Day:
□ Database migrations applied
□ Seed data verified
□ SSL certificates valid
□ DNS propagation complete
□ Health checks passing
□ Support team briefed
□ Rollback plan ready

Post-Launch:
□ Monitor error rates (< 1%)
□ Monitor response times
□ Collect user feedback
□ Track feature adoption
□ Review support tickets
```

---

# SECTION 16: UI COMPONENT LIBRARY

## 16.1 Core Components

### Layout Components
```typescript
// AppShell - Main application wrapper
<AppShell>
  <Sidebar />        // Left navigation
  <Header />         // Top bar with user menu
  <Main>{children}</Main>
  <MobileNav />      // Bottom nav on mobile
</AppShell>

// PageHeader - Consistent page headers
<PageHeader
  title="Buildings"
  subtitle="Manage your building portfolio"
  actions={<Button>Add Building</Button>}
  breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Buildings' }]}
/>

// Card - Content container
<Card>
  <CardHeader title="Building Info" action={<IconButton />} />
  <CardContent>{/* content */}</CardContent>
  <CardFooter>{/* actions */}</CardFooter>
</Card>
```

### Data Display Components
```typescript
// DataTable - Sortable, filterable tables
<DataTable
  columns={columns}
  data={buildings}
  sortable
  filterable
  pagination={{ page, pageSize, total }}
  onSort={handleSort}
  onFilter={handleFilter}
  onPageChange={handlePageChange}
  emptyState={<EmptyState message="No buildings found" />}
/>

// StatCard - KPI display
<StatCard
  label="Total Buildings"
  value={156}
  change={+12}
  changeLabel="vs last month"
  icon={<BuildingIcon />}
/>

// FCIBadge - Condition indicator
<FCIBadge value={8.5} size="md" />
// Renders: Yellow badge "8.5% Fair"

// ConditionRating - 1-5 rating display
<ConditionRating value={3} editable onChange={handleChange} />

// ProgressBar - Assessment completion
<ProgressBar value={75} max={100} label="75% Complete" />
```

### Form Components
```typescript
// FormField - Wrapped input with label/error
<FormField
  label="Building Name"
  error={errors.name}
  required
>
  <Input {...register('name')} />
</FormField>

// Select - Dropdown with search
<Select
  options={branches}
  value={selectedBranch}
  onChange={setBranch}
  placeholder="Select branch..."
  searchable
/>

// DatePicker - Date selection
<DatePicker
  value={targetDate}
  onChange={setTargetDate}
  minDate={today}
  placeholder="Select target date"
/>

// FileUpload - Photo upload with preview
<FileUpload
  accept="image/*"
  maxSize={10 * 1024 * 1024} // 10MB
  multiple
  onUpload={handleUpload}
  preview
/>

// TypeFieldForm - 18 field assessment form
<TypeFieldForm
  element={element}
  onSave={handleSave}
  readonly={!canEdit}
/>
```

### Feedback Components
```typescript
// Toast - Notifications
toast.success('Building saved successfully');
toast.error('Failed to save building');
toast.warning('Assessment due in 3 days');

// Modal - Dialogs
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Delete"
  actions={
    <>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button variant="danger" onClick={handleDelete}>Delete</Button>
    </>
  }
>
  Are you sure you want to delete this building?
</Modal>

// LoadingState - Loading indicators
<LoadingState /> // Spinner
<LoadingState variant="skeleton" rows={5} /> // Skeleton
<LoadingState variant="progress" value={45} /> // Progress bar

// EmptyState - No data states
<EmptyState
  icon={<BuildingIcon />}
  title="No buildings yet"
  description="Add your first building to get started"
  action={<Button>Add Building</Button>}
/>

// ErrorState - Error display
<ErrorState
  title="Something went wrong"
  message={error.message}
  retry={refetch}
/>
```

## 16.2 Domain-Specific Components

### Building Components
```typescript
// BuildingCard - Building summary card
<BuildingCard
  building={building}
  onClick={handleClick}
  showFCI
  showLastAssessment
/>

// BuildingList - Building grid/list view
<BuildingList
  buildings={buildings}
  view="grid" // or "list"
  onSelect={handleSelect}
/>

// BuildingDetails - Full building view
<BuildingDetails
  building={building}
  assessments={assessments}
  onEdit={handleEdit}
/>
```

### Assessment Components
```typescript
// AssessmentWizard - Multi-step creation
<AssessmentWizard
  building={building}
  elements={uniformatElements}
  onComplete={handleComplete}
  steps={['Select Elements', 'Assign Team', 'Set Schedule', 'Review']}
/>

// AssessmentCard - Assessment summary
<AssessmentCard
  assessment={assessment}
  onClick={handleClick}
  showProgress
  showAssignees
/>

// AssessmentTimeline - Status history
<AssessmentTimeline
  events={[
    { status: 'created', date: '2024-01-15', user: 'John' },
    { status: 'in_progress', date: '2024-01-16', user: 'Jane' },
    { status: 'submitted', date: '2024-01-20', user: 'Jane' },
  ]}
/>
```

### Element Components
```typescript
// ElementGrid - Uniformat element selection
<ElementGrid
  elements={uniformatElements}
  selected={selectedIds}
  onToggle={handleToggle}
  groupBy="systemGroup" // A-G
/>

// ElementForm - 18 Type Field form
<ElementForm
  element={element}
  values={formValues}
  onChange={handleChange}
  onAddDeficiency={handleAddDeficiency}
  photos={photos}
  onAddPhoto={handleAddPhoto}
/>

// ElementSummary - Completed element view
<ElementSummary
  element={element}
  deficiencies={deficiencies}
  photos={photos}
  fci={calculatedFCI}
/>
```

### Deficiency Components
```typescript
// DeficiencyForm - Add/edit deficiency
<DeficiencyForm
  categories={deficiencyCategories}
  onSubmit={handleSubmit}
  initialValues={deficiency}
/>

// DeficiencyList - List of deficiencies
<DeficiencyList
  deficiencies={deficiencies}
  onEdit={handleEdit}
  onDelete={handleDelete}
  sortBy="priority"
/>

// DeficiencyCard - Single deficiency display
<DeficiencyCard
  deficiency={deficiency}
  showPhotos
  showCosts
/>
```

### Chart Components
```typescript
// FCITrendChart - FCI over time
<FCITrendChart
  data={fciHistory}
  period="12months"
/>

// ConditionDistribution - Pie/donut chart
<ConditionDistribution
  data={conditionBreakdown}
  type="donut"
/>

// CostBreakdown - Bar chart by category
<CostBreakdown
  data={deficiencyCosts}
  groupBy="category"
/>

// PortfolioHeatmap - Building conditions
<PortfolioHeatmap
  buildings={buildings}
  metric="fci"
/>
```

## 16.3 Mobile-Specific Components

```typescript
// MobileHeader - Compact header for mobile
<MobileHeader
  title="Assessment"
  back={true}
  actions={<SyncButton />}
/>

// SwipeableCard - Swipe actions on mobile
<SwipeableCard
  onSwipeLeft={handleDelete}
  onSwipeRight={handleComplete}
>
  <ElementCard element={element} />
</SwipeableCard>

// BottomSheet - Mobile modal alternative
<BottomSheet open={isOpen} onClose={handleClose}>
  <DeficiencyForm />
</BottomSheet>

// OfflineIndicator - Connection status
<OfflineIndicator
  isOnline={isOnline}
  pendingSync={pendingCount}
  onSync={handleSync}
/>

// CameraCapture - Native camera integration
<CameraCapture
  onCapture={handleCapture}
  maxPhotos={10}
  quality={0.8}
/>

// PullToRefresh - Refresh gesture
<PullToRefresh onRefresh={handleRefresh}>
  <AssessmentList assessments={assessments} />
</PullToRefresh>
```

---

# SECTION 17: MOBILE & OFFLINE STRATEGY

## 17.1 PWA Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PWA Architecture                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                        React Application                          │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│   │  │   Zustand   │  │  TanStack   │  │    Offline Store        │   │  │
│   │  │   (State)   │  │   Query     │  │    (Dexie.js)           │   │  │
│   │  └─────────────┘  └──────┬──────┘  └───────────┬─────────────┘   │  │
│   │                          │                      │                 │   │
│   │                          ▼                      ▼                 │   │
│   │                   ┌──────────────────────────────────┐           │   │
│   │                   │        Sync Manager              │           │   │
│   │                   │  • Queue operations              │           │   │
│   │                   │  • Conflict resolution           │           │   │
│   │                   │  • Retry logic                   │           │   │
│   │                   └──────────────┬───────────────────┘           │   │
│   └──────────────────────────────────│───────────────────────────────┘   │
│                                      │                                    │
│   ┌──────────────────────────────────▼───────────────────────────────┐   │
│   │                     Service Worker (Workbox)                      │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │   │
│   │  │   Cache     │  │  Background │  │    Push                 │   │   │
│   │  │   Strategy  │  │   Sync      │  │    Notifications        │   │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │                        IndexedDB (Dexie)                          │   │
│   │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐  │   │
│   │  │ Buildings │  │Assessments│  │  Elements │  │  SyncQueue    │  │   │
│   │  └───────────┘  └───────────┘  └───────────┘  └───────────────┘  │   │
│   └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## 17.2 IndexedDB Schema (Dexie)

```typescript
// db.ts - Dexie database definition
import Dexie, { Table } from 'dexie';

interface LocalBuilding {
  id: string;
  serverId?: string;
  data: Building;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
}

interface LocalAssessment {
  id: string;
  serverId?: string;
  buildingId: string;
  data: Assessment;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
}

interface LocalElement {
  id: string;
  serverId?: string;
  assessmentId: string;
  data: AssessmentElement;
  syncStatus: 'synced' | 'pending' | 'conflict';
  lastModified: number;
}

interface LocalPhoto {
  id: string;
  serverId?: string;
  elementId?: string;
  deficiencyId?: string;
  blob: Blob;
  thumbnail: Blob;
  syncStatus: 'synced' | 'pending' | 'failed';
  uploadProgress?: number;
}

interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  lastError?: string;
}

class OnyxDatabase extends Dexie {
  buildings!: Table<LocalBuilding>;
  assessments!: Table<LocalAssessment>;
  elements!: Table<LocalElement>;
  photos!: Table<LocalPhoto>;
  syncQueue!: Table<SyncQueueItem>;
  
  constructor() {
    super('OnyxReportDB');
    this.version(1).stores({
      buildings: 'id, serverId, syncStatus, lastModified',
      assessments: 'id, serverId, buildingId, syncStatus, lastModified',
      elements: 'id, serverId, assessmentId, syncStatus, lastModified',
      photos: 'id, serverId, elementId, deficiencyId, syncStatus',
      syncQueue: 'id, operation, table, timestamp, retryCount',
    });
  }
}

export const db = new OnyxDatabase();
```

## 17.3 Sync Manager

```typescript
// syncManager.ts
class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  
  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }
  
  private async handleOnline() {
    this.isOnline = true;
    await this.processQueue();
  }
  
  private handleOffline() {
    this.isOnline = false;
  }
  
  // Queue an operation for sync
  async queueOperation(
    operation: 'create' | 'update' | 'delete',
    table: string,
    recordId: string,
    payload: any
  ) {
    await db.syncQueue.add({
      id: crypto.randomUUID(),
      operation,
      table,
      recordId,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    });
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.processQueue();
    }
  }
  
  // Process all queued operations
  async processQueue() {
    if (this.isSyncing || !this.isOnline) return;
    
    this.isSyncing = true;
    
    try {
      const items = await db.syncQueue
        .orderBy('timestamp')
        .toArray();
      
      for (const item of items) {
        try {
          await this.syncItem(item);
          await db.syncQueue.delete(item.id);
        } catch (error) {
          await this.handleSyncError(item, error);
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }
  
  private async syncItem(item: SyncQueueItem) {
    const endpoint = this.getEndpoint(item.table, item.recordId);
    const method = this.getMethod(item.operation);
    
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: item.operation !== 'delete' 
        ? JSON.stringify(item.payload) 
        : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
    
    // Update local record with server response
    if (item.operation === 'create') {
      const serverData = await response.json();
      await this.updateLocalRecord(item.table, item.recordId, serverData);
    }
  }
  
  private async handleSyncError(item: SyncQueueItem, error: Error) {
    const maxRetries = 3;
    
    if (item.retryCount >= maxRetries) {
      // Mark as conflict for manual resolution
      await db[item.table].update(item.recordId, {
        syncStatus: 'conflict',
      });
      await db.syncQueue.delete(item.id);
    } else {
      // Increment retry count
      await db.syncQueue.update(item.id, {
        retryCount: item.retryCount + 1,
        lastError: error.message,
      });
    }
  }
}

export const syncManager = new SyncManager();
```

## 17.4 Conflict Resolution

```typescript
// conflictResolver.ts
interface ConflictResolution {
  strategy: 'local' | 'server' | 'merge' | 'manual';
  resolvedData?: any;
}

class ConflictResolver {
  // Detect conflicts between local and server data
  detectConflict(local: any, server: any): boolean {
    return local.updatedAt !== server.updatedAt;
  }
  
  // Auto-resolve simple conflicts
  autoResolve(local: any, server: any): ConflictResolution | null {
    // If only local changed, keep local
    if (!server.updatedAt || local.updatedAt > server.updatedAt) {
      return { strategy: 'local' };
    }
    
    // If only server changed, keep server
    if (!local.locallyModified) {
      return { strategy: 'server', resolvedData: server };
    }
    
    // Both changed - attempt merge
    return this.attemptMerge(local, server);
  }
  
  // Attempt field-level merge
  private attemptMerge(local: any, server: any): ConflictResolution | null {
    const localChanges = this.getChangedFields(local.original, local.current);
    const serverChanges = this.getChangedFields(local.original, server);
    
    // Check for overlapping changes
    const conflicts = localChanges.filter(f => serverChanges.includes(f));
    
    if (conflicts.length === 0) {
      // No overlapping changes - merge is possible
      const merged = { ...server };
      localChanges.forEach(field => {
        merged[field] = local.current[field];
      });
      return { strategy: 'merge', resolvedData: merged };
    }
    
    // Overlapping changes require manual resolution
    return { strategy: 'manual' };
  }
  
  private getChangedFields(original: any, current: any): string[] {
    return Object.keys(current).filter(
      key => JSON.stringify(original[key]) !== JSON.stringify(current[key])
    );
  }
}

export const conflictResolver = new ConflictResolver();
```

## 17.5 Service Worker Configuration

```typescript
// service-worker.ts (Workbox)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// Cache static assets (fonts, images)
registerRoute(
  ({ request }) => request.destination === 'image' || 
                   request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// API calls - Network first, fall back to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
    ],
  })
);

// Background sync for offline mutations
const bgSyncPlugin = new BackgroundSyncPlugin('syncQueue', {
  maxRetentionTime: 24 * 60, // 24 hours
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v1/') && 
               ['POST', 'PUT', 'PATCH', 'DELETE'].includes(self.request?.method),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);
```

---

# SECTION 18: ERROR HANDLING

## 18.1 Error Types

```typescript
// errors/types.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(errors: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Validation failed', 400, { errors });
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found`, 404, { resource, id });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super('CONFLICT', message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super('RATE_LIMITED', 'Too many requests', 429, { retryAfter });
  }
}
```

## 18.2 API Error Handler

```typescript
// middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/types';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    organizationId: req.user?.organizationId,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    
    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Record already exists',
          details: { field: prismaError.meta?.target },
        },
      });
    }
    
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
        },
      });
    }
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as any;
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: {
          errors: zodError.errors.map((e: any) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
      },
    });
  }

  // Unknown errors - don't leak details
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

## 18.3 Frontend Error Handling

```typescript
// hooks/useApiError.ts
import { toast } from 'react-hot-toast';

interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export function useApiError() {
  const handleError = (error: ApiError) => {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        // Show field-specific errors
        if (error.details?.errors) {
          error.details.errors.forEach((e: any) => {
            toast.error(`${e.field}: ${e.message}`);
          });
        }
        break;
        
      case 'UNAUTHORIZED':
        // Redirect to login
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        break;
        
      case 'FORBIDDEN':
        toast.error('You do not have permission to perform this action.');
        break;
        
      case 'NOT_FOUND':
        toast.error('The requested resource was not found.');
        break;
        
      case 'CONFLICT':
        toast.error(error.message || 'A conflict occurred. Please refresh and try again.');
        break;
        
      case 'RATE_LIMITED':
        const retryAfter = error.details?.retryAfter || 60;
        toast.error(`Too many requests. Please try again in ${retryAfter} seconds.`);
        break;
        
      case 'OFFLINE':
        toast.error('You are offline. Changes will sync when connected.');
        break;
        
      default:
        toast.error('Something went wrong. Please try again.');
    }
  };

  return { handleError };
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error reporting service
    console.error('Error boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          title="Something went wrong"
          message={this.state.error?.message}
          retry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
```

---

# SECTION 19: API EXAMPLES

## 19.1 Authentication Flow

```bash
# Login - Get tokens
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword123"
}

# Response
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "v1.refresh.abc123...",
    "expiresIn": 900,
    "user": {
      "id": "usr_abc123",
      "email": "admin@example.com",
      "firstName": "John",
      "lastName": "Admin",
      "role": "org_admin",
      "organizationId": "org_xyz789"
    }
  }
}
```

## 19.2 Building CRUD

```bash
# Create building
POST /api/v1/buildings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "branchId": "br_abc123",
  "name": "Corporate HQ",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zipCode": "94105",
  "yearBuilt": 1985,
  "grossSquareFootage": 150000,
  "currentReplacementValue": 45000000,
  "buildingType": "office"
}

# Response
{
  "success": true,
  "data": {
    "id": "bld_def456",
    "branchId": "br_abc123",
    "name": "Corporate HQ",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "yearBuilt": 1985,
    "grossSquareFootage": 150000,
    "currentReplacementValue": 45000000,
    "buildingType": "office",
    "currentFci": null,
    "totalDeferredMaintenance": 0,
    "lastAssessmentDate": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}

# List buildings with filters
GET /api/v1/buildings?branchId=br_abc123&fciMin=5&fciMax=15&page=1&pageSize=20
Authorization: Bearer {accessToken}

# Response
{
  "success": true,
  "data": [
    {
      "id": "bld_def456",
      "name": "Corporate HQ",
      "currentFci": 8.5,
      "totalDeferredMaintenance": 3825000,
      "lastAssessmentDate": "2024-01-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

## 19.3 Assessment Workflow

```bash
# Create assessment
POST /api/v1/assessments
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "buildingId": "bld_def456",
  "assessmentType": "annual",
  "targetCompletionDate": "2024-02-15",
  "elementIds": ["unif_B2010", "unif_B2020", "unif_D3010"],
  "assigneeIds": ["usr_assessor1", "usr_assessor2"]
}

# Response
{
  "success": true,
  "data": {
    "id": "asmt_ghi789",
    "buildingId": "bld_def456",
    "status": "draft",
    "assessmentType": "annual",
    "targetCompletionDate": "2024-02-15T00:00:00Z",
    "totalElements": 3,
    "completedElements": 0,
    "totalDeficiencies": 0,
    "assignees": [
      { "userId": "usr_assessor1", "name": "Jane Smith" },
      { "userId": "usr_assessor2", "name": "Bob Jones" }
    ],
    "createdAt": "2024-01-15T11:00:00Z"
  }
}

# Start assessment (change status to in_progress)
POST /api/v1/assessments/asmt_ghi789/start
Authorization: Bearer {accessToken}

# Response
{
  "success": true,
  "data": {
    "id": "asmt_ghi789",
    "status": "in_progress",
    "startedAt": "2024-01-16T09:00:00Z"
  }
}

# Submit assessment for review
POST /api/v1/assessments/asmt_ghi789/submit
Authorization: Bearer {accessToken}

# Approve assessment
POST /api/v1/assessments/asmt_ghi789/approve
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "comments": "All elements properly documented. Approved."
}

# Response includes calculated FCI
{
  "success": true,
  "data": {
    "id": "asmt_ghi789",
    "status": "approved",
    "calculatedFci": 8.5,
    "totalDeferredMaintenance": 3825000,
    "approvedAt": "2024-01-20T14:30:00Z",
    "approvedBy": "usr_manager1"
  }
}
```

## 19.4 Element Assessment

```bash
# Get elements for assessment
GET /api/v1/assessments/asmt_ghi789/elements
Authorization: Bearer {accessToken}

# Response
{
  "success": true,
  "data": [
    {
      "id": "elem_001",
      "uniformatCode": "B2010",
      "uniformatName": "Exterior Walls",
      "systemGroup": "B",
      "systemGroupName": "Shell",
      "isCompleted": false,
      "conditionRating": null
    },
    {
      "id": "elem_002",
      "uniformatCode": "D3010",
      "uniformatName": "Energy Supply",
      "systemGroup": "D",
      "systemGroupName": "Services",
      "isCompleted": true,
      "conditionRating": 3
    }
  ]
}

# Update element (18 Type Fields)
PUT /api/v1/elements/elem_001
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "typeFields": {
    "identity": {
      "elementName": "Main Exterior Walls",
      "location": "Perimeter - All Sides",
      "description": "Brick veneer over steel frame"
    },
    "classification": {
      "uniformatCode": "B2010",
      "systemGroup": "B",
      "subCategory": "Masonry"
    },
    "lifecycle": {
      "yearInstalled": 1985,
      "expectedLifetimeYears": 50,
      "remainingUsefulLife": 11
    },
    "quantity": {
      "quantity": 45000,
      "unit": "SF",
      "unitCost": 85
    },
    "equipment": {
      "manufacturer": "Various",
      "model": null,
      "serialNumber": null
    },
    "financial": {
      "replacementCost": 3825000,
      "annualMaintenanceCost": 15000
    },
    "condition": {
      "conditionRating": 3,
      "conditionNotes": "Some mortar deterioration on north face"
    }
  }
}

# Response
{
  "success": true,
  "data": {
    "id": "elem_001",
    "uniformatCode": "B2010",
    "isCompleted": true,
    "conditionRating": 3,
    "typeFields": { ... },
    "calculatedRul": 11,
    "updatedAt": "2024-01-17T10:45:00Z"
  }
}
```

## 19.5 Deficiency Management

```bash
# Add deficiency to element
POST /api/v1/elements/elem_001/deficiencies
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "categoryId": "def_cat_structural",
  "description": "Mortar joints deteriorating on north facade, approximately 500 SF affected",
  "severity": "moderate",
  "priority": "high",
  "estimatedCost": 45000,
  "recommendedAction": "Repoint affected masonry joints within 12 months"
}

# Response
{
  "success": true,
  "data": {
    "id": "def_abc123",
    "elementId": "elem_001",
    "categoryId": "def_cat_structural",
    "categoryName": "Structural Deficiency",
    "description": "Mortar joints deteriorating...",
    "severity": "moderate",
    "priority": "high",
    "estimatedCost": 45000,
    "recommendedAction": "Repoint affected masonry joints...",
    "photos": [],
    "createdAt": "2024-01-17T11:00:00Z"
  }
}

# Upload photo to deficiency
POST /api/v1/deficiencies/def_abc123/photos
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [binary image data]
caption: "North facade mortar deterioration - close up"

# Response
{
  "success": true,
  "data": {
    "id": "photo_xyz789",
    "url": "https://cdn.onyxreport.com/photos/photo_xyz789.jpg",
    "thumbnailUrl": "https://cdn.onyxreport.com/photos/photo_xyz789_thumb.jpg",
    "caption": "North facade mortar deterioration - close up",
    "uploadedAt": "2024-01-17T11:05:00Z"
  }
}
```

## 19.6 Reports & Analytics

```bash
# Get portfolio FCI summary
GET /api/v1/analytics/portfolio/fci?period=12months
Authorization: Bearer {accessToken}

# Response
{
  "success": true,
  "data": {
    "currentFci": 12.3,
    "previousFci": 14.1,
    "change": -1.8,
    "totalBuildings": 156,
    "totalCrv": 2450000000,
    "totalDeferredMaintenance": 301350000,
    "byCondition": {
      "good": { "count": 45, "percentage": 28.8 },
      "fair": { "count": 67, "percentage": 42.9 },
      "poor": { "count": 38, "percentage": 24.4 },
      "critical": { "count": 6, "percentage": 3.8 }
    },
    "trend": [
      { "month": "2024-01", "fci": 14.1 },
      { "month": "2024-02", "fci": 13.8 },
      { "month": "2024-03", "fci": 12.3 }
    ]
  }
}

# Generate PDF report
POST /api/v1/reports/building/bld_def456/pdf
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "includePhotos": true,
  "includeDeficiencies": true,
  "includeCostBreakdown": true
}

# Response
{
  "success": true,
  "data": {
    "reportId": "rpt_abc123",
    "downloadUrl": "https://cdn.onyxreport.com/reports/rpt_abc123.pdf",
    "expiresAt": "2024-01-18T11:00:00Z"
  }
}
```

---

# SECTION 20: DATA MIGRATION & ONBOARDING

## 20.1 Import Templates

### Buildings Import (CSV)
```csv
name,address,city,state,zipCode,yearBuilt,grossSquareFootage,currentReplacementValue,buildingType,branchName
Corporate HQ,123 Main St,San Francisco,CA,94105,1985,150000,45000000,office,West Region
Warehouse A,456 Industrial Blvd,Oakland,CA,94607,1992,75000,15000000,warehouse,West Region
Data Center,789 Tech Park,San Jose,CA,95110,2010,50000,85000000,data_center,West Region
```

### Elements Import (CSV)
```csv
buildingName,uniformatCode,yearInstalled,quantity,unit,conditionRating,replacementCost,notes
Corporate HQ,B2010,1985,45000,SF,3,3825000,Brick veneer exterior
Corporate HQ,D3010,2015,1,EA,4,250000,Emergency generator
Corporate HQ,D3020,1998,3,EA,2,450000,HVAC units need replacement
```

## 20.2 Import API

```bash
# Validate import file
POST /api/v1/import/validate
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data

file: [CSV file]
type: buildings

# Response
{
  "success": true,
  "data": {
    "totalRows": 150,
    "validRows": 147,
    "invalidRows": 3,
    "errors": [
      { "row": 45, "field": "yearBuilt", "error": "Invalid year format" },
      { "row": 89, "field": "currentReplacementValue", "error": "Must be positive number" },
      { "row": 122, "field": "branchName", "error": "Branch 'East Region' not found" }
    ]
  }
}

# Execute import
POST /api/v1/import/execute
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "validationId": "val_abc123",
  "skipInvalidRows": true
}

# Response
{
  "success": true,
  "data": {
    "imported": 147,
    "skipped": 3,
    "jobId": "job_xyz789"
  }
}

# Check import status
GET /api/v1/import/status/job_xyz789
Authorization: Bearer {accessToken}

# Response
{
  "success": true,
  "data": {
    "status": "completed",
    "progress": 100,
    "imported": 147,
    "skipped": 3,
    "completedAt": "2024-01-15T12:30:00Z"
  }
}
```

## 20.3 Customer Onboarding Checklist

```
Phase 1: Account Setup (Day 1)
□ Create organization
□ Configure branding (logo, colors)
□ Set up SSO integration (if enterprise)
□ Create branches structure
□ Invite Org Admin users

Phase 2: Data Import (Days 2-5)
□ Prepare building data spreadsheet
□ Validate import file
□ Import buildings
□ Verify building data
□ Import historical assessments (if available)

Phase 3: User Setup (Days 3-5)
□ Create Branch Manager accounts
□ Assign managers to branches
□ Create Assessor accounts
□ Assign assessors to branches
□ Create Viewer accounts

Phase 4: Training (Days 5-10)
□ Org Admin training session (2 hours)
□ Branch Manager training session (2 hours)
□ Assessor mobile app training (1 hour)
□ Viewer dashboard training (30 min)

Phase 5: Pilot Assessment (Days 10-20)
□ Select pilot building
□ Create first assessment
□ Complete field assessment
□ Review and approve
□ Generate first report
□ Gather feedback

Phase 6: Go-Live (Day 21+)
□ Roll out to all branches
□ Schedule regular assessments
□ Configure automated reminders
□ Set up executive dashboards
```

---

# APPENDIX A: GLOSSARY

| Term | Definition |
|------|------------|
| **Assessment** | A point-in-time evaluation of a building's condition |
| **Branch** | A regional grouping of buildings within an organization |
| **CRV** | Current Replacement Value - cost to replace building at today's prices |
| **Deficiency** | A documented problem or maintenance need |
| **DM** | Deferred Maintenance - total cost of outstanding repairs |
| **Element** | A building system or component (per Uniformat II) |
| **FCI** | Facility Condition Index = (Total DM / CRV) × 100 |
| **Organization** | Top-level tenant/customer account |
| **RUL** | Remaining Useful Life - years until replacement needed |
| **Type Fields** | The 18 data categories captured for each element |
| **Uniformat II** | ASTM standard classification for building elements |

---

# APPENDIX B: UNIFORMAT II QUICK REFERENCE

| Code | Name | System Group |
|------|------|--------------|
| A10 | Foundations | A - Substructure |
| A20 | Basement Construction | A - Substructure |
| B10 | Superstructure | B - Shell |
| B20 | Exterior Enclosure | B - Shell |
| B30 | Roofing | B - Shell |
| C10 | Interior Construction | C - Interiors |
| C20 | Stairs | C - Interiors |
| C30 | Interior Finishes | C - Interiors |
| D10 | Conveying | D - Services |
| D20 | Plumbing | D - Services |
| D30 | HVAC | D - Services |
| D40 | Fire Protection | D - Services |
| D50 | Electrical | D - Services |
| E10 | Equipment | E - Equipment |
| E20 | Furnishings | E - Equipment |
| F10 | Special Construction | F - Special |
| F20 | Selective Demolition | F - Special |
| G10 | Site Preparation | G - Site |
| G20 | Site Improvements | G - Site |
| G30 | Site Civil/Mechanical | G - Site |
| G40 | Site Electrical | G - Site |

---

# IMPORTANT REMINDERS

1. **Always enforce RBAC** - Check permissions on every endpoint
2. **Always scope by organization** - Use tenant middleware
3. **Offline-first for assessors** - Field work must work without internet
4. **FCI calculation is sacred** - Must be accurate and auditable
5. **Photos are evidence** - Never hard delete, use soft deletes
6. **Branch Manager is key user** - Optimize their experience
7. **Sync conflicts must resolve** - Never lose field data
8. **Performance matters** - <200ms API response target
9. **Mobile-first for field work** - Touch-friendly, large targets
10. **Accessibility is required** - WCAG 2.1 AA compliance

---

*This document is the single source of truth for building Onyx Report.*
*Keep it updated as requirements evolve.*

**Version:** 2.0.0 (Complete)
**Total Sections:** 20 + 2 Appendices
**Total Implementation:** 32 weeks  
**Target MVP:** 26 weeks (Phase 1-6)
**Last Updated:** January 2026
