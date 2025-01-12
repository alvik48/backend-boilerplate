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
    endpoint: '/users',
    description: 'Registers a new user',
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
            id: { type: 'number' },
            username: { type: 'string' },
          },
          required: ['id', 'username'],
        },
      } as const,
    },
    async handler(request) {
      return Users.create(request.body);
    },
  });

  createRoute({
    fastify,
    method: 'get',
    endpoint: '/users/me',
    description: 'Returns the bearer profile data',
    auth: true,
    tags: [ApiTag.Users],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            username: { type: 'string' },
          },
          required: ['id', 'username'],
        },
      } as const,
    },
    async handler(request) {
      return Users.getById(request.user.id);
    },
  });
};
