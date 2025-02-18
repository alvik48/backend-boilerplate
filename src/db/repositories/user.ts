import { randomBytes } from 'node:crypto';

import KnownError from '@libs/error';
import { Prisma } from '@prisma/client';
import { db, TxClient, UserSafeSpec, UserSpec } from '@src/db';
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
   * Creates a new user record with the provided data, encrypting the password before saving.
   * @param {Omit<Prisma.UserCreateInput, 'apiKey'>} data - The user data to create, excluding the apiKey field.
   * @param {TxClient} [tx] - The transaction client used to perform the database operation. Defaults to the standard database client.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the safely omitted user data after creation.
   */
  async create(data: Omit<Prisma.UserCreateInput, 'apiKey'>, tx: TxClient = db): Promise<UserSafeSpec> {
    const encryptedPassword = await this.encrypt(data.password);

    return tx.user.create({
      data: {
        ...data,
        password: encryptedPassword,
      },
      ...this.safeOmit,
    });
  }

  /**
   * Fetches a user record by its unique identifier.
   * @template T - Determines whether the returned user object is the safe version or the full version.
   * @param {number} id - The unique identifier of the user.
   * @param {T} [safe] - Specifies whether to return the safe version of the user object.
   * @param {TxClient} [tx] - The transaction client to be used for database operations.
   * @returns {Promise<UserSafeSpec | UserSpec>} A promise that resolves to the user object, either safe or full based on the `safe` parameter.
   */
  async getById<T extends boolean>(
    id: number,
    safe: T = true as T,
    tx: TxClient = db,
  ): Promise<T extends true ? UserSafeSpec : UserSpec> {
    return this.getUnique({ id }, safe, tx);
  }

  /**
   * Retrieves a user by their username from the database.
   * @template T Determines the type of user data to return. If true, a safe user object is returned; otherwise, a full user object is returned.
   * @param {string} username - The username of the user to retrieve.
   * @param {T} [safe] - If true, returns the user with sensitive data excluded; otherwise, includes all user information.
   * @param {TxClient} [tx] - The transaction client used to perform the database query.
   * @returns {Promise<UserSafeSpec | UserSpec>} A promise that resolves to the user object, with the type depending on the `safe` parameter.
   */
  async getByUsername<T extends boolean>(
    username: string,
    safe: T = true as T,
    tx: TxClient = db,
  ): Promise<T extends true ? UserSafeSpec : UserSpec> {
    return this.getUnique({ username }, safe, tx);
  }

  /**
   * Updates a user's record in the database.
   * @param {number} id - The unique identifier of the user to update.
   * @param {Prisma.UserUpdateInput} data - The data to update the user with. If a password is provided, it will be encrypted.
   * @param {TxClient} [tx] - The transaction client to use for the database operation. Defaults to the global database client.
   * @returns {Promise<UserSafeSpec>} A promise that resolves with the updated user data in a safe format.
   */
  async update(id: number, data: Prisma.UserUpdateInput, tx: TxClient = db): Promise<UserSafeSpec> {
    if (data.password) {
      data.password = await this.encrypt(data.password as string);
    }

    return tx.user.update({
      where: { id },
      data,
      ...this.safeOmit,
    });
  }

  /**
   * Updates the API key for a user and returns the new API key.
   * @param {number} id - The ID of the user whose API key needs to be updated.
   * @param {TxClient} [tx] - The database transaction client to use for updating the API key. Defaults to the global database client.
   * @returns {Promise<string>} A promise that resolves to the newly generated API key.
   */
  async updateApiKey(id: number, tx: TxClient = db): Promise<string> {
    const { apiKey, encryptedApiKey } = await this.createApiKey();

    await tx.user.update({
      where: { id },
      data: {
        apiKey: encryptedApiKey,
      },
    });

    return apiKey;
  }

  /**
   * Retrieves a user by their username and password credentials. Verifies the provided password
   * against the stored encrypted password.
   * @param {string} username - The username of the user to fetch.
   * @param {string} password - The password to validate against the stored credentials.
   * @param {TxClient} [tx] - The database transaction client to be used.
   * @returns {Promise<UserSafeSpec>} Returns a promise that resolves to the user information excluding sensitive fields.
   */
  async getByCredentials(username: string, password: string, tx: TxClient = db): Promise<UserSafeSpec> {
    const { password: encryptedPassword, apiKey, ...user } = await this.getByUsername(username, false, tx);
    const areCredentialsValid = await bcrypt.compare(password, encryptedPassword);

    if (!areCredentialsValid) {
      throw new KnownError('UserCredentialsNotValid');
    }

    return user;
  }

  /**
   * Validates if the provided composite key is valid by splitting it into user ID
   * and API key, retrieving the user's associated API key from the database, and
   * comparing it with the provided API key.
   * @param {string} compositeKey - The composite key consisting of the user ID and API key, separated by a colon.
   * @param {TxClient} [tx] - The transaction client for database interactions, defaulting to the global `db` client.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the composite key is valid.
   * @throws {KnownError} Throws 'UserNotFound' if the user ID does not exist in the database.
   * @throws {KnownError} Throws 'AccessDenied' if the user does not have an API key associated.
   */
  async isApiCompositeKeyValid(compositeKey: string, tx: TxClient = db): Promise<boolean> {
    const [userId, apiKey] = compositeKey.split(':');

    const user = await tx.user.findUnique({
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
   * Validates the provided composite API key.
   * @param {string} compositeKey - The composite API key to validate.
   * @param {TxClient} [tx] - The transaction client to use for database operations. Defaults to `db`.
   * @returns {Promise<void>} Resolves if the key is valid, otherwise throws an error.
   */
  async validateCompositeApiKey(compositeKey: string, tx: TxClient = db): Promise<void> {
    const isValid = await this.isApiCompositeKeyValid(compositeKey, tx);

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
   * Retrieves a unique user record from the database based on the specified condition.
   * @template T Indicates whether the returned user object should omit sensitive fields.
   * @param {Prisma.UserWhereUniqueInput} where - The unique condition to locate the user.
   * @param {T} [safe] - A flag indicating whether to omit sensitive fields from the returned user record.
   * @param {TxClient} [tx] - The transaction client used to perform the database operation.
   * @returns {Promise<UserSafeSpec | UserSpec>} A promise that resolves to the user object, either with or without sensitive fields, based on the `safe` parameter.
   * @throws {KnownError} Throws a `UserNotFound` error if no user is found matching the condition specified in `where`.
   */
  protected async getUnique<T extends boolean>(
    where: Prisma.UserWhereUniqueInput,
    safe: T = true as T,
    tx: TxClient = db,
  ): Promise<T extends true ? UserSafeSpec : UserSpec> {
    const user = await tx.user.findUnique({
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
