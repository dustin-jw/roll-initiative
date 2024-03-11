'use strict';

const getEncounter = (db, id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `
    SELECT encounter_characters.id, encounters.name, characters.id as characterId, characters.name, characters.hitPoints, characters.initiative
    FROM encounters
    INNER JOIN encounter_characters ON encounters.id = encounter_characters.encounterId
    INNER JOIN characters ON characters.id = encounter_characters.characterId
    WHERE encounters.id = $id
    ORDER BY characters.initiative DESC
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
};
