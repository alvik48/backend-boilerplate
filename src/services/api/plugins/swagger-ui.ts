import plugin, { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

import { SWAGGER_UI_ENDPOINT } from '../constants';

const options: FastifySwaggerUiOptions = {
  routePrefix: SWAGGER_UI_ENDPOINT,
  uiConfig: {
    persistAuthorization: true,
  },
};

export { options, plugin };
