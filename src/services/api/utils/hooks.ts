import logger from '@utils/logger';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Middleware function executed on each incoming request in a Fastify application.
 *
 * Logs the details of the incoming request, including the request ID, method, URL, and body parameters if available.
 * @param {FastifyRequest} request - The Fastify request object containing details of the HTTP request.
 * @param {FastifyReply} reply - The Fastify reply object used to send the response.
 * @param {Function} done - A callback function to signal the completion of the middleware execution.
 */
export const onRequest = (request: FastifyRequest, reply: FastifyReply, done: Function) => {
  const { body, id, method, url } = request;
  const params = body && Object.keys(body).length ? `. Body: ${JSON.stringify(body)}` : '';
  logger.trace(`<-- ${id} ${method} ${url}${params}`);
  done();
};

/**
 * Callback function to handle the response lifecycle in a Fastify application.
 *
 * Logs the request ID, response status code, and the elapsed time for processing the request.
 * @param {FastifyRequest} request - The incoming HTTP request object.
 * @param {FastifyReply} reply - The outgoing HTTP reply object.
 * @param {Function} done - Callback function to signal the completion of the response handling.
 */
export const onResponse = (request: FastifyRequest, reply: FastifyReply, done: Function) => {
  logger.trace(`--> ${request.id} ${reply.statusCode} [${reply.elapsedTime.toFixed(0)} ms]`);
  done();
};
