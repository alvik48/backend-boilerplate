import plugin from '@fastify/cors';

const options = {
  origin: '*',
  credentials: true,
};

export { options, plugin };
