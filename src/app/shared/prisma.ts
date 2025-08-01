import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient({
  transactionOptions: { maxWait: 10000, timeout: 10000 },
});

prisma.$use(async (params: any, next: any) => {
  console.log(`[Prisma] Model: ${params.model}, Action: ${params.action}`);
  try {
    const result = await next(params);
    return result;
  } catch (error) {
    console.error(`[Prisma] Error in ${params.model}.${params.action}:`, error);
    throw error;
  }
});

export default prisma;
