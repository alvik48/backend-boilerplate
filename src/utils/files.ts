import { createWriteStream, existsSync, mkdirSync } from 'node:fs';

/**
 * Saves the given buffer to a file at the specified file path.
 * @param {Buffer} buffer - The buffer containing the data to be saved.
 * @param {string} filePath - The path to the file where the buffer will be saved.
 * @returns {Promise<void>} A promise that resolves when the buffer is successfully saved or rejects with an error if there was a problem.
 */
export const saveBuffer = (buffer: Buffer, filePath: string): Promise<void> =>
  new Promise((resolve, reject) => {
    // Create a writable stream
    const fileStream = createWriteStream(filePath);

    // Write Buffer to file
    fileStream.write(buffer, (err) => {
      if (err) {
        reject(err);
      } else {
        fileStream.end();
      }
    });

    // Add 'finish' event listener to resolve promise
    fileStream.on('finish', resolve);

    // Add 'error' event listener to reject promise
    fileStream.on('error', reject);
  });

/**
 * Creates a directory if it doesn't exist.
 * @param {string} dir - The directory to create.
 */
export const createDirectoryIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
};
