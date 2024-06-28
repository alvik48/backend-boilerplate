import plugin from '@fastify/swagger-ui';

import { SWAGGER_UI_ENDPOINT } from '../constants';

const options = {
  routePrefix: SWAGGER_UI_ENDPOINT,
};

export { options, plugin };
