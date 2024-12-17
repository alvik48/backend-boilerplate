import plugin from '@fastify/jwt';

const options = { secret: process.env.API_JWT_SECRET! };

export { options, plugin };
