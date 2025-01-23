import plugin, { FastifyApiReferenceOptions } from '@scalar/fastify-api-reference';

import { SCALAR_UI_ENDPOINT } from '../constants';

const options: FastifyApiReferenceOptions = {
  routePrefix: SCALAR_UI_ENDPOINT as `/${string}`,
  configuration: {
    theme: 'solarized',
  },
};

export { options, plugin };
