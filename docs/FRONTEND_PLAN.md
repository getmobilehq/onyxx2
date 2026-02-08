# Onyx Report - Frontend Architecture Plan

## 1. Technology Stack

### Core
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (already in monorepo)
- **Routing**: React Router v6
- **State Management**:
  - React Query (TanStack Query) for server state
  - Zustand for client state (auth, UI preferences)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors

### UI & Styling
- **Component Library**: shadcn/ui (Tailwind-based, customizable)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts or Chart.js
- **Tables**: TanStack Table
- **Date Picker**: react-day-picker
- **File Upload**: react-dropzone

### Additional Libraries
- **Authentication**: Custom JWT with Auth0 integration
- **Notifications**: sonner (toast notifications)
- **PDF Generation**: jsPDF or react-pdf
- **Export**: xlsx for Excel exports
- **Maps** (optional): Mapbox or Google Maps for building locations

---

## 2. Project Structure

```
apps/web/
├── src/
│   ├── app/                    # App shell & providers
│   │   ├── App.tsx
│   │   ├── Router.tsx
│   │   └── providers/
│   │       ├── AuthProvider.tsx
│   │       ├── QueryProvider.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── components/             # Shared components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── forms/             # Reusable form components
│   │   ├── data-display/      # Tables, cards, stats
│   │   └── feedback/          # Loading, error, empty states
│   │
│   ├── features/              # Feature-based modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── api/
│   │   │   └── pages/
│   │   ├── dashboard/
│   │   ├── buildings/
│   │   ├── assessments/
│   │   ├── deficiencies/
│   │   ├── reports/
│   │   └── settings/
│   │
│   ├── lib/                   # Utilities & config
│   │   ├── api/              # API client & endpoints
│   │   ├── hooks/            # Global custom hooks
│   │   ├── utils/            # Helper functions
│   │   ├── constants/        # App constants
│   │   └── validations/      # Zod schemas
│   │
│   ├── stores/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── preferencesStore.ts
│   │
│   ├── types/                # TypeScript types
│   │   ├── api.ts
│   │   ├── entities.ts
│   │   └── common.ts
│   │
│   └── styles/               # Global styles
│       ├── globals.css
│       └── themes.css
```

---

## 3. Design System & Brand Integration

### Color Palette (To be defined from brand assets)
```typescript
// tailwind.config.js - to be customized
{
  colors: {
    primary: {
      50: '#...',
      // ... brand primary colors
    },
    secondary: { /* ... */ },
    accent: { /* ... */ },
    neutral: { /* ... */ },
    // Semantic colors
    success: { /* ... */ },
    warning: { /* ... */ },
    error: { /* ... */ },
    info: { /* ... */ },
  }
}
```

### Typography
- **Headings**: H1-H6 component variants
- **Body**: Small, Base, Large
- **Labels**: Form labels, badges, tags
- **Code**: Monospace for codes/IDs

### Component Categories
1. **Core UI** (shadcn/ui based)
   - Button, Input, Select, Checkbox, Radio
   - Dialog, Sheet, Popover, Dropdown
   - Card, Badge, Avatar, Separator
   - Alert, Toast, Progress

2. **Data Display**
   - DataTable with sorting, filtering, pagination
   - StatsCard with trend indicators
   - ChartCard (Bar, Line, Pie, Donut)
   - Timeline for assessment workflow
   - FilePreview for photos

3. **Forms**
   - FormField wrapper with validation
   - SearchInput with debounce
   - DateRangePicker
   - FileUpload with drag-and-drop
   - MultiSelect for tags/categories

4. **Layout**
   - AppShell (sidebar + header + content)
   - PageHeader with breadcrumbs & actions
   - EmptyState for no data
   - LoadingSpinner, Skeleton

---

## 4. Routing Architecture

### Public Routes
```
/login
/signup
/forgot-password
/reset-password/:token
/accept-invite/:token
```

### Protected Routes (require auth)
```
/                           → Dashboard
/buildings                  → Building list
/buildings/new              → Create building
/buildings/:id              → Building details
/buildings/:id/edit         → Edit building

/assessments                → Assessment list
/assessments/new            → Create assessment
/assessments/:id            → Assessment details
/assessments/:id/conduct    → Conduct assessment (assessor view)

/reports                    → Reports hub
/reports/portfolio          → Building portfolio report
/reports/capital-forecast   → Capital forecast
/reports/deficiencies       → Deficiency analysis

/settings                   → Settings hub
/settings/profile           → User profile
/settings/organization      → Organization settings
/settings/branches          → Branch management
/settings/users             → User management

/admin (org_admin only)     → Admin panel
```

