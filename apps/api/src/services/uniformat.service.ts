import { prisma } from '../lib/prisma.js';

export class UniformatService {
  async list(systemGroup?: string) {
    return prisma.uniformatElement.findMany({
      where: {
        isActive: true,
        ...(systemGroup && { systemGroup }),
      },
      orderBy: [{ systemGroup: 'asc' }, { sortOrder: 'asc' }, { code: 'asc' }],
    });
  }

  async getSystemGroups() {
    const groups = await prisma.uniformatElement.groupBy({
      by: ['systemGroup'],
      where: { isActive: true },
      _count: { code: true },
    });

    return groups.map((g) => ({
      systemGroup: g.systemGroup,
      count: g._count.code,
    }));
  }

  async getByCode(code: string) {
    return prisma.uniformatElement.findUnique({
      where: { code },
    });
  }
}

export const uniformatService = new UniformatService();
