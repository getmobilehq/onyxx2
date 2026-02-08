import { prisma } from '../lib/prisma.js';

export class ReportsService {
  // Building Portfolio Report
  async getBuildingPortfolio(organizationId: string, branchId?: string) {
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (branchId) {
      where.branchId = branchId;
    }

    const buildings = await prisma.building.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            assessments: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { currentFci: 'desc' },
    });

    // Calculate totals
    const totals = buildings.reduce(
      (acc, building) => {
        acc.totalBuildings += 1;
        acc.totalReplacementValue += Number(building.currentReplacementValue || 0);
        acc.totalDeferredMaintenance += Number(building.totalDeferredMaintenance || 0);
        acc.totalSquareFeet += Number(building.grossSquareFeet || 0);
        return acc;
      },
      {
        totalBuildings: 0,
        totalReplacementValue: 0,
        totalDeferredMaintenance: 0,
        totalSquareFeet: 0,
      },
    );

    const portfolioFCI =
      totals.totalReplacementValue > 0
        ? totals.totalDeferredMaintenance / totals.totalReplacementValue
        : 0;

    return {
      buildings,
      summary: {
        ...totals,
        portfolioFCI,
      },
    };
  }

  // Assessment Summary Report
  async getAssessmentSummary(organizationId: string, filters: { status?: string } = {}) {
    const where: any = {
      organizationId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    const assessments = await prisma.assessment.findMany({
      where,
      include: {
        building: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            elements: true,
            assignees: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary by status
    const statusSummary = await prisma.assessment.groupBy({
      by: ['status'],
      where: { organizationId, deletedAt: null },
      _count: true,
    });

    return {
      assessments,
      statusSummary: statusSummary.map((item) => ({
        status: item.status,
        count: item._count,
      })),
    };
  }

  // Deficiency Summary by Priority
  async getDeficiencySummary(organizationId: string, buildingId?: string) {
    const where: any = {
      deletedAt: null,
      assessmentElement: {
        assessment: {
          organizationId,
          deletedAt: null,
        },
      },
    };

    if (buildingId) {
      where.assessmentElement.assessment.buildingId = buildingId;
    }

    // Group by priority
    const deficiencies = await prisma.deficiency.findMany({
      where,
      include: {
        category: true,
        assessmentElement: {
          include: {
            assessment: {
              select: {
                id: true,
                name: true,
                building: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by priority
    const byPriority = deficiencies.reduce(
      (acc, def) => {
        const priority = def.priority;
        if (!acc[priority]) {
          acc[priority] = {
            count: 0,
            totalCost: 0,
            deficiencies: [],
          };
        }
        acc[priority].count += 1;
        acc[priority].totalCost += Number(def.totalCost || 0);
        acc[priority].deficiencies.push(def);
        return acc;
      },
      {} as Record<string, { count: number; totalCost: number; deficiencies: any[] }>,
    );

    // Group by severity
    const bySeverity = deficiencies.reduce(
      (acc, def) => {
        const severity = def.severity;
        if (!acc[severity]) {
          acc[severity] = {
            count: 0,
            totalCost: 0,
          };
        }
        acc[severity].count += 1;
        acc[severity].totalCost += Number(def.totalCost || 0);
        return acc;
      },
      {} as Record<string, { count: number; totalCost: number }>,
    );

    const totalDeficiencies = deficiencies.length;
    const totalCost = deficiencies.reduce((sum, def) => sum + Number(def.totalCost || 0), 0);

    return {
      summary: {
        totalDeficiencies,
        totalCost,
      },
      byPriority,
      bySeverity,
    };
  }

  // Capital Forecast (next 10 years)
  async getCapitalForecast(organizationId: string, branchId?: string) {
    const currentYear = new Date().getFullYear();
    const where: any = {
      deletedAt: null,
      assessmentElement: {
        assessment: {
          organizationId,
          deletedAt: null,
        },
      },
    };

    if (branchId) {
      where.assessmentElement.assessment.branchId = branchId;
    }

    const deficiencies = await prisma.deficiency.findMany({
      where,
      include: {
        assessmentElement: {
          include: {
            assessment: {
              select: {
                building: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Group by target year
    const forecast: Record<number, { year: number; totalCost: number; count: number; items: any[] }> = {};

    deficiencies.forEach((def) => {
      let targetYear = def.targetYear || currentYear;

      // If no target year, estimate based on priority
      if (!def.targetYear) {
        switch (def.priority) {
          case 'immediate':
            targetYear = currentYear;
            break;
          case 'short_term':
            targetYear = currentYear + 2;
            break;
          case 'medium_term':
            targetYear = currentYear + 4;
            break;
          case 'long_term':
            targetYear = currentYear + 7;
            break;
        }
      }

      if (!forecast[targetYear]) {
        forecast[targetYear] = {
          year: targetYear,
          totalCost: 0,
          count: 0,
          items: [],
        };
      }

      forecast[targetYear].totalCost += Number(def.totalCost || 0);
      forecast[targetYear].count += 1;
      forecast[targetYear].items.push({
        id: def.id,
        title: def.title,
        cost: Number(def.totalCost || 0),
        priority: def.priority,
        building: def.assessmentElement.assessment.building.name,
      });
    });

    // Convert to array and sort by year
    const forecastArray = Object.values(forecast)
      .sort((a, b) => a.year - b.year)
      .slice(0, 10); // Next 10 years

    return {
      forecast: forecastArray,
      totalCost: forecastArray.reduce((sum, item) => sum + item.totalCost, 0),
    };
  }

  // Organization Dashboard Stats
  async getDashboardStats(organizationId: string) {
    const [
      totalBuildings,
      totalAssessments,
      totalDeficiencies,
      recentAssessments,
      buildingStats,
    ] = await Promise.all([
      // Total buildings
      prisma.building.count({
        where: { organizationId, deletedAt: null },
      }),

      // Total assessments
      prisma.assessment.count({
        where: { organizationId, deletedAt: null },
      }),

      // Total deficiencies
      prisma.deficiency.count({
        where: {
          assessmentElement: {
            assessment: {
              organizationId,
              deletedAt: null,
            },
          },
          deletedAt: null,
        },
      }),

      // Recent assessments (last 5)
      prisma.assessment.findMany({
        where: { organizationId, deletedAt: null },
        include: {
          building: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),

      // Building value and deferred maintenance totals
      prisma.building.aggregate({
        where: { organizationId, deletedAt: null },
        _sum: {
          currentReplacementValue: true,
          totalDeferredMaintenance: true,
          grossSquareFeet: true,
        },
      }),
    ]);

    const totalReplacementValue = Number(buildingStats._sum.currentReplacementValue || 0);
    const totalDeferredMaintenance = Number(buildingStats._sum.totalDeferredMaintenance || 0);
    const totalSquareFeet = Number(buildingStats._sum.grossSquareFeet || 0);
    const portfolioFCI =
      totalReplacementValue > 0 ? totalDeferredMaintenance / totalReplacementValue : 0;

    return {
      summary: {
        totalBuildings,
        totalAssessments,
        totalDeficiencies,
        totalReplacementValue,
        totalDeferredMaintenance,
        totalSquareFeet,
        portfolioFCI,
      },
      recentAssessments,
    };
  }
}

export const reportsService = new ReportsService();
