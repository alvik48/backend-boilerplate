import { FastifyInstance } from 'fastify';

import { ApiTag, HttpStatus } from '../../interfaces/enums';
import routeHandler from '../../utils/route-handler';

/**
 * Registers routes for checking server health
 * @param fastify
 */
export default async (fastify: FastifyInstance) => {
  fastify.get<{}>(
    '/utils/ping',
    {
      schema: {
        description: 'Returns response of status 200 OK if the API server is up',
        tags: [ApiTag.Utils],
      },
    },
    async (request, reply) =>
      routeHandler(request, reply, async () => {
        reply.status(HttpStatus.OK).send();
      }),
  );
};
