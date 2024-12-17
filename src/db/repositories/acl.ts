import KnownError from '@libs/error';
import { ResourceType } from '@prisma/client';
import { db } from '@src/db';

/**
 * An ACLRepository class provides functionality to manage access control for users and resources.
 * It allows granting, checking, verifying, and revoking access permissions for specified resources.
 */
class ACLRepository {
  /**
   * Grants access to a user for a specific resource.
   * @param {number} userId - The ID of the user being granted access.
   * @param {ResourceType} resourceType - The type of the resource the user is being granted access to.
   * @param {number} resourceId - The ID of the specific resource being accessed.
   * @returns {Promise<void>} A promise that resolves when the access is successfully granted.
   */
  async grantAccess(userId: number, resourceType: ResourceType, resourceId: number): Promise<void> {
    await db.aCL.create({
      data: {
        userId,
        resourceType,
        resourceId,
      },
    });
  }

  /**
   * Determines whether a user has access to a specified resource.
   * @param {number} userId - The ID of the user whose access is being checked.
   * @param {ResourceType} resourceType - The type of the resource to check access for.
   * @param {number} resourceId - The ID of the resource to check access for.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user has access to the resource.
   */
  async hasAccess(userId: number, resourceType: ResourceType, resourceId: number): Promise<boolean> {
    const entity = await db.aCL.findUnique({
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
   * Checks whether a user has access to a specific resource. If access is denied, throws an error.
   * @param {number} userId - The ID of the user whose access is being checked.
   * @param {ResourceType} resourceType - The type of the resource being accessed.
   * @param {number} resourceId - The ID of the resource being accessed.
   * @returns {Promise<void>} Resolves if access has being granted, otherwise throws an error.
   */
  async checkAccess(userId: number, resourceType: ResourceType, resourceId: number): Promise<void> {
    const isAccessGranted = await this.hasAccess(userId, resourceType, resourceId);

    if (!isAccessGranted) {
      throw new KnownError(
        'AccessDenied',
        `User ${userId} does not have access to resource ${resourceType} ${resourceId}`,
      );
    }
  }

  /**
   * Revokes access for a specific user to a particular resource.
   * @param {number} userId - The unique identifier of the user whose access will be revoked.
   * @param {ResourceType} resourceType - The type of resource for which access is being revoked.
   * @param {number} resourceId - The unique identifier of the resource for which access is being revoked.
   * @returns {Promise<void>} A promise that resolves when the access has been successfully revoked.
   */
  async revokeAccess(userId: number, resourceType: ResourceType, resourceId: number): Promise<void> {
    await db.aCL.delete({
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
