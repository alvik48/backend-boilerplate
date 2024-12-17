import { randomBytes } from 'node:crypto';

import KnownError from '@libs/error';
import { Prisma } from '@prisma/client';
import { db, UserSafeSpec, UserSpec } from '@src/db';
import bcrypt from 'bcrypt';

/**
 * UserRepository class provides a set of methods to handle user-related operations in the database.
 *
 * This repository abstracts away the database implementation and facilitates user management,
 * including creating users, retrieving user data by ID or username, updating user information,
 * generating and validating API keys, and retrieving users in safe or full formats.
 *
 * Sensitive fields (e.g., passwords, API keys) are automatically excluded when retrieving user data
 * in the "safe" mode, ensuring secure management of user data.
 */
class UserRepository {
  /* -----------------------------------------------------------------------------
    Properties
  ----------------------------------------------------------------------------- */

  protected readonly safeOmit = {
    omit: {
      password: true,
      apiKey: true,
    },
  };

  /* -----------------------------------------------------------------------------
    Public methods
  ----------------------------------------------------------------------------- */

  /**
   * Creates a new user in the database with the provided data, encrypting the password field before saving.
   * @param {Omit<Prisma.UserCreateInput, 'apiKey'>} data - The information required to create a user, excluding the 'apiKey'.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the created user's safe specification, excluding sensitive fields.
   */
  async create(data: Omit<Prisma.UserCreateInput, 'apiKey'>): Promise<UserSafeSpec> {
    const encryptedPassword = await this.encrypt(data.password);

    return db.user.create({
      data: {
        ...data,
        password: encryptedPassword,
      },
      ...this.safeOmit,
    });
  }

  /**
   * Retrieves a user by their unique ID.
   * @param {number} id - The unique identifier of the user to retrieve.
   * @param {boolean} [safe] - Determines whether to retrieve the user data in a safe mode (true) or full mode (false).
   * @returns {Promise} A promise resolving to the user data, either in safe mode or full mode depending on the `safe` parameter.
   */
  async getById<T extends boolean>(id: number, safe: T = true as T): Promise<T extends true ? UserSafeSpec : UserSpec> {
    return this.getUnique({ id }, safe);
  }

  /**
   * Retrieves a single user entity by the provided username.
   * The returned user object format depends on the `safe` parameter.
   * @param {string} username - The username of the user to retrieve.
   * @param {boolean} [safe] - Specifies whether to fetch the user in a safe format. If true, sensitive information will be excluded.
   * @returns {Promise} A promise that resolves to the user entity. The format of the returned user depends on the `safe` parameter.
   */
  async getByUsername<T extends boolean>(
    username: string,
    safe: T = true as T,
  ): Promise<T extends true ? UserSafeSpec : UserSpec> {
    return this.getUnique({ username }, safe);
  }

  /**
   * Updates a user's information in the database.
   * @param {number} id - The unique identifier of the user to update.
   * @param {Prisma.UserUpdateInput} data - The data object containing fields to be updated.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the updated user data with safe fields omitted.
   */
  async update(id: number, data: Prisma.UserUpdateInput): Promise<UserSafeSpec> {
    if (data.password) {
      data.password = await this.encrypt(data.password as string);
    }

    return db.user.update({
      where: { id },
      data,
      ...this.safeOmit,
    });
  }

  /**
   * Updates the API key for a user by generating a new key, storing the
   * encrypted version in the database, and returning the plain API key.
   * @param {number} id - The unique identifier of the user whose API key needs to be updated.
   * @returns {Promise<string>} - A promise that resolves to the newly generated API key.
   */
  async updateApiKey(id: number): Promise<string> {
    const { apiKey, encryptedApiKey } = await this.createApiKey();

    await db.user.update({
      where: { id },
      data: {
        apiKey: encryptedApiKey,
      },
    });

    return apiKey;
  }

