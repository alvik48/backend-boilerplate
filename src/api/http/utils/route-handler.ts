import { FastifyReply, FastifyRequest } from 'fastify';

import logger from '../../../utils/logger';
import { HttpStatus } from '../interfaces/enums';
import jwtCache from './cache';

interface AuthSpec {
  isAuthorized: boolean;
  user: any;
}

/**
 * Parses a user token from a provided header.
 * @param {string} [header] - The header string containing the token.
 * @returns {object|undefined} - The parsed user object if token exists, otherwise undefined.
 */
const parseUser = (header?: string): object | undefined => {
  if (!header) {
    return undefined;
  }

  const token = header.split(' ')[1];

  return token ? jwtCache.get(token) : undefined;
};

/**
 * Returns stringified body params
 * @param req
 */
const getRequestParams = (req: FastifyRequest): any => {
  const { body } = req;
  return body && Object.keys(body).length ? `. Body: ${JSON.stringify(body)}` : '';
};

/**
 * Wraps route handler to try/catch block and adds universal logs
 * @param request
 * @param reply
 * @param handler
 */
const routeHandler = async (
  request: FastifyRequest,
  reply: FastifyReply,
  handler: (auth: AuthSpec) => Promise<void>,
) => {
  const user = parseUser(request.headers.authorization);
  const auth: AuthSpec = { isAuthorized: !!user, user };
  const userId = auth.user?.id || 'Unauthorized';

  logger.debug(`<-- [${userId}] [${request.id}] ${request.method} ${request.url}${getRequestParams(request)}`);

  try {
    await handler(auth);
    logger.trace(`--> ${request.id} OK`);
  } catch (e) {
    const errMessage = e?.toString() || e;

    reply.status(HttpStatus.ServerError).send({ error: errMessage });
    logger.error(`--> ${request.id} Error: ${errMessage}`);
  }
};

export default routeHandler;
