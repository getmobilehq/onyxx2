/**
 * Onyx Report - Brand Icon Components
 * 
 * This file exports all brand icons as React components for easy import.
 * Usage: import { OnyxLogo, OnyxMark, FCIGood } from './OnyxIcons';
 */

import React from 'react';

// ============================================
// LOGO COMPONENTS
// ============================================

/**
 * Full Onyx Report logo with mark and wordmark
 * @param {object} props - className, width, height, variant ('color' | 'dark' | 'white')
 */
export const OnyxLogo = ({ className = '', width = 280, height = 64, variant = 'color' }) => {
  const getColors = () => {
    switch (variant) {
      case 'white':
        return { bg: 'url(#onyx-gradient-white)', text1: '#FFFFFF', text2: '#FFFFFF' };
      case 'dark':
        return { bg: '#0F172A', text1: '#0F172A', text2: '#0F172A' };
      default:
        return { bg: 'url(#onyx-gradient)', text1: '#0F172A', text2: '#2563EB' };
    }
  };

  const colors = getColors();

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 280 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="onyx-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
          <stop offset="100%" style={{ stopColor: '#1D4ED8' }} />
        </linearGradient>
        <linearGradient id="onyx-gradient-white" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#60A5FA' }} />
          <stop offset="100%" style={{ stopColor: '#3B82F6' }} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill={colors.bg} />
      <path d="M32 14L46 32L32 50L18 32L32 14Z" fill="white" />
      <path d="M32 18L42 32L32 46L22 32L32 18Z" fill={colors.bg} opacity="0.15" />
      <path d="M32 14L46 32L32 26L18 32L32 14Z" fill="white" opacity="0.3" />
      <text x="76" y="38" fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif" fontSize="28" fontWeight="700" fill={colors.text1} letterSpacing="-0.02em">ONYX</text>
      <text x="160" y="38" fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif" fontSize="28" fontWeight="700" fill={colors.text2} letterSpacing="-0.02em">REPORT</text>
    </svg>
  );
};

/**
 * Onyx Report logo mark only (diamond in rounded square)
 * @param {object} props - className, size, variant ('color' | 'dark' | 'white')
 */
export const OnyxMark = ({ className = '', size = 64, variant = 'color' }) => {
  const getColors = () => {
    switch (variant) {
      case 'white':
        return { bg: '#FFFFFF', diamond: '#0F172A' };
      case 'dark':
        return { bg: '#0F172A', diamond: '#FFFFFF' };
      default:
        return { bg: 'url(#mark-gradient)', diamond: '#FFFFFF' };
    }
  };

  const colors = getColors();

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#3B82F6' }} />
          <stop offset="100%" style={{ stopColor: '#1D4ED8' }} />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill={colors.bg} />
      <path d="M32 14L46 32L32 50L18 32L32 14Z" fill={colors.diamond} />
      <path d="M32 18L42 32L32 46L22 32L32 18Z" fill={colors.bg} opacity="0.15" />
      <path d="M32 14L46 32L32 26L18 32L32 14Z" fill={colors.diamond} opacity="0.3" />
    </svg>
  );
};

/**
 * Diamond icon only (no background)
 * @param {object} props - className, size, color
 */
export const DiamondIcon = ({ className = '', size = 24, color = '#2563EB' }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M12 2L22 12L12 22L2 12L12 2Z" fill={color} />
    <path d="M12 5L19 12L12 19L5 12L12 5Z" fill="white" opacity="0.15" />
    <path d="M12 2L22 12L12 8L2 12L12 2Z" fill="white" opacity="0.25" />
  </svg>
);

// ============================================
// FCI CONDITION ICONS
// ============================================

/**
 * FCI Good condition indicator (0-5%)
 */
export const FCIGood = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" fill="#ECFDF5" stroke="#10B981" strokeWidth="2" />
    <path d="M8 12L11 15L16 9" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * FCI Fair condition indicator (5-10%)
 */
export const FCIFair = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" />
    <path d="M12 8V12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="#F59E0B" />
  </svg>
);

/**
 * FCI Poor condition indicator (10-30%)
 */
export const FCIPoor = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" fill="#FFF7ED" stroke="#F97316" strokeWidth="2" />
    <path d="M12 8V13" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="16" r="1" fill="#F97316" />
  </svg>
);

/**
 * FCI Critical condition indicator (30%+)
 */
