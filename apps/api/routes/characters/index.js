'use strict';

const getCharacters = (db, userId) => {
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT id, name, initiative, hitPoints FROM characters WHERE userId = $userId',
      { $userId: userId },
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
};

module.exports = async function (fastify, { db }) {
  fastify.get('/:userId', async function (request, reply) {
    try {
      const { userId } = request.params;
      const result = await getCharacters(db, userId);

      return result;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
