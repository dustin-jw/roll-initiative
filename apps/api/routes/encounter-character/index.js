'use strict';

const getCharacterInEncounter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, name, hitPoints, initiative FROM encounter_characters WHERE id = $id',
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

const addCharacterToEncounter = (db, { userId, encounterId, name, initiative, hitPoints }) => {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      'INSERT INTO encounter_characters VALUES ($id, $userId, $encounterId, $name, $initiative, $hitPoints);',
      {
        $id: id,
        $userId: userId,
        $encounterId: encounterId,
        $name: name,
        $initiative: initiative,
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

const updateCharacterInEncounter = (db, { id, name, hitPoints, initiative }) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE encounter_characters
      SET name = $name, hitPoints = $hitPoints, initiative = $initiative
      WHERE id = $id;`,
      {
        $id: id,
        $name: name,
        $hitPoints: hitPoints,
        $initiative: initiative,
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

const removeCharacterFromEncounter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM encounter_characters WHERE id = $id', { $id: id }, (err) => {
      if (err) {
        return reject(err);
      }

      resolve();
    });
  });
};

module.exports = async function (fastify, { db }) {
  fastify.post('/', async function (request, reply) {
    try {
      const { userId, encounterId, name, hitPoints, initiative } = request.body;
      const characterId = await addCharacterToEncounter(db, {
        userId,
        encounterId,
        name,
        hitPoints,
        initiative,
      });
      const result = await getCharacterInEncounter(db, characterId);

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
      const { id, name, hitPoints, initiative } = request.body;
      await updateCharacterInEncounter(db, { id, name, hitPoints, initiative });
      const result = await getCharacterInEncounter(db, id);

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
      const character = await getCharacterInEncounter(db, id);

      if (character == null) {
        reply.code(404);
        return null;
      }

      await removeCharacterFromEncounter(db, id);

      reply.code(204);
      return null;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
