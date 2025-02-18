import { ACL as ACLSpec, Prisma, PrismaClient, ResourceType, User as UserSpec } from '@prisma/client';
import { ITXClientDenyList } from '@prisma/client/runtime/client';

// -----------------------------------------------------------------------------
// Export Prisma and client instance

export const db = new PrismaClient();

export { Prisma };

// -----------------------------------------------------------------------------
// Export enums

export { ResourceType };

// -----------------------------------------------------------------------------
// Export interfaces

export type TxClient = Omit<PrismaClient, ITXClientDenyList>;
interface UserSafeSpec extends Omit<UserSpec, 'password' | 'apiKey'> {}

export { ACLSpec, UserSafeSpec, UserSpec };
