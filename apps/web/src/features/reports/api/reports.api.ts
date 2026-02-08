import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../lib/api-client';
import { queryKeys } from '../../../lib/query-keys';
import type {
  PortfolioReport,
  AssessmentSummaryReport,
  DeficiencySummaryReport,
  CapitalForecastReport,
} from '../../../types';

// ============================================
// API FUNCTIONS
// ============================================

export const reportsApi = {
  getPortfolio: async (params: { branchId?: string } = {}): Promise<PortfolioReport> => {
    const { data } = await apiClient.get('/reports/building-portfolio', { params });
    return data;
  },

  getAssessmentSummary: async (params: { status?: string } = {}): Promise<AssessmentSummaryReport> => {
    const { data } = await apiClient.get('/reports/assessment-summary', { params });
    return data;
  },

  getDeficiencySummary: async (params: { buildingId?: string } = {}): Promise<DeficiencySummaryReport> => {
    const { data } = await apiClient.get('/reports/deficiency-summary', { params });
    return data;
  },

  getCapitalForecast: async (params: { branchId?: string } = {}): Promise<CapitalForecastReport> => {
    const { data } = await apiClient.get('/reports/capital-forecast', { params });
    return data;
  },
};

// ============================================
// REACT QUERY HOOKS
// ============================================

export const usePortfolioReport = (filters: { branchId?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.portfolio(filters),
    queryFn: () => reportsApi.getPortfolio(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAssessmentSummaryReport = (filters: { status?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.assessmentSummary(filters),
    queryFn: () => reportsApi.getAssessmentSummary(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDeficiencySummaryReport = (filters: { buildingId?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.deficiencySummary(filters),
    queryFn: () => reportsApi.getDeficiencySummary(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCapitalForecastReport = (filters: { branchId?: string } = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.capitalForecast(filters),
    queryFn: () => reportsApi.getCapitalForecast(filters),
    staleTime: 1000 * 60 * 5,
  });
};
