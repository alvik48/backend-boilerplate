import Fastify, { FastifyInstance } from 'fastify';

import logger from '../../utils/logger';
import { FASTIFY_BODY_LIMIT, SWAGGER_UI_ENDPOINT } from './constants';
import { RegisterPluginSpec, RoutesSpec } from './interfaces';
import * as auth from './plugins/auth';
import * as cors from './plugins/cors';
import * as multipart from './plugins/multipart';
import * as staticServer from './plugins/static';
import * as swagger from './plugins/swagger';
import * as swaggerUI from './plugins/swagger-ui';
import * as rawRoutes from './routes';

const SCHEME = process.env.API_SCHEME || 'http';
const HOST = process.env.API_HOST || '127.0.0.1';
const PORT = parseInt(process.env.API_PORT || '3000');

const routes = rawRoutes as RoutesSpec;

/**
 * Registers fastify plugin
 * @param fastify
 * @param root
 * @param root.plugin
 * @param root.options
 */
const registerPlugin = (fastify: FastifyInstance, { plugin, options }: RegisterPluginSpec) => {
  fastify.register(plugin, options);
};

/**
 * Runs the HTTP API server
 */
const startHttpAPI = async () => {
  const fastify = Fastify({ logger: false, bodyLimit: FASTIFY_BODY_LIMIT });

  registerPlugin(fastify, auth);
  registerPlugin(fastify, cors);
  registerPlugin(fastify, multipart);
  registerPlugin(fastify, swagger);
  registerPlugin(fastify, staticServer);
  registerPlugin(fastify, swaggerUI);

  for (const entity in routes) {
    for (const route of Object.values(routes[entity])) {
      fastify.register(route);
    }
  }

  await fastify.listen({
    host: HOST,
    port: PORT,
  });

  logger.info(`Server has launched at ${SCHEME}://${HOST}:${PORT}`);
  logger.info(`API docs page is accessible at ${SCHEME}://${HOST}:${PORT}${SWAGGER_UI_ENDPOINT}`);
};

export default startHttpAPI;
