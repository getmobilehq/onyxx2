import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma query');
  });
}

prisma.$on('error', (e) => {
  logger.error({ message: e.message }, 'Prisma error');
});

prisma.$on('warn', (e) => {
  logger.warn({ message: e.message }, 'Prisma warning');
});

export { prisma };
