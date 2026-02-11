/**
 * Authentication Hook
 * Provides auth utilities and permission checks
 */

import { useAuthStore, getAccessToken } from '../stores/auth.store';
import type { UserRole } from '../types';

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const token = getAccessToken();

  // Permission helpers
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user?.role ? roles.includes(user.role) : false;
  };

  const isOrgAdmin = (): boolean => {
    return user?.role === 'org_admin';
  };

  const isBranchManager = (): boolean => {
    return user?.role === 'branch_manager';
  };

  const isAssessor = (): boolean => {
    return user?.role === 'assessor';
  };

  const isViewer = (): boolean => {
    return user?.role === 'viewer';
  };

  // Check if user can edit assessments
  const canEditAssessments = (): boolean => {
    return hasAnyRole(['org_admin', 'branch_manager', 'assessor']);
  };

  // Check if user can manage users
  const canManageUsers = (): boolean => {
    return hasAnyRole(['org_admin', 'branch_manager']);
  };

  // Check if user can approve assessments
  const canApproveAssessments = (): boolean => {
    return hasAnyRole(['org_admin', 'branch_manager']);
  };

  // Check if user can create/edit buildings
  const canManageBuildings = (): boolean => {
    return hasAnyRole(['org_admin', 'branch_manager']);
  };

  // Check if user can view all branches
  const canViewAllBranches = (): boolean => {
    return isOrgAdmin();
  };

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    clearAuth,
    hasRole,
    hasAnyRole,
    isOrgAdmin,
    isBranchManager,
    isAssessor,
    isViewer,
    canEditAssessments,
    canManageBuildings,
    canManageUsers,
    canApproveAssessments,
    canViewAllBranches,
  };
};
