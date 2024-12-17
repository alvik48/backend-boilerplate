import createRoute from '@services/api/utils/router';
import Users from '@usecases/users';
import { FastifyInstance } from 'fastify';

import { ApiTag } from '../interfaces/enums';

/* eslint-disable jsdoc/require-jsdoc */

/**
 * Routes registration
 * @param {FastifyInstance} fastify
 * @returns {void}
 */
export default (fastify: FastifyInstance): void => {
  createRoute({
    fastify,
    method: 'post',
    endpoint: '/auth',
    description: 'Authenticates the user and returns JWT token to be used for all private requests',
    tags: [ApiTag.Users],
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['username', 'password'],
      } as const,
      response: {
        200: {
          type: 'object',
          properties: {
            username: { type: 'string' },
            token: { type: 'string' },
          },
          required: ['username', 'token'],
        },
      } as const,
    },
    async handler(request) {
      const { username, password } = request.body;
      return Users.authenticate(username, password, fastify.jwt);
    },
  });
};
