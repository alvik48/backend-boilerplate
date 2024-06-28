import { FastifyInstance } from 'fastify';

import Users from '../../../../usecases/users';
import { ApiTag, HttpStatus } from '../../interfaces/enums';
import routeHandler from '../../utils/route-handler';

/**
 * Registers routes for checking server health
 * @param fastify
 */
export default async (fastify: FastifyInstance) => {
  fastify.get<{}>(
    '/users/me',
    {
      schema: {
        description: 'Returns the bearer profile data',
        tags: [ApiTag.Users],
        security: [{ Bearer: [] }],
      },
      preHandler: fastify.verifyBearerAuth,
    },
    async (request, reply) =>
      routeHandler(request, reply, async (auth) => {
        const data = await Users.getProfile(auth.user.id);
        reply.status(HttpStatus.OK).send(data);
      }),
  );
};
