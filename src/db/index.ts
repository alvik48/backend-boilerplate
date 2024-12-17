import { ACL as ACLSpec, PrismaClient, User as UserSpec } from '@prisma/client';

// Prisma client instance
export const db = new PrismaClient();

// Export interfaces
interface UserSafeSpec extends Omit<UserSpec, 'password' | 'apiKey'> {}

export { ACLSpec, UserSafeSpec, UserSpec };
