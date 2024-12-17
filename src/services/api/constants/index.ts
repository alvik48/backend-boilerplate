import { HttpStatus } from '@services/api/interfaces/enums';

export const FASTIFY_BODY_LIMIT = 31457280; // 30mb
export const SWAGGER_UI_ENDPOINT = `/docs/swagger`;
export const SCALAR_UI_ENDPOINT = `/docs/scalar`;

export const DEFAULT_ERRORS_SCHEMA = {
  [HttpStatus.BadRequest]: {
    type: 'object',
    additionalProperties: false,
    description: 'Bad request',
    properties: {
      error: { type: 'string' },
      message: { type: 'string', nullable: true },
    },
  },
  [HttpStatus.Unauthorized]: {
    type: 'object',
    additionalProperties: false,
    description: 'Unauthorized',
    properties: {
      error: { type: 'string' },
      message: { type: 'string', nullable: true },
    },
  },
  [HttpStatus.NotFound]: {
    type: 'object',
    description: 'Endpoint not found',
    additionalProperties: false,
  },
  [HttpStatus.ServerError]: {
    type: 'object',
    description: 'Internal server error',
    additionalProperties: false,
    properties: {
      error: { type: 'string' },
    },
  },
} as const;