export const FCICritical = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="10" fill="#FEF2F2" stroke="#EF4444" strokeWidth="2" />
    <path d="M15 9L9 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 9L15 15" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Get FCI icon by condition value
 * @param {number} fci - FCI percentage value
 * @returns {React.Component} - Appropriate FCI icon component
 */
export const getFCIIcon = (fci) => {
  if (fci <= 5) return FCIGood;
  if (fci <= 10) return FCIFair;
  if (fci <= 30) return FCIPoor;
  return FCICritical;
};

/**
 * Get FCI color by condition value
 * @param {number} fci - FCI percentage value
 * @returns {string} - Hex color code
 */
export const getFCIColor = (fci) => {
  if (fci <= 5) return '#10B981';
  if (fci <= 10) return '#F59E0B';
  if (fci <= 30) return '#F97316';
  return '#EF4444';
};

/**
 * Get FCI label by condition value
 * @param {number} fci - FCI percentage value
 * @returns {string} - Condition label
 */
export const getFCILabel = (fci) => {
  if (fci <= 5) return 'Good';
  if (fci <= 10) return 'Fair';
  if (fci <= 30) return 'Poor';
  return 'Critical';
};

// ============================================
// ROLE ICONS
// ============================================

/**
 * Org Admin role icon
 */
export const RoleOrgAdmin = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 6V11C4 15.52 7.13 19.74 12 21C16.87 19.74 20 15.52 20 11V6L12 2Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8L13.09 10.26L15.5 10.64L13.75 12.34L14.18 14.73L12 13.56L9.82 14.73L10.25 12.34L8.5 10.64L10.91 10.26L12 8Z" fill="#2563EB" />
  </svg>
);

/**
 * Branch Manager role icon
 */
export const RoleBranchManager = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3 21H21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 21V7L12 3L19 7V21" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#DBEAFE" />
    <circle cx="12" cy="11" r="2" stroke="#2563EB" strokeWidth="2" />
    <path d="M9 21V17C9 15.89 9.89 15 11 15H13C14.11 15 15 15.89 15 17V21" stroke="#2563EB" strokeWidth="2" />
  </svg>
);

/**
 * Field Assessor role icon
 */
export const RoleAssessor = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M9 5H7C5.89 5 5 5.89 5 7V19C5 20.11 5.89 21 7 21H17C18.11 21 19 20.11 19 19V7C19 5.89 18.11 5 17 5H15" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#DBEAFE" />
    <rect x="9" y="3" width="6" height="4" rx="1" stroke="#2563EB" strokeWidth="2" fill="white" />
    <path d="M9 14L11 16L15 12" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Viewer role icon
 */
export const RoleViewer = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke="#2563EB" strokeWidth="2" fill="white" />
  </svg>
);

/**
 * Get role icon by role name
 * @param {string} role - Role name ('org_admin' | 'branch_manager' | 'assessor' | 'viewer')
 * @returns {React.Component} - Role icon component
 */
export const getRoleIcon = (role) => {
  switch (role) {
    case 'org_admin': return RoleOrgAdmin;
    case 'branch_manager': return RoleBranchManager;
    case 'assessor': return RoleAssessor;
    case 'viewer': return RoleViewer;
    default: return RoleViewer;
  }
};

// ============================================
// UI ICONS
// ============================================

/**
 * Loading spinner with brand colors
 */
export const Spinner = ({ className = '', size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`animate-spin ${className}`}>
    <circle cx="12" cy="12" r="10" stroke="#E2E8F0" strokeWidth="2" fill="none" />
    <path d="M12 2A10 10 0 0 1 22 12" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" fill="none" />
  </svg>
);

// ============================================
// BRAND COLORS EXPORT
// ============================================

export const brandColors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  slate: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  fci: {
    good: '#10B981',
    fair: '#F59E0B',
    poor: '#F97316',
    critical: '#EF4444',
  },
  semantic: {
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
  },
};

export default {
  OnyxLogo,
  OnyxMark,
  DiamondIcon,
  FCIGood,
  FCIFair,
  FCIPoor,
  FCICritical,
  getFCIIcon,
  getFCIColor,
  getFCILabel,
  RoleOrgAdmin,
  RoleBranchManager,
  RoleAssessor,
  RoleViewer,
  getRoleIcon,
  Spinner,
  brandColors,
};
