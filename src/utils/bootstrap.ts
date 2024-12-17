import './dotenv';

import { PUBLIC_FILES_DIR, STATIC_FILES_DIR, TMP_FILES_DIR } from '@constants/files';
import logger from '@utils/logger';

import { createDirectoryIfNotExists } from './files';

/* -----------------------------------------------------------------------------
  Environment variables check
----------------------------------------------------------------------------- */

/* -----------------------------------------------------------------------------
  Directories creation
----------------------------------------------------------------------------- */

createDirectoryIfNotExists(STATIC_FILES_DIR);
createDirectoryIfNotExists(PUBLIC_FILES_DIR);
createDirectoryIfNotExists(TMP_FILES_DIR);

/**
 * Initializes and bootstraps the application.
 *
 * This asynchronous function is responsible for setting up the
 * application environment. It performs necessary operations
 * such as initializing database models and preparing the system
 * for operation.
 *
 * Logging is used to track the different stages of the bootstrap
 * process, including when the application starts initializing and
 * when the models are fully ready.
 * @returns {Promise<void>} A promise that resolves when the
 * application has been successfully bootstrapped.
 */
const bootstrap = async (): Promise<void> => {
  logger.info('Bootstrapping application...');

  // TODO

  logger.info('Application is ready');
};

export default bootstrap;
