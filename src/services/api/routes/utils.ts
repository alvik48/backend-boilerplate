import createRoute from '@services/api/utils/router';
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
    method: 'get',
    endpoint: '/utils/ping',
    description: 'Health check. Should return status 200',
    tags: [ApiTag.Utils],
    schema: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async handler() {},
  });
};
