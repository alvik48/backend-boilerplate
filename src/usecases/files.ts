import { randomUUID } from 'node:crypto';

import { extension as getExtension } from 'mime-types';
import path from 'path';

import { STATIC_FILES_DIR } from '../constants/files';
import { StaticFileSpec } from '../interfaces/files';
import { saveBuffer } from '../utils/files';
import logger from '../utils/logger';

/* -----------------------------------------------------------------------------
  Module main methods
----------------------------------------------------------------------------- */

/**
 * Uploads a file and returns information about the saved file.
 * @param {string} name - The name of the file.
 * @param {any} file - The file to upload.
 * @returns {Promise<StaticFileSpec>} - The information about the saved file.
 */
const uploadFile = async (name: string, file: any): Promise<StaticFileSpec> => {
  const id = randomUUID();
  const filename = `${id}.${getExtension(file.mimetype)}`;
  const filepath = path.join(STATIC_FILES_DIR, filename);
  const fileBuffer = await file.toBuffer();

  await saveBuffer(fileBuffer, filepath);

  logger.info(`File ${name} has been saved as ${filename}`);

  return { id, filename, name };
};

/* -----------------------------------------------------------------------------
  Module export
----------------------------------------------------------------------------- */

const Files = {
  uploadFile,
};

export default Files;
