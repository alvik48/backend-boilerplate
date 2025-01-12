import KnownError from '@libs/error';
import { DEFAULT_ERRORS_SCHEMA } from '@services/api/constants';
import { ApiTag, HttpStatus } from '@services/api/interfaces/enums';
import { UserSafeSpec } from '@src/db';
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
 * Creates a route in a Fastify application with specified configurations, including method, endpoint, schema, authentication, and more.
 * @template TSchema Extends a partial object containing specific request and response schema properties such as `body`, `params`, `querystring`, `headers`, and `response`.
 * @template A A boolean value indicating whether authentication is required for the route or not.
 * @param {object} params - Configuration parameters for setting up the route.
 * @param {FastifyInstance} params.fastify - Instance of the Fastify application where the route will be registered.
 * @param {'get' | 'post' | 'patch' | 'put' | 'delete'} params.method - HTTP method type for the route (e.g., GET, POST, PATCH).
 * @param {string} params.endpoint - Endpoint path for the route.
 * @param {string} [params.description] - Optional description of the route for documentation purposes.
 * @param {ApiTag[]} [params.tags] - Optional array of API tags categorizing the route for Swagger or other documentation tools.
 * @param {TSchema} params.schema - Schema definition for the route's `body`, `params`, `querystring`, `headers`, and `response`.
 * @param {A} [params.auth] - Boolean indicating whether the route requires user authentication (`true`) or not (`false`).
 * @param {boolean} [params.multipart] - Indicates if the route supports `multipart/form-data` for file uploads.
 * @param {Function} params.handler - Asynchronous handler function that processes the request and reply objects. The `request` object includes parsed inputs based on the provided schema, and the `reply` object is used to craft responses.
 */
const createRoute = <
  TSchema extends Partial<{
    body: Record<string, any>;
    params: Record<string, any>;
    querystring: Record<string, any>;
    headers: Record<string, any>;
    response: Record<string, any>;
  }>,
  A extends boolean,
>(params: {
  fastify: FastifyInstance;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  endpoint: string;
  description?: string;
  tags?: ApiTag[];
  schema: TSchema;
  auth?: A;
  multipart?: boolean;
  handler: (
    request: Omit<
      FastifyRequest<{
        Body: TSchema['body'] extends Record<string, any> ? FromSchema<TSchema['body']> : undefined;
        Params: TSchema['params'] extends Record<string, any> ? FromSchema<TSchema['params']> : undefined;
        Querystring: TSchema['querystring'] extends Record<string, any>
          ? FromSchema<TSchema['querystring']>
          : undefined;
        Headers: TSchema['headers'] extends Record<string, any> ? FromSchema<TSchema['headers']> : undefined;
        Response: TSchema['response'] extends Record<string, any> ? FromSchema<TSchema['response']> : undefined;
      }>,
      'user'
    > & { user: A extends true ? UserSafeSpec : undefined },
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
        const data = await handler(
          {
            ...request,
            user: (auth ? (request.user as UserSafeSpec) : undefined) as A extends true ? UserSafeSpec : undefined,
          },
          reply,
        );

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
