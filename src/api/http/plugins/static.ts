import plugin from '@fastify/static';
import path from 'path';

const options = {
  root: path.join(__dirname, '../', '../', '../', 'public'),
  prefix: '/public/',
};

export { options, plugin };
