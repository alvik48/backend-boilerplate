import { JWT } from '@fastify/jwt';
import { Prisma } from '@prisma/client';
import User from '@repositories/user';
import { UserSafeSpec } from '@src/db';
import { parsePeriod } from '@utils/helpers';

/**
 * Class representing user-related operations for creation, retrieval, validation, and updates.
 */
class Users {
  protected accessTokenTTL = parsePeriod(process.env.API_JWT_TTL || '24h');

  /**
   * Creates a new user entry in the database.
   * @param {Omit<Prisma.UserCreateInput, 'apiKey'>} data - The user data to create, excluding the 'apiKey' field.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the created user data in a safe specification format.
   */
  async create(data: Omit<Prisma.UserCreateInput, 'apiKey'>): Promise<UserSafeSpec> {
    return User.create(data);
  }

  /**
   * Fetches a user by their unique identifier.
   * @param {number} id - The unique identifier of the user to retrieve.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the user's safe specification.
   */
  async getById(id: number): Promise<UserSafeSpec> {
    return User.getById(id);
  }

  /**
   * Authenticates a user by validating their credentials and generates a JSON Web Token (JWT) for them.
   * @param {string} username - The username of the user attempting to authenticate.
   * @param {string} password - The password corresponding to the provided username.
   * @param {JWT} signer - The JSON Web Token instance used for signing the authentication token.
   * @returns {Promise<UserSafeSpec & { token: string }>} A promise that resolves to an object containing the user information with sensitive details excluded, and a newly generated access token.
   */
  async authenticate(username: string, password: string, signer: JWT): Promise<UserSafeSpec & { token: string }> {
    const user = await User.getByCredentials(username, password);
    const token = signer.sign(user, { expiresIn: this.accessTokenTTL });

    return { ...user, token };
  }

  /**
   * Validates the provided API key by using the User's composite API key validation logic.
   * @param {string} apiKey - The API key to be validated.
   * @returns {Promise<void>} A promise that resolves if the API key is valid or rejects if it is invalid.
   */
  async validateApiKey(apiKey: string): Promise<void> {
    await User.validateCompositeApiKey(apiKey);
  }

  /**
   * Updates a user's record in the database with the provided data.
   * @param {number} id - The unique identifier of the user to be updated.
   * @param {Omit<Prisma.UserUpdateInput, 'apiKey'>} data - The updated data for the user, excluding the apiKey field.
   * @returns {Promise<UserSafeSpec>} A promise that resolves to the updated user information in a safe format.
   */
  async update(id: number, data: Omit<Prisma.UserUpdateInput, 'apiKey'>): Promise<UserSafeSpec> {
    return User.update(id, data);
  }

  /**
   * Updates the API key for a user with the specified ID.
   * @param {number} id - The unique identifier of the user whose API key will be updated.
   * @returns {Promise<string>} A promise that resolves to the updated API key as a string.
   */
  async updateApiKey(id: number): Promise<string> {
    return User.updateApiKey(id);
  }
}

export default new Users();
