'use strict'

const getAllRows = (db) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT rowid AS id, info FROM lorem', (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
};

module.exports = async function (fastify, { db }) {
  fastify.get('/', async function (request, reply) {
    try {
      const result = await getAllRows(db);
      return result;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
