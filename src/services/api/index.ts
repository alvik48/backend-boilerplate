import { readdirSync } from 'node:fs';
import path from 'node:path';

import { ajvFilePlugin } from '@fastify/multipart';
import { onRequest, onResponse } from '@services/api/utils/hooks';
import logger from '@utils/logger';
import Fastify, { FastifyInstance } from 'fastify';

import { FASTIFY_BODY_LIMIT, SCALAR_UI_ENDPOINT, SWAGGER_UI_ENDPOINT } from './constants';
import { RegisterPluginSpec } from './interfaces';
import * as cors from './plugins/cors';
import * as jwt from './plugins/jwt';
import * as multipart from './plugins/multipart';
import * as scalar from './plugins/scalar';
import * as staticServer from './plugins/static';
import * as swagger from './plugins/swagger';
import * as swaggerUI from './plugins/swagger-ui';

const SCHEME = process.env.API_SCHEME || 'http';
const HOST = process.env.API_HOST || '127.0.0.1';
const PORT = parseInt(process.env.API_PORT || '3000');

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
 * Registers routes inside the given directory
 * @param directory
 * @param fastify
 */
const registerRoutes = async (directory: string, fastify: FastifyInstance): Promise<void> => {
  // Read all items in the directory
  const items = readdirSync(directory, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(directory, item.name);

    if (item.isDirectory()) {
      // If it's a directory, recursively import its contents
      await registerRoutes(fullPath, fastify);
    } else if (item.isFile() && fullPath.endsWith('.ts')) {
      // If it's a TypeScript file, dynamically import it
      const route = await import(fullPath);
      fastify.register(route);
    }
  }
};

/**
 * Runs the HTTP API server
 */
const startHttpAPI = async () => {
  const fastify = Fastify({
    logger: false,
    bodyLimit: FASTIFY_BODY_LIMIT,
    ajv: {
      plugins: [ajvFilePlugin],
    },
  });

  registerPlugin(fastify, cors);
  registerPlugin(fastify, jwt);
  registerPlugin(fastify, multipart);
  registerPlugin(fastify, swagger);
  registerPlugin(fastify, staticServer);
  registerPlugin(fastify, scalar);
  registerPlugin(fastify, swaggerUI);

  fastify.addHook('onRequest', onRequest);
  fastify.addHook('onResponse', onResponse);

  await registerRoutes(`${__dirname}/routes`, fastify);

  await fastify.listen({
    host: HOST,
    port: PORT,
  });

  logger.info(`Server has launched at ${SCHEME}://${HOST}:${PORT}`);
  logger.info(`API docs page is accessible at:`);
  logger.info(`Swagger UI: ${SCHEME}://${HOST}:${PORT}${SWAGGER_UI_ENDPOINT}`);
  logger.info(`Scalar UI:  ${SCHEME}://${HOST}:${PORT}${SCALAR_UI_ENDPOINT}`);
};

export default startHttpAPI;
