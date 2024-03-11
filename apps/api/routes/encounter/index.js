'use strict';

const getEncounter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `
    SELECT encounter_characters.id, encounters.name, characters.name, encounter_characters.hitPoints, encounter_characters.initiative
    FROM encounters
    INNER JOIN encounter_characters ON encounters.id = encounter_characters.encounterId
    INNER JOIN characters ON characters.id = encounter_characters.characterId
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

      return encounterId;
    } catch (error) {
      reply.type('application/json').code(500);
      return error;
    }
  });
};
