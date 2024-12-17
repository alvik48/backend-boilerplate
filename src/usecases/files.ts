import { randomUUID } from 'node:crypto';

import { STATIC_FILES_DIR } from '@constants/files';
import { MultipartFile } from '@fastify/multipart';
import { StaticFileSpec } from '@interfaces/files';
import { saveBuffer } from '@utils/files';
import logger from '@utils/logger';
import { extension as getExtension } from 'mime-types';
import path from 'path';

/**
 * Represents a class for handling file-related operations, such as uploading files
 * and saving them to a static directory with unique identifiers.
 */
class Files {
  /**
   * Uploads a file and saves it to the static files directory with a unique identifier.
   * @param {string} name - The original name of the file.
   * @param {MultipartFile} file - The file to be uploaded, represented as a multipart file object.
   * @returns {Promise<StaticFileSpec>} A promise that resolves to an object containing the file's ID, generated filename, and original name.
   */
  async upload(name: string, file: MultipartFile): Promise<StaticFileSpec> {
    const id = randomUUID();
    const filename = `${id}.${getExtension(file.mimetype)}`;
    const filepath = path.join(STATIC_FILES_DIR, filename);
    const fileBuffer = await file.toBuffer();

    await saveBuffer(fileBuffer, filepath);

    logger.info(`File ${name} has been saved as ${filename}`);

    return { id, filename, name };
  }

  /**
   * Uploads multiple files asynchronously.
   * @param {MultipartFile[]} files - An array of files to be uploaded.
   * @returns {Promise<StaticFileSpec[]>} A promise that resolves to an array of uploaded file specifications.
   */
  async uploadMany(files: MultipartFile[]): Promise<StaticFileSpec[]> {
    const promises = files.map((file) => this.upload(file.filename, file));
    return Promise.all(promises);
  }
}

export default new Files();
