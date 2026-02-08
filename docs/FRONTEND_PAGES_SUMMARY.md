# Onyx Report - Frontend Pages Summary

## Public Pages (No Auth Required)

### 1. Login Page (`/login`)
- Login form (email, password)
- "Forgot password?" link
- Brand logo & tagline

### 2. Signup Page (`/signup`)
- Signup form (name, email, password)
- Organization creation
- "Already have account?" link

### 3. Forgot Password (`/forgot-password`)
- Email input
- Send reset link

### 4. Reset Password (`/reset-password/:token`)
- New password form
- Confirm password

### 5. Accept Invite (`/accept-invite/:token`)
- Set password for invited user
- Complete profile

---

## Protected Pages (Requires Auth)

## Core Application

### 6. Dashboard (`/`)
**Role**: All
**Components**:
- 4 Stat Cards (Buildings, Assessments, Deficiencies, Portfolio FCI)
- Recent Assessments Table (last 5)
- Portfolio FCI Trend Chart
- Deficiencies by Priority Pie Chart
- Quick Action Buttons

---

## Buildings Module

### 7. Buildings List (`/buildings`)
**Role**: All
**Components**:
- Page Header (title, "New Building" button)
- Search & Filters (branch, FCI range)
- Data Table with columns:
  - Name
  - Code
  - Branch
  - Type
  - Square Feet
  - FCI (with badge color)
  - Last Assessment Date
  - Actions (View, Edit, Delete, Create Assessment)
- Pagination

### 8. Building Detail (`/buildings/:id`)
**Role**: All
**Tabs**:
1. **Overview**
   - Building Info Card
   - Photo Gallery (up to 3 photos)
   - Key Metrics (FCI, Replacement Value, Total Deferred Maintenance)
   - Location Map (optional)

2. **Assessments**
   - Assessments Table
   - Filter by status
   - "Create Assessment" button

3. **Maintenance History**
   - Timeline of deficiencies
   - Grouped by year

4. **Photos**
   - Photo grid
   - Upload more photos
   - Lightbox view

### 9. Create/Edit Building (`/buildings/new`, `/buildings/:id/edit`)
**Role**: org_admin, branch_manager
**Form Fields**:
- General Info (name, code, branch, description)
- Address (line 1, line 2, city, state, zip, country)
- Details (type, year built, floors, square feet)
- Financial (current replacement value)
- Photo Upload (up to 3)
- Save/Cancel buttons

---

## Assessments Module

### 10. Assessments List (`/assessments`)
**Role**: All
**Components**:
- Page Header (title, "New Assessment" button)
- Status Filter Tabs (All, Draft, In Progress, Submitted, Approved)
- Data Table with columns:
  - Name
  - Building
  - Branch
  - Status Badge
  - Progress Bar (completed/total elements)
  - Assignees (avatars)
  - Due Date
  - Actions (View, Start, Submit, Approve, Reject)
- Pagination

### 11. Assessment Detail (`/assessments/:id`)
**Role**: All
**Tabs**:
1. **Overview**
   - Assessment Info Card
   - Workflow Status Timeline (Draft → In Progress → Submitted → Approved)
   - Key Metrics (Total Elements, Completed, Total Deficiencies, Total Cost)
   - Assignees Section
   - Action Buttons (based on status & role)

2. **Elements**
   - Elements Table with columns:
     - Uniformat Code
     - System Name
     - Condition Rating
     - Status
     - Deficiencies Count
     - Actions
   - Filter by system group, status

3. **Deficiencies**
   - Deficiencies Table
   - Filter by priority, severity
   - Total cost summary

4. **Photos**
   - Photo gallery
   - Grouped by element/deficiency

5. **Activity Log**
   - Audit trail of changes
   - User, action, timestamp

### 12. Create Assessment (`/assessments/new`)
**Role**: org_admin, branch_manager
**Form**:
- Select Building (dropdown)
- Assessment Name
- Description
- Target Completion Date
- Assign Users (multi-select)
- Add Uniformat Elements (multi-select)
- Save as Draft

### 13. Conduct Assessment (`/assessments/:id/conduct`)
**Role**: org_admin, branch_manager, assessor
**Layout**:
- **Left Sidebar**: Element list with progress indicators
- **Main Area**: Selected element assessment form
  - Uniformat Code & Name
  - Condition Rating (1-5 stars)
  - Quantity, Unit of Measure, Cost per Unit
  - Observations (rich text)
  - Photo Upload
  - "Add Deficiency" button
  - "Save & Next" button

**Deficiency Modal**:
- Title, Description
- Category (dropdown)
- Priority, Severity (dropdowns)
- Estimated Cost, Quantity, Unit
- Recommended Action
- Target Year
- Photo Upload
- Save button

---

## Deficiencies Module

