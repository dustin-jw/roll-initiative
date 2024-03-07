'use strict';

module.exports = async function (fastify, { db }) {
  fastify.get('/', async function (request, reply) {
    return {id: crypto.randomUUID()};
  });
};