### Route Protection
```typescript
// Route guards
- RequireAuth: Must be logged in
- RequireRole: Must have specific role
- RequireOrganization: Must belong to org
```

---

## 5. State Management Strategy

### Server State (React Query)
```typescript
// Query keys structure
const queryKeys = {
  buildings: {
    all: ['buildings'] as const,
    list: (filters) => [...queryKeys.buildings.all, 'list', filters] as const,
    detail: (id) => [...queryKeys.buildings.all, 'detail', id] as const,
  },
  assessments: {
    all: ['assessments'] as const,
    list: (filters) => [...queryKeys.assessments.all, 'list', filters] as const,
    detail: (id) => [...queryKeys.assessments.all, 'detail', id] as const,
  },
  // ... similar structure for other entities
}
```

### Client State (Zustand)
```typescript
// authStore
interface AuthStore {
  user: User | null
  token: string | null
  login: (email, password) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

// uiStore
interface UIStore {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme) => void
}
```

---

## 6. Authentication Flow

### Login Process
1. User enters credentials
2. POST `/auth/login` → receive JWT + user data
3. Store token in localStorage + authStore
4. Set axios default header
5. Redirect to dashboard

### Token Management
- **Access Token**: Store in memory + localStorage
- **Refresh**: Implement token refresh on 401
- **Interceptor**: Auto-attach token to requests
- **Logout**: Clear token + redirect to login

### Role-Based Access
```typescript
// usePermissions hook
const usePermissions = () => {
  const { user } = useAuthStore()

  return {
    canCreateAssessment: ['org_admin', 'branch_manager'].includes(user?.role),
    canApproveAssessment: ['org_admin', 'branch_manager'].includes(user?.role),
    canManageUsers: user?.role === 'org_admin',
    // ... more permissions
  }
}
```

---

## 7. Feature Breakdown

### 7.1 Dashboard
**Purpose**: Overview of organization metrics

**Components**:
- Stats Cards (buildings, assessments, deficiencies, portfolio FCI)
- Recent Assessments table
- Portfolio FCI chart (trend over time)
- Deficiencies by Priority (pie chart)
- Quick Actions (Create Assessment, Add Building)

**API Calls**:
- `GET /api/v1/reports/dashboard`

---

### 7.2 Buildings Module

#### Building List Page
**Features**:
- DataTable with sorting/filtering
- Search by name/code
- Filter by branch, FCI range
- Actions: View, Edit, Delete, Create Assessment
- Export to Excel

**Columns**: Name, Code, Branch, Type, Sq Ft, FCI, Last Assessment, Actions

**API Calls**:
- `GET /api/v1/buildings` (with filters)

#### Building Detail Page
**Tabs**:
1. **Overview**: Building info, photos, key metrics
2. **Assessments**: List of all assessments
3. **Maintenance History**: Deficiency timeline
4. **Photos**: Photo gallery

**API Calls**:
- `GET /api/v1/buildings/:id`
- `GET /api/v1/assessments?buildingId=:id`
- `GET /api/v1/photos?buildingId=:id`

#### Building Form (Create/Edit)
**Fields**: Name, Code, Branch, Address, Type, Year Built, Square Feet, Replacement Value, Description
**Photo Upload**: Drag & drop for up to 3 photos

**API Calls**:
- `POST /api/v1/buildings`
- `PATCH /api/v1/buildings/:id`
- `POST /api/v1/photos` (for each photo)

---

### 7.3 Assessments Module

#### Assessment List Page
**Features**:
- DataTable with status badges
- Filter by status, branch, building
- Status workflow indicators
- Actions based on status & role

**Columns**: Name, Building, Branch, Status, Progress, Assignees, Due Date, Actions

**API Calls**:
- `GET /api/v1/assessments` (with filters)

#### Assessment Detail Page
**Tabs**:
1. **Overview**: Assessment info, workflow status
2. **Elements**: List of assessment elements with conditions
3. **Deficiencies**: All deficiencies found
4. **Photos**: Attached photos
5. **Activity**: Audit log of changes

