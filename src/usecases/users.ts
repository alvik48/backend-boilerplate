/* -----------------------------------------------------------------------------
  Module main methods
----------------------------------------------------------------------------- */

/**
 * Represents the register function.
 * @async
 * @function
 * @returns {Promise<object>} An empty object.
 */
const register = async () =>
  // TODO
  ({});

/**
 * Authenticates a user with the given username and password.
 * @param {string} username - The username of the user to be authenticated.
 * @param {string} password - The password of the user to be authenticated.
 * @returns {Promise<object>} - A Promise that resolves to an object containing the user's ID and username.
 * @throws {Error} - If the provided username and password are not equal to "test".
 */
const authenticate = async (username: string, password: string) => {
  // TODO: implement the logic
  if (username !== 'test' || password !== 'test') {
    throw new Error(`Username and password must be equal to "test"`);
  }

  return {
    id: 1,
    username: 'test',
  };
};

/**
 * Retrieves the profile information of a given user ID.
 * @param {number} id - The user ID.
 * @returns {Promise<object>} - The profile information object.
 * @example
 *
 * // Usage example
 * const id = 1;
 * const profile = await getProfile(id);
 * console.log(profile);
 *
 * // Output:
 * // {
 * //   id: 1,
 * //   username: 'test',
 * // }
 */
const getProfile = async (id: number) =>
  // TODO: implement
  ({
    id,
    username: 'test',
  });

/* -----------------------------------------------------------------------------
  Module export
----------------------------------------------------------------------------- */

const Users = {
  register,
  authenticate,
  getProfile,
};

export default Users;
