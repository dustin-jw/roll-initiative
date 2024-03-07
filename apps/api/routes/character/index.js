'use strict';

const getCharacter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, initiative, hitPoints FROM characters WHERE id = $id',
      { $id: id },
      (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      }
    );
  });
};

module.exports = async function (fastify, { db }) {
  fastify.get('/:id', async function (request, reply) {
    try {
      const { id } = request.params;
      const result = await getCharacter(db, id);

      if (result == null) {
        reply.code(404);
        return null;
      }

      return result;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
