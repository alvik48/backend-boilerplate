import NodeCache from 'node-cache';

const jwtCache = new NodeCache({
  stdTTL: 24 * 60 * 60 * 1000,
});

export default jwtCache;
