import startHttpAPI from '@services/api';
import bootstrap from '@utils/bootstrap';
import logger from '@utils/logger';

(async () => {
  try {
    await bootstrap();
    await startHttpAPI();
  } catch (err) {
    logger.fatal(err);
    process.exit(1);
  }
})();