**Workflow Actions** (based on status):
- **Draft**: Start, Edit, Delete
- **In Progress**: Submit, Add Elements, Add Deficiencies
- **Submitted**: Approve, Reject
- **Approved**: View Report, Export PDF

**API Calls**:
- `GET /api/v1/assessments/:id`
- `GET /api/v1/assessments/:id/elements`
- `GET /api/v1/assessment-elements/:id/deficiencies`
- `POST /api/v1/assessments/:id/start`
- `POST /api/v1/assessments/:id/submit`
- `POST /api/v1/assessments/:id/approve`

#### Conduct Assessment Page (Assessor)
**Purpose**: Field assessment interface

**Layout**:
- Left panel: Element list with progress
- Right panel: Selected element detail form

**Element Assessment Form**:
- Condition rating (1-5 stars)
- Observations (text area)
- Photos (upload multiple)
- Add Deficiency button

**Deficiency Form**:
- Title, Description
- Priority (immediate, short-term, medium-term, long-term)
- Severity (minor, moderate, major, critical)
- Category
- Estimated Cost, Quantity, Unit
- Recommended Action
- Target Year
- Photos

**API Calls**:
- `PATCH /api/v1/assessment-elements/:id`
- `POST /api/v1/assessment-elements/:id/deficiencies`
- `POST /api/v1/photos`

---

### 7.4 Deficiencies Module

#### Deficiency List Page
**Features**:
- DataTable with priority/severity badges
- Filter by priority, severity, building, status
- Sort by cost, priority, target year
- Bulk actions

**Columns**: Title, Building, Priority, Severity, Cost, Target Year, Status, Actions

**API Calls**:
- `GET /api/v1/reports/deficiency-summary`

#### Deficiency Detail Page
**Sections**:
- Deficiency Info
- Assessment Element context
- Related Photos
- Cost Breakdown
- Recommended Action

**API Calls**:
- `GET /api/v1/deficiencies/:id`

---

### 7.5 Reports Module

#### Reports Hub
**Report Cards**:
1. Building Portfolio Report
2. Assessment Summary
3. Deficiency Analysis
4. Capital Forecast (10-year)

#### Building Portfolio Report
**Visualizations**:
- Portfolio FCI gauge
- Buildings by FCI rating (table + chart)
- Total replacement value
- Total deferred maintenance
- Filter by branch

**Export**: PDF, Excel

**API Calls**:
- `GET /api/v1/reports/building-portfolio`

#### Capital Forecast Report
**Visualizations**:
- 10-year cost projection (bar chart)
- Year-over-year breakdown
- Priority distribution
- Filter by branch

**Export**: PDF, Excel

**API Calls**:
- `GET /api/v1/reports/capital-forecast`

---

### 7.6 Settings Module

#### User Profile
- Edit name, email, phone
- Change avatar
- Preferences (notifications, theme)

#### Organization Settings (Admin only)
- Organization info
- Subscription details
- Billing

#### Branch Management (Admin only)
- CRUD branches
- Assign users to branches

#### User Management (Admin only)
- Invite users
- Manage roles
- Deactivate users

---

## 8. Data Fetching Patterns

