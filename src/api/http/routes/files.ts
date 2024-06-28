import { FastifyInstance } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

import Files from '../../../usecases/files';
import { ApiTag, HttpStatus } from '../interfaces/enums';
import routeHandler from '../utils/route-handler';

const PostBodySchemaType = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    file: { type: 'string', format: 'binary', isFile: true },
  },
  required: ['name', 'file'],
} as const;

const PostBodySchema = {
  type: 'object',
  properties: {
    file: { isFile: true },
    name: {
      type: 'object',
      properties: {
        value: {
          type: 'string',
        },
      },
    },
  },
  required: ['file', 'name'],
};

/**
 * Registers routes for checking server health
 * @param fastify
 */
export default async (fastify: FastifyInstance) => {
  fastify.post<{
    Body: FromSchema<typeof PostBodySchemaType>;
  }>(
    '/files',
    {
      schema: {
        description: 'Uploads new static file on server',
        tags: [ApiTag.Files],
        body: PostBodySchema,
        consumes: ['multipart/form-data'],
        security: [{ Bearer: [] }],
      },
      preHandler: fastify.verifyBearerAuth,
    },
    async (request, reply) =>
      routeHandler(request, reply, async () => {
        const data = await Files.uploadFile((request.body.name as any).value, request.body.file);

        reply.status(HttpStatus.OK).send(data);
      }),
  );
};
