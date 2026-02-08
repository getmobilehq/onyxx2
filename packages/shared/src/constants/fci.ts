// FCI (Facility Condition Index) Categories
export const FCI_CATEGORIES = {
  GOOD: { min: 0, max: 5, label: 'Good', color: '#22C55E' },
  FAIR: { min: 5, max: 10, label: 'Fair', color: '#EAB308' },
  POOR: { min: 10, max: 30, label: 'Poor', color: '#F97316' },
  CRITICAL: { min: 30, max: 100, label: 'Critical', color: '#EF4444' },
} as const;

// Condition Ratings (1-5 scale)
export const CONDITION_RATINGS = {
  1: { label: 'Failed/Critical', description: 'Replace immediately', color: '#EF4444' },
  2: { label: 'Poor', description: 'Replace within 1-2 years', color: '#F97316' },
  3: { label: 'Fair', description: 'Repair/replace 3-5 years', color: '#EAB308' },
  4: { label: 'Good', description: 'Minor maintenance', color: '#84CC16' },
  5: { label: 'Excellent', description: 'New or like-new', color: '#22C55E' },
} as const;