### List Pages
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.buildings.list(filters),
  queryFn: () => buildingsApi.list(filters),
  keepPreviousData: true, // For pagination
})
```

### Detail Pages
```typescript
const { data: building } = useQuery({
  queryKey: queryKeys.buildings.detail(id),
  queryFn: () => buildingsApi.getById(id),
  enabled: !!id,
})
```

### Mutations
```typescript
const createMutation = useMutation({
  mutationFn: buildingsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(queryKeys.buildings.all)
    toast.success('Building created')
    navigate('/buildings')
  },
  onError: (error) => {
    toast.error(error.message)
  },
})
```

### Optimistic Updates
```typescript
const updateMutation = useMutation({
  mutationFn: buildingsApi.update,
  onMutate: async (newData) => {
    // Cancel ongoing queries
    await queryClient.cancelQueries(queryKeys.buildings.detail(id))

    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.buildings.detail(id))

    // Optimistically update
    queryClient.setQueryData(queryKeys.buildings.detail(id), newData)

    return { previous }
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.buildings.detail(id), context.previous)
  },
  onSettled: () => {
    queryClient.invalidateQueries(queryKeys.buildings.detail(id))
  },
})
```

---

## 9. File Upload Strategy

### Photo Upload Component
```typescript
interface PhotoUploadProps {
  maxFiles?: number
  onUpload: (files: File[]) => Promise<void>
  entityType: 'building' | 'deficiency' | 'assessment-element'
  entityId: string
}
```

### Upload Flow
1. User selects/drops files
2. Validate (type, size)
3. Show preview with progress
4. Upload to backend (POST /api/v1/photos)
5. Backend uploads to Supabase Storage
6. Store photo record in DB
7. Update UI with uploaded photo

### Image Display
- Lazy loading with blur placeholder
- Lightbox for full-screen view
- Download/delete actions

---

## 10. Responsive Design Strategy

### Breakpoints (Tailwind defaults)
- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

### Mobile Adaptations
- **Sidebar**: Collapsible drawer on mobile
- **Tables**: Horizontal scroll or card view
- **Forms**: Single column layout
- **Charts**: Simplified on mobile

---

## 11. Performance Optimizations

1. **Code Splitting**: Route-based lazy loading
2. **Image Optimization**: WebP format, lazy loading
3. **List Virtualization**: For long lists (react-window)
4. **Debouncing**: Search inputs (300ms)
5. **Caching**: React Query cache (5min default)
6. **Bundle Analysis**: Regular size monitoring

---

## 12. Error Handling

### Error Boundaries
- Global error boundary
- Feature-level error boundaries
- Fallback UI for crashes

### API Error Handling
```typescript
// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authStore.logout()
      navigate('/login')
    }

    if (error.response?.status === 403) {
      toast.error('You do not have permission')
    }

    // Show user-friendly errors
    const message = error.response?.data?.message || 'An error occurred'
    return Promise.reject(new Error(message))
  }
)
```

---

## 13. Testing Strategy

### Unit Tests (Vitest)
- Utility functions
- Custom hooks
- Form validations

### Component Tests (React Testing Library)
- UI components
- Form submissions
- User interactions

### E2E Tests (Playwright)
- Critical user flows
- Assessment workflow
- Report generation

---

## 14. Accessibility (A11Y)

- **Keyboard Navigation**: All interactive elements
- **Screen Reader**: ARIA labels, semantic HTML
- **Color Contrast**: WCAG AA compliance
- **Focus Management**: Clear focus indicators
- **Alt Text**: All images and icons

---

## 15. Development Workflow

### Phase 1: Foundation (Week 1)
- [ ] Set up Vite + React + TypeScript
- [ ] Install dependencies (shadcn/ui, React Query, etc.)
- [ ] Configure Tailwind with brand colors
- [ ] Set up routing
- [ ] Implement auth flow
- [ ] Create layout components

### Phase 2: Core Features (Week 2-3)
- [ ] Dashboard
- [ ] Buildings module (list, detail, form)
- [ ] Assessments module (list, detail)

### Phase 3: Advanced Features (Week 4)
- [ ] Conduct assessment interface
- [ ] Deficiencies module
- [ ] Photo upload & management

### Phase 4: Reports & Polish (Week 5)
- [ ] Reports module
- [ ] Settings module
- [ ] PDF/Excel export
- [ ] Performance optimization

### Phase 5: Testing & Launch (Week 6)
- [ ] E2E testing
- [ ] Bug fixes
- [ ] Documentation
- [ ] Deployment setup

---

## 16. Integration Points with API

All API endpoints are ready at `http://localhost:3001/api/v1`

**Authentication**: Include JWT in `Authorization: Bearer <token>` header

**Key Endpoints** (58 total):
- Organizations: 3 endpoints
- Branches: 7 endpoints
- Buildings: 7 endpoints
- Users: 9 endpoints
- Assessments: 14 endpoints
- Uniformat: 3 endpoints
- Deficiencies: 5 endpoints
- Photos: 5 endpoints
- Reports: 5 endpoints

---

## 17. Next Steps

1. **Review brand assets** (colors, fonts, logos, style guide)
2. **Confirm tech stack** choices
3. **Refine UI/UX** decisions based on brand
4. **Create design mockups** (optional) for key pages
5. **Begin implementation** following the plan

---

**Questions to Address:**
1. What are the brand colors (primary, secondary, accent)?
2. What fonts should we use (headings, body)?
3. Do you have a logo/icon set?
4. Any specific UI preferences (minimalist, colorful, corporate)?
5. Target devices (desktop-first vs mobile-first)?
6. Any existing design system or reference apps you like?

Ready to proceed once you share the brand assets! 🎨
