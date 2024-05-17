'use strict';

const getCharacter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, name, hitPoints FROM characters WHERE id = $id', { $id: id }, (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
};

const createCharacter = (db, { userId, name, hitPoints }) => {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      'INSERT INTO characters VALUES ($id, $userId, $name, $hitPoints);',
      {
        $id: id,
        $userId: userId,
        $name: name,
        $hitPoints: hitPoints,
      },
      (err) => {
        if (err) {
          return reject(err);
        }

        resolve(id);
      }
    );
  });
};

const updateCharacter = (db, { id, name, hitPoints }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE characters
      SET name = $name, hitPoints = $hitPoints
      WHERE id = $id;`,
      {
        $id: id,
        $name: name,
        $hitPoints: hitPoints,
      },
      (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
};

const deleteCharacter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM characters WHERE id = $id', { $id: id }, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
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

  fastify.post('/', async function (request, reply) {
    try {
      const { userId, name, hitPoints } = request.body;
      const characterId = await createCharacter(db, { userId, name, hitPoints });
      const result = await getCharacter(db, characterId);

      if (result == null) {
        reply.code(404);
        return null;
      }

      return result;
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        reply.type('application/json').code(400);
        return error;
      }

      reply.type('application/json').code(500);
      return error;
    }
  });

  fastify.patch('/', async function (request, reply) {
    try {
      const { id, name, hitPoints } = request.body;
      await updateCharacter(db, { id, name, hitPoints });
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

  fastify.delete('/:id', async function (request, reply) {
    try {
      const { id } = request.params;
      await deleteCharacter(db, id);

      reply.code(204);
      return null;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
