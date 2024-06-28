import '../utils/bootstrap';

import startHttpAPI from '../api/http';
import logger from '../utils/logger';

(async () => {
  try {
    await startHttpAPI();
  } catch (err) {
    logger.fatal(err);
    process.exit(1);
  }
})();
