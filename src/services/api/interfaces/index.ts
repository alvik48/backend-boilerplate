import { FastifyInstance, FastifyRegisterOptions } from 'fastify';

export interface RegisterPluginSpec {
  plugin: any;
  options: FastifyRegisterOptions<any>;
}

export type RoutesSpec = Record<string, Record<string, (fastify: FastifyInstance) => Promise<void>>>;
