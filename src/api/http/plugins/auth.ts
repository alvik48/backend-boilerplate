import { fastifyBearerAuth as plugin } from '@fastify/bearer-auth';
import { createVerifier } from 'fast-jwt';

import { AUTH_TTL } from '../constants';
import jwtCache from '../utils/cache';

const options = {
  keys: new Set(['Authorization']),
  addHook: false,

  /**
   * Authorization check logic
   * @param token
   */
  async auth(token: string) {
    if (jwtCache.has(token)) {
      return true;
    }

    const now = Date.now();
    const decoder = createVerifier({ key: process.env.API_JWT_SECRET! });

    try {
      const decoded = await decoder(token);

      const createdAt = decoded.iat * 1000;
      const expiresAt = createdAt + AUTH_TTL;
      const expiresIn = expiresAt - now;

      if (expiresIn < 0) {
        return false;
      }

      jwtCache.set(token, decoded, expiresIn);
    } catch (err) {
      return false;
    }

    return true;
  },
};

export { options, plugin };