### 14. Deficiencies List (`/deficiencies`)
**Role**: All
**Components**:
- Page Header
- Priority Filter Tabs (All, Immediate, Short-term, Medium-term, Long-term)
- Severity Filters
- Data Table with columns:
  - Title
  - Building
  - Assessment
  - Priority Badge
  - Severity Badge
  - Total Cost
  - Target Year
  - Actions (View, Edit, Delete)
- Total Cost Summary
- Pagination

### 15. Deficiency Detail (`/deficiencies/:id`)
**Role**: All
**Sections**:
- Deficiency Info Card
- Context (Building, Assessment, Element)
- Cost Breakdown
- Recommended Action
- Photo Gallery
- Edit/Delete buttons (based on role)

---

## Reports Module

### 16. Reports Hub (`/reports`)
**Role**: All
**Layout**:
- 4 Report Cards with descriptions:
  1. Building Portfolio Report
  2. Assessment Summary
  3. Deficiency Analysis
  4. 10-Year Capital Forecast
- Click to navigate to detailed report

### 17. Building Portfolio Report (`/reports/portfolio`)
**Role**: All
**Components**:
- Branch Filter (dropdown)
- Portfolio Summary Cards:
  - Total Buildings
  - Total Replacement Value
  - Total Deferred Maintenance
  - Portfolio FCI (gauge chart)
- Buildings Table (sorted by FCI)
- FCI Distribution Chart (bar chart)
- Export Buttons (PDF, Excel)

### 18. Assessment Summary Report (`/reports/assessment-summary`)
**Role**: All
**Components**:
- Status Filter
- Status Summary Cards (count per status)
- Assessments Table
- Completion Trend Chart (line chart)
- Export Buttons

### 19. Deficiency Analysis Report (`/reports/deficiency-summary`)
**Role**: All
**Components**:
- Building Filter
- Summary Cards:
  - Total Deficiencies
  - Total Cost
  - Average Cost
- Priority Distribution (pie chart)
- Severity Distribution (pie chart)
- Deficiencies by Building (bar chart)
- Export Buttons

### 20. Capital Forecast Report (`/reports/capital-forecast`)
**Role**: All
**Components**:
- Branch Filter
- 10-Year Forecast Chart (bar chart)
- Year-by-Year Table with:
  - Year
  - Number of Items
  - Total Cost
  - Priority Breakdown
- Export Buttons

---

## Settings Module

### 21. Settings Hub (`/settings`)
**Role**: All
**Layout**:
- Sidebar navigation:
  - Profile
  - Organization (admin only)
  - Branches (admin only)
  - Users (admin only)
- Content area based on selected section

### 22. Profile Settings (`/settings/profile`)
**Role**: All
**Form**:
- Avatar Upload
- First Name, Last Name
- Email (read-only)
- Phone
- Password Change section
- Preferences:
  - Email Notifications
  - Theme (Light/Dark)
- Save button

### 23. Organization Settings (`/settings/organization`)
**Role**: org_admin only
**Sections**:
- Organization Info (name, slug)
- Subscription Details (tier, status, limits)
- Billing Info
- Save button

### 24. Branch Management (`/settings/branches`)
**Role**: org_admin only
**Components**:
- "New Branch" button
- Branches Table:
  - Name
  - Code
  - Address
  - Buildings Count
  - Users Count
  - Actions (Edit, Delete)
- Create/Edit Branch Modal

### 25. User Management (`/settings/users`)
**Role**: org_admin only
**Components**:
- "Invite User" button
- Users Table:
  - Name
  - Email
  - Role
  - Status (Active/Inactive)
  - Last Login
  - Actions (Edit Role, Assign Branches, Deactivate)
- Invite User Modal (email, role, branches)
- Edit User Modal (role, branches)

---

## Component Count Summary

**Total Pages**: 25
- Public: 5
- Protected: 20

**Key Reusable Components** (~40):
1. **UI** (15): Button, Input, Select, Card, Badge, Dialog, Table, Tabs, etc.
2. **Layout** (4): AppShell, Sidebar, Header, Breadcrumbs
3. **Forms** (8): FormField, SearchInput, DatePicker, FileUpload, MultiSelect, etc.
4. **Data Display** (8): DataTable, StatsCard, ChartCard, Timeline, PhotoGallery, etc.
5. **Feedback** (5): LoadingSpinner, EmptyState, ErrorBoundary, Toast, ProgressBar

**Estimated Development Time**: 5-6 weeks
- Week 1: Setup + Auth + Layout
- Week 2: Dashboard + Buildings
- Week 3: Assessments (List + Detail)
- Week 4: Conduct Assessment + Deficiencies
- Week 5: Reports + Settings
- Week 6: Testing + Polish

---

**Ready for Brand Asset Integration!** 🎨

Once you provide the brand assets (colors, fonts, logos), we can:
1. Configure Tailwind theme
2. Set up shadcn/ui with brand colors
3. Create branded components
4. Begin development
