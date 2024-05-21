'use strict';

const doesEncounterExist = (db, id) => {
  return new Promise((resolve, reject) => {
    db.get(
      `
    SELECT id, name
    FROM encounters
    WHERE encounters.id = $id
    `,
      { $id: id },
      (err, row) => {
        if (err) {
          return reject(err);
        }
        return resolve(!!row);
      }
    );
  });
};

const getEncounter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `
    SELECT
      encounters.id as encounterId,
      encounter_characters.id as characterId,
      encounters.name as encounterName,
      encounter_characters.name as characterName,
      encounter_characters.hitPoints,
      encounter_characters.initiative
    FROM encounters
    INNER JOIN encounter_characters ON encounters.id = encounter_characters.encounterId
    WHERE encounters.id = $id
    ORDER BY encounter_characters.initiative DESC
    `,
      { $id: id },
      (err, rows) => {
        if (err) {
          return reject(err);
        }
        resolve(rows);
      }
    );
  });
};

const createEncounter = (db, { userId, name }) => {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();
    db.run(
      'INSERT INTO encounters VALUES ($id, $userId, $name);',
      {
        $id: id,
        $userId: userId,
        $name: name,
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

module.exports = async function (fastify, { db }) {
  fastify.get('/:id', async function (request, reply) {
    try {
      const { id } = request.params;
      const result = await getEncounter(db, id);

      if (!result.length) {
        const encounterExists = await doesEncounterExist(db, id);

        if (!encounterExists) {
          reply.code(404);
          return null;
        }
      }

      return result;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });

  fastify.post('/', async function (request, reply) {
    try {
      const { userId, name } = request.body;
      const encounterId = await createEncounter(db, { userId, name });

      return { id: encounterId };
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        reply.type('application/json').code(400);
        return error;
      }

      reply.type('application/json').code(500);
      return error;
    }
  });
};
