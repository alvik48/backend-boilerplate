import plugin from '@fastify/multipart';

import { FASTIFY_BODY_LIMIT } from '../constants';

const options = {
  limits: {
    fieldNameSize: 128, // Max field name size in bytes
    fileSize: FASTIFY_BODY_LIMIT, // For multipart forms, the max file size in bytes
    files: 1, // Max number of file fields
  },
  attachFieldsToBody: true,
};

export { options, plugin };
