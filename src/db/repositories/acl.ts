import KnownError from '@libs/error';
import { ResourceType } from '@prisma/client';
import { db, TxClient } from '@src/db';

/**
 * An ACLRepository class provides functionality to manage access control for users and resources.
 * It allows granting, checking, verifying, and revoking access permissions for specified resources.
 */
class ACLRepository {
  /**
   * Grants access to a user for a specific resource by creating an access control entry in the database.
   * @param {number} userId - The ID of the user to whom access is being granted.
   * @param {ResourceType} resourceType - The type of the resource to which access is being granted.
   * @param {number} resourceId - The ID of the resource to which access is being granted.
   * @param {TxClient} [tx] - The transaction client to use for the database operation, defaults to the global database client.
   * @returns {Promise<void>} A promise that resolves when the access has been successfully granted.
   */
  async grantAccess(userId: number, resourceType: ResourceType, resourceId: number, tx: TxClient = db): Promise<void> {
    await tx.aCL.create({
      data: {
        userId,
        resourceType,
        resourceId,
      },
    });
  }

  /**
   * Checks if the user has access to a specific resource.
   * @param {number} userId - The ID of the user whose access is being checked.
   * @param {ResourceType} resourceType - The type of the resource being accessed.
   * @param {number} resourceId - The ID of the resource being accessed.
   * @param {TxClient} [tx] - The transaction client used for database operations, defaults to the global database client.
   * @returns {Promise<boolean>} A promise that resolves to `true` if the user has access to the resource, or `false` otherwise.
   */
  async hasAccess(userId: number, resourceType: ResourceType, resourceId: number, tx: TxClient = db): Promise<boolean> {
    const entity = await tx.aCL.findUnique({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType,
          resourceId,
        },
      },
    });

    return !!entity;
  }

  /**
   * Checks whether a user has access to a specific resource and throws an error if access is denied.
   * @param {number} userId - The unique identifier of the user whose access is being checked.
   * @param {ResourceType} resourceType - The type of the resource being accessed.
   * @param {number} resourceId - The unique identifier of the resource being accessed.
   * @param {TxClient} [tx] - Optional transaction client for database operations.
   * @returns {Promise<void>} Resolves if the user has access, otherwise throws an error.
   */
  async checkAccess(userId: number, resourceType: ResourceType, resourceId: number, tx: TxClient = db): Promise<void> {
    const isAccessGranted = await this.hasAccess(userId, resourceType, resourceId, tx);

    if (!isAccessGranted) {
      throw new KnownError(
        'AccessDenied',
        `User ${userId} does not have access to resource ${resourceType} ${resourceId}`,
      );
    }
  }

  /**
   * Revokes access to a specific resource for a given user.
   * @param {number} userId - The ID of the user whose access is to be revoked.
   * @param {ResourceType} resourceType - The type of resource from which the user's access is to be revoked.
   * @param {number} resourceId - The ID of the resource from which the user's access is to be revoked.
   * @param {TxClient} [tx] - The database transaction client used for executing the query. Defaults to `db`.
   * @returns {Promise<void>} A promise that resolves when the access has been successfully revoked.
   */
  async revokeAccess(userId: number, resourceType: ResourceType, resourceId: number, tx: TxClient = db): Promise<void> {
    await tx.aCL.delete({
      where: {
        userId_resourceType_resourceId: {
          userId,
          resourceType,
          resourceId,
        },
      },
    });
  }
}

export default new ACLRepository();
