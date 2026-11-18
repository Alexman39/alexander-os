import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { getServerEnv } from "./env";

/**
 * One Prisma client per server process (each client owns a connection pool).
 * Reused across hot reloads in development via globalThis.
 */
const globalForDb = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getServerEnv().DATABASE_URL });
  return new PrismaClient({ adapter });
}

export function getDb(): PrismaClient {
  globalForDb.prisma ??= createClient();
  return globalForDb.prisma;
}
