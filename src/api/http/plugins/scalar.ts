import plugin from '@scalar/fastify-api-reference';

import { SCALAR_UI_ENDPOINT } from '../constants';

const options = {
  routePrefix: SCALAR_UI_ENDPOINT,
  configuration: {
    theme: 'solarized',
  },
};

export { options, plugin };
