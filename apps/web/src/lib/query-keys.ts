export const queryKeys = {
  dashboard: ['dashboard'] as const,
  buildings: {
    all: ['buildings'] as const,
    list: (filters: object) => ['buildings', 'list', filters] as const,
    detail: (id: string) => ['buildings', 'detail', id] as const,
    stats: (id: string) => ['buildings', 'stats', id] as const,
    assessments: (id: string) => ['buildings', 'assessments', id] as const,
  },
  branches: {
    all: ['branches'] as const,
    list: () => ['branches', 'list'] as const,
    detail: (id: string) => ['branches', 'detail', id] as const,
  },
  assessments: {
    all: ['assessments'] as const,
    list: (filters: object) => ['assessments', 'list', filters] as const,
    detail: (id: string) => ['assessments', 'detail', id] as const,
    assignees: (id: string) => ['assessments', 'assignees', id] as const,
    elements: (id: string) => ['assessments', 'elements', id] as const,
  },
  elements: {
    all: ['elements'] as const,
    deficiencies: (elementId: string) => ['elements', 'deficiencies', elementId] as const,
  },
  deficiencies: {
    all: ['deficiencies'] as const,
    list: (filters: object) => ['deficiencies', 'list', filters] as const,
    detail: (id: string) => ['deficiencies', 'detail', id] as const,
  },
  uniformat: {
    all: ['uniformat'] as const,
    list: (filters: object) => ['uniformat', 'list', filters] as const,
    groups: ['uniformat', 'groups'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters: object) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
    branches: (id: string) => ['users', 'branches', id] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    detail: (id: string) => ['organizations', 'detail', id] as const,
    stats: (id: string) => ['organizations', 'stats', id] as const,
  },
  photos: {
    all: ['photos'] as const,
    byBuilding: (buildingId: string) => ['photos', 'building', buildingId] as const,
    byElement: (elementId: string) => ['photos', 'element', elementId] as const,
    byDeficiency: (deficiencyId: string) => ['photos', 'deficiency', deficiencyId] as const,
  },
  reports: {
    all: ['reports'] as const,
    portfolio: (filters: object) => ['reports', 'portfolio', filters] as const,
    assessmentSummary: (filters: object) => ['reports', 'assessment-summary', filters] as const,
    deficiencySummary: (filters: object) => ['reports', 'deficiency-summary', filters] as const,
    capitalForecast: (filters: object) => ['reports', 'capital-forecast', filters] as const,
  },
};
