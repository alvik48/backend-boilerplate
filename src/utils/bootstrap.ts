import './dotenv';

import { STATIC_FILES_DIR } from '../constants/files';
import { createDirectoryIfNotExists } from './files';

/* -----------------------------------------------------------------------------
  Environment variables check
----------------------------------------------------------------------------- */

/* -----------------------------------------------------------------------------
  Directories creation
----------------------------------------------------------------------------- */

createDirectoryIfNotExists(STATIC_FILES_DIR);
