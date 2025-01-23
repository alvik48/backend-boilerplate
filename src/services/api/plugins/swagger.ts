import plugin from '@fastify/swagger';
import { API_REMOTE_BASE } from '@services/api/constants';
import { version } from '@src/../package.json';

const SCHEME = process.env.API_REMOTE_SCHEME || 'http';
const HOST = process.env.API_REMOTE_HOST || '127.0.0.1:3000';

const options = {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'Project API',
      description: 'Routes for interaction with the project API',
      version,
    },
    servers: [
      {
        url: `${SCHEME}://${HOST}${API_REMOTE_BASE}`,
        description: 'Main REST API server',
      },
    ],
    schemes: [SCHEME],
    definitions: [],
    components: {
      securitySchemes: {
        Bearer: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'Enter the token with the `Bearer ` prefix, e.g. "Bearer qwerty123"',
        },
      },
    },
    consumes: ['application/json'],
    produces: ['application/json'],
  },
};

export { options, plugin };
