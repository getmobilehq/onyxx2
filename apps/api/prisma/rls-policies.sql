-- ============================================
-- Supabase Row-Level Security Policies
-- Run via Supabase Dashboard SQL Editor or psql
-- ============================================
-- These policies are defense-in-depth. The Express API
-- uses a direct connection (postgres role) that bypasses RLS.
-- RLS protects against direct Supabase client access.
-- ============================================

-- Helper function: extract organizationId from JWT app_metadata
CREATE OR REPLACE FUNCTION auth.organization_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organizationId')::uuid
$$;

-- Helper function: extract role from JWT app_metadata
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt() -> 'app_metadata' ->> 'role'
$$;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE deficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS
-- ============================================

CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (id = auth.organization_id());

-- ============================================
-- USERS
-- ============================================

CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Org admins can manage users in their organization"
  ON users FOR ALL
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() = 'org_admin'
  );

-- ============================================
-- BRANCHES
-- ============================================

CREATE POLICY "Users can view branches in their organization"
  ON branches FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins and managers can manage branches"
  ON branches FOR ALL
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('org_admin', 'branch_manager')
  );

-- ============================================
-- BUILDINGS
-- ============================================

CREATE POLICY "Users can view buildings in their organization"
  ON buildings FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Admins and managers can manage buildings"
  ON buildings FOR ALL
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('org_admin', 'branch_manager')
  );

-- ============================================
-- ASSESSMENTS
-- ============================================

CREATE POLICY "Users can view assessments in their organization"
  ON assessments FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Authorized users can manage assessments"
  ON assessments FOR ALL
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('org_admin', 'branch_manager', 'assessor')
  );

-- ============================================
-- PHOTOS
-- ============================================

CREATE POLICY "Users can view photos in their organization"
  ON photos FOR SELECT
  USING (organization_id = auth.organization_id());

CREATE POLICY "Authorized users can manage photos"
  ON photos FOR ALL
  USING (
    organization_id = auth.organization_id()
    AND auth.user_role() IN ('org_admin', 'branch_manager', 'assessor')
  );

-- ============================================
-- AUDIT_LOGS (read-only for users)
-- ============================================

CREATE POLICY "Users can view audit logs in their organization"
  ON audit_logs FOR SELECT
  USING (organization_id = auth.organization_id());

-- ============================================
-- USER_BRANCHES (cascade via users)
-- ============================================

CREATE POLICY "Users can view user-branch assignments in their org"
  ON user_branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = user_branches.user_id
      AND users.organization_id = auth.organization_id()
    )
  );

-- ============================================
-- ASSESSMENT_ASSIGNEES (cascade via assessments)
-- ============================================

CREATE POLICY "Users can view assessment assignees in their org"
  ON assessment_assignees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_assignees.assessment_id
      AND assessments.organization_id = auth.organization_id()
    )
  );

-- ============================================
-- ASSESSMENT_ELEMENTS (cascade via assessments)
-- ============================================

CREATE POLICY "Users can view assessment elements in their org"
  ON assessment_elements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_elements.assessment_id
      AND assessments.organization_id = auth.organization_id()
    )
  );

CREATE POLICY "Authorized users can manage assessment elements"
  ON assessment_elements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessments
      WHERE assessments.id = assessment_elements.assessment_id
      AND assessments.organization_id = auth.organization_id()
    )
    AND auth.user_role() IN ('org_admin', 'branch_manager', 'assessor')
  );

-- ============================================
-- DEFICIENCIES (cascade via assessment_elements -> assessments)
-- ============================================

CREATE POLICY "Users can view deficiencies in their org"
  ON deficiencies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM assessment_elements
      JOIN assessments ON assessments.id = assessment_elements.assessment_id
      WHERE assessment_elements.id = deficiencies.assessment_element_id
      AND assessments.organization_id = auth.organization_id()
    )
  );

CREATE POLICY "Authorized users can manage deficiencies"
  ON deficiencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM assessment_elements
      JOIN assessments ON assessments.id = assessment_elements.assessment_id
      WHERE assessment_elements.id = deficiencies.assessment_element_id
      AND assessments.organization_id = auth.organization_id()
    )
    AND auth.user_role() IN ('org_admin', 'branch_manager', 'assessor')
  );

-- ============================================
-- SYNC_QUEUE (user's own items)
-- ============================================

CREATE POLICY "Users can view their own sync queue items"
  ON sync_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = sync_queue.user_id
      AND users.organization_id = auth.organization_id()
    )
  );

-- ============================================
-- REFERENCE DATA (public read, no org scope)
-- ============================================

ALTER TABLE uniformat_elements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read uniformat elements"
  ON uniformat_elements FOR SELECT
  USING (true);

ALTER TABLE deficiency_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read deficiency categories"
  ON deficiency_categories FOR SELECT
  USING (true);