  /**
   * Validates the provided user credentials by checking their correctness.
   * @param {string} username - The username to validate.
   * @param {string} password - The password corresponding to the username.
   * @returns {Promise<void>} Resolves if the credentials are valid, otherwise throws an error.
   */
  async getByCredentials(username: string, password: string): Promise<UserSafeSpec> {
    const { password: encryptedPassword, apiKey, ...user } = await this.getByUsername(username, false);
    const areCredentialsValid = await bcrypt.compare(password, encryptedPassword);

    if (!areCredentialsValid) {
      throw new KnownError('UserCredentialsNotValid');
    }

    return user;
  }

  /**
   * Validates if the provided API composite key is valid.
   *
   * The composite key is expected to be in the format `userId:apiKey`.
   * The method splits the composite key into `userId` and `apiKey`, verifies the user exists,
   * and ensures the provided `apiKey` matches the hashed API key stored for the user.
   * @param {string} compositeKey - A string containing the user ID and API key separated by a colon.
   * @returns {Promise<boolean>} A promise that resolves to true if the composite key is valid, otherwise false.
   * @throws {KnownError} Throws 'UserNotFound' if no user is found with the given ID.
   * @throws {KnownError} Throws 'AccessDenied' if the user does not have an API key.
   */
  async isApiCompositeKeyValid(compositeKey: string): Promise<boolean> {
    const [userId, apiKey] = compositeKey.split(':');

    const user = await db.user.findUnique({
      where: { id: Number(userId) },
      select: { apiKey: true },
    });

    if (!user) {
      throw new KnownError('UserNotFound');
    }

    if (!user.apiKey) {
      throw new KnownError('AccessDenied');
    }

    return bcrypt.compare(apiKey, user.apiKey);
  }

  /**
   * Validates the provided composite API key by checking its validity.
   * @param {string} compositeKey - The composite API key to be validated.
   * @returns {Promise<void>} A promise that resolves if the API key is valid, or rejects with an error if it is invalid.
   */
  async validateCompositeApiKey(compositeKey: string): Promise<void> {
    const isValid = await this.isApiCompositeKeyValid(compositeKey);

    if (!isValid) {
      throw new KnownError('UserApiTokenNotValid');
    }
  }

  /* -----------------------------------------------------------------------------
    Protected methods
  ----------------------------------------------------------------------------- */

  /**
   * Generates a new API key and provides its encrypted counterpart.
   *
   * The method creates a random API key and encrypts it using a hash function.
   * @returns {Promise<{ apiKey: string, encryptedApiKey: string }>} A promise that resolves to an object containing the plain API key and its encrypted version.
   */
  protected async createApiKey(): Promise<{ apiKey: string; encryptedApiKey: string }> {
    const apiKey = randomBytes(32).toString('hex');
    const encryptedApiKey = await this.encrypt(apiKey);

    return { apiKey, encryptedApiKey };
  }

  /**
   * Encrypts the given input string using the bcrypt hashing algorithm.
   * @param {string} input - The input string to be encrypted.
   * @returns {Promise<string>} A promise that resolves to the encrypted hash of the input string.
   */
  protected async encrypt(input: string): Promise<string> {
    return bcrypt.hash(input, 10);
  }

  /**
   * Retrieves a unique user from the database based on the specified criteria.
   * @param {Prisma.UserWhereUniqueInput} where - The condition to identify the unique user in the database.
   * @param {boolean} [safe] - A flag indicating whether to retrieve a safe version of the user or the full user.
   * @returns {Promise} A promise that resolves with the unique user object, either in a safe or full specification, based on the safe flag.
   */
  protected async getUnique<T extends boolean>(
    where: Prisma.UserWhereUniqueInput,
    safe: T = true as T,
  ): Promise<T extends true ? UserSafeSpec : UserSpec> {
    const user = await db.user.findUnique({
      where,
      ...(safe ? this.safeOmit : {}),
    });

    if (!user) {
      throw new KnownError('UserNotFound');
    }

    return user;
  }
}

export default new UserRepository();
