import plugin from '@fastify/swagger';

import { version } from '../../../../package.json';
import { ApiTag } from '../interfaces/enums';

const SCHEME = process.env.API_REMOTE_SCHEME || 'http';
const HOST = process.env.API_REMOTE_HOST || '127.0.0.1:3000';
const BASE = process.env.API_REMOTE_BASE || '';

const options = {
  openapi: {
    openapi: '3.1.0',
    info: {
      title: 'Project API',
      description: 'Routes for interaction with the project API',
      version,
    },
    host: HOST,
    basePath: BASE,
    schemes: [SCHEME],
    tags: [
      { name: ApiTag.Admin, description: 'Admin only routes' },
      { name: ApiTag.Files, description: 'Static files management' },
      { name: ApiTag.Utils, description: 'Utilities' },
      { name: ApiTag.Users, description: 'Users' },
    ],
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
