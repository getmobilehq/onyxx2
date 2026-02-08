import { FCI_CATEGORIES } from '../constants/fci.js';

/**
 * Calculate FCI (Facility Condition Index)
 * FCI = (Total Deferred Maintenance / Current Replacement Value) × 100
 */
export function calculateFCI(
  totalDeferredMaintenance: number,
  currentReplacementValue: number
): number {
  if (currentReplacementValue <= 0) return 0;
  return (totalDeferredMaintenance / currentReplacementValue) * 100;
}

/**
 * Calculate RUL (Remaining Useful Life)
 * RUL = (Year Installed + Lifetime Years) - Current Year
 */
export function calculateRUL(yearInstalled: number, lifetimeYears: number): number {
  const currentYear = new Date().getFullYear();
  return yearInstalled + lifetimeYears - currentYear;
}

/**
 * Get FCI category based on FCI value
 */
export function getFCICategory(fci: number): keyof typeof FCI_CATEGORIES {
  if (fci < FCI_CATEGORIES.GOOD.max) return 'GOOD';
  if (fci < FCI_CATEGORIES.FAIR.max) return 'FAIR';
  if (fci < FCI_CATEGORIES.POOR.max) return 'POOR';
  return 'CRITICAL';
}

/**
 * Get FCI color based on FCI value
 */
export function getFCIColor(fci: number): string {
  const category = getFCICategory(fci);
  return FCI_CATEGORIES[category].color;
}
