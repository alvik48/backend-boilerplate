import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import Users from '../../../usecases/users';
import { ApiTag, HttpStatus } from '../interfaces/enums';
import routeHandler from '../utils/route-handler';

const PostBodySchema = {
  type: 'object',
  properties: {
    userId: { type: 'number' },
    username: { type: 'string' },
    referredBy: { type: 'number' },
  },
  required: ['userId'],
} as const;

/**
 * Registers routes for checking server health
 * @param fastify
 */
export default async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: FromSchema<typeof PostBodySchema>;
  }>(
    '/users',
    {
      schema: {
        description: 'Registers new user',
        tags: [ApiTag.Users],
        body: PostBodySchema,
      },
    },
    async (request, reply) =>
      routeHandler(request, reply, async () => {
        await Users.register();
        reply.status(HttpStatus.OK).send();
      }),
  );
};
