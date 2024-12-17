import KnownError from '@libs/error';
import { DEFAULT_ERRORS_SCHEMA } from '@services/api/constants';
import { ApiTag, HttpStatus } from '@services/api/interfaces/enums';
import logger from '@utils/logger';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { FromSchema } from 'json-schema-to-ts';

/**
 * A middleware function to authenticate a user using JWT.
 *
 * This asynchronous function verifies the JWT token from the request
 * using `request.jwtVerify()`. If the token is invalid or the user object
 * does not meet the required structure, it throws an error.
 *
 * If authentication fails, the function sends a response with an
 * HTTP status 401 (Unauthorized) and an error message.
 * @param {FastifyRequest} request - The Fastify request object containing the JWT.
 * @param {FastifyReply} reply - The Fastify reply object used to send responses.
 */
const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();

    if (typeof request.user !== 'object' || !('id' in request.user)) {
      throw new Error('Invalid user');
    }
  } catch (_) {
    reply.status(HttpStatus.Unauthorized).send({ error: 'Unauthorized', message: 'Unauthorized request' });
  }
};

/**
 * Enhances a given schema with additional structure and validation rules.
 * This function modifies the schema by potentially transforming the `body` properties when `isMultipart` is true
 * and by appending default error responses to the schema's response section.
 * @param {any} schema - The original schema to be enriched. Expected to include `body` and/or `response` properties.
 * @param {boolean} [isMultipart] - Flag indicating whether the schema should be adapted for multipart data handling.
 * When true, `body` properties of type `string` or `number` are transformed into objects with a nested `value` field of type `string`.
 * @returns {any} The enriched schema with modified `body` and/or `response` structures.
 */
const enrichSchema = (schema: any, isMultipart: boolean = false): any => {
  const newSchema = { ...schema };

  if (isMultipart && newSchema.body) {
    const body = { ...newSchema.body };

    for (const key in body.properties) {
      if (['string', 'number'].includes(body.properties[key].type)) {
        body.properties[key] = {
          type: 'object',
          properties: {
            value: {
              type: 'string',
            },
          },
        };
      }
    }

    newSchema.body = body;
  }

  newSchema.response = {
    ...DEFAULT_ERRORS_SCHEMA,
    ...(newSchema.response || {}),
  };

  return newSchema;
};

/**
 * Creates a new API route for a Fastify instance with defined configurations and schema validations.
 * @template TSchema - A schema object defining the shape of the request and response, including body, params, querystring, headers, and response formats.
 * @param {object} params - The parameters to define and configure the route.
 * @param {FastifyInstance} params.fastify - The Fastify instance on which the route will be registered.
 * @param {'get' | 'post' | 'patch' | 'put' | 'delete'} params.method - The HTTP method for the route.
 * @param {string} params.endpoint - The API endpoint path for the route.
 * @param {string} [params.description] - An optional description of the route for documentation purposes.
 * @param {ApiTag[]} [params.tags] - An optional array of tags for categorization in API documentation.
 * @param {TSchema} params.schema - The schema object to validate the request and response data.
 * @param {boolean} [params.auth] - A flag indicating whether authentication is required for the route.
 * @param {boolean} [params.multipart] - A flag indicating whether the route supports multipart/form-data requests.
 * @param {Function} params.handler - The handler function that processes the request and sends the response. Receives `request` and `reply` as arguments, and must return a Promise.
 * @throws Will return a 500 server error with an error message if the handler encounters an unexpected issue.
 */
const createRoute = <
  TSchema extends Partial<{
    body: Record<string, any>;
    params: Record<string, any>;
    querystring: Record<string, any>;
    headers: Record<string, any>;
    response: Record<string, any>;
  }>,
>(params: {
  fastify: FastifyInstance;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  endpoint: string;
  description?: string;
  tags?: ApiTag[];
  schema: TSchema;
  auth?: boolean;
  multipart?: boolean;
  handler: (
    request: FastifyRequest<{
      Body: TSchema['body'] extends Record<string, any> ? FromSchema<TSchema['body']> : undefined;
      Params: TSchema['params'] extends Record<string, any> ? FromSchema<TSchema['params']> : undefined;
      Querystring: TSchema['querystring'] extends Record<string, any> ? FromSchema<TSchema['querystring']> : undefined;
      Headers: TSchema['headers'] extends Record<string, any> ? FromSchema<TSchema['headers']> : undefined;
      Response: TSchema['response'] extends Record<string, any> ? FromSchema<TSchema['response']> : undefined;
    }>,
    reply: FastifyReply<{
      Body: TSchema['body'] extends Record<string, any> ? FromSchema<TSchema['body']> : undefined;
      Params: TSchema['params'] extends Record<string, any> ? FromSchema<TSchema['params']> : undefined;
      Querystring: TSchema['querystring'] extends Record<string, any> ? FromSchema<TSchema['querystring']> : undefined;
      Headers: TSchema['headers'] extends Record<string, any> ? FromSchema<TSchema['headers']> : undefined;
      Response: TSchema['response'] extends Record<string, any> ? FromSchema<TSchema['response']> : undefined;
    }>,
  ) => Promise<any>;
}) => {
  const { fastify, method, endpoint, description, tags, schema, auth, multipart, handler } = params;

  fastify[method]<{
    Body: TSchema['body'] extends Record<string, any> ? FromSchema<TSchema['body']> : undefined;
    Params: TSchema['params'] extends Record<string, any> ? FromSchema<TSchema['params']> : undefined;
    Querystring: TSchema['querystring'] extends Record<string, any> ? FromSchema<TSchema['querystring']> : undefined;
    Headers: TSchema['headers'] extends Record<string, any> ? FromSchema<TSchema['headers']> : undefined;
    Response: TSchema['response'] extends Record<string, any> ? FromSchema<TSchema['response']> : undefined;
  }>(
    endpoint,
    {
      preHandler: auth ? [authenticate] : undefined,
      schema: {
        description,
        tags,
        security: auth ? [{ Bearer: [] }] : undefined,
        consumes: multipart ? ['multipart/form-data'] : undefined,
        ...enrichSchema(schema, multipart),
      },
    },
    async (request, reply) => {
      try {
        const data = await handler(request, reply);
        reply.status(HttpStatus.OK).send(data);
      } catch (error) {
        if (error instanceof KnownError) {
          reply.status(HttpStatus.ServerError).send({ error: error.code, message: error.message });
          return;
        }

        const errMessage = error?.toString() || error;

        reply.status(HttpStatus.ServerError).send({ error: errMessage });
        logger.error(`--> ${request.id} Error: ${errMessage}`);
      }
    },
  );
};

export default createRoute;
