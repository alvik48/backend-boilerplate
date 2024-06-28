import { createSigner } from 'fast-jwt';
import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import Users from '../../../../usecases/users';
import { ApiTag, HttpStatus } from '../../interfaces/enums';
import routeHandler from '../../utils/route-handler';

const PostBodySchema = {
  type: 'object',
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['username', 'password'],
} as const;

/**
 * Registers routes for checking server health
 * @param fastify
 */
export default async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: FromSchema<typeof PostBodySchema>;
  }>(
    '/users/auth',
    {
      schema: {
        description: 'Authenticates the user and returns JWT token to be used for all private requests',
        tags: [ApiTag.Users],
        body: PostBodySchema,
      },
    },
    async (request, reply) =>
      routeHandler(request, reply, async () => {
        const { username, password } = request.body;
        const data = await Users.authenticate(username, password);
        const signer = createSigner({ key: process.env.API_JWT_SECRET! });
        const token = signer(data);

        reply.status(HttpStatus.OK).send({ token });
      }),
  );
};
