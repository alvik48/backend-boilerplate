import { STATIC_FILES_DIR } from '@constants/files';
import plugin from '@fastify/static';

const options = {
  root: STATIC_FILES_DIR,
  prefix: '/public/',
};

export { options, plugin };
