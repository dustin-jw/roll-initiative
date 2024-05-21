'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

const { users } = require('./seed-data/users');
const { characters } = require('./seed-data/characters');
const { encounters, encounterCharacters } = require('./seed-data/encounters');

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  db.serialize(() => {
    db.run(`CREATE TABLE users (
      id TEXT PRIMARY KEY
    );`);

    users.forEach(({ id }) => {
      db.run('INSERT INTO users VALUES ($id);', { $id: id });
    });

    db.run(`CREATE TABLE characters (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      hitPoints INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );`);

    characters.forEach(({ id, userId, name, hitPoints }) => {
      db.run('INSERT INTO characters VALUES ($id, $userId, $name, $hitPoints);', {
        $id: id,
        $userId: userId,
        $name: name,
        $hitPoints: hitPoints,
      });
    });

    db.run(`CREATE TABLE encounters (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    );`);

    encounters.forEach(({ id, userId, name }) => {
      db.run('INSERT INTO encounters VALUES ($id, $userId, $name);', {
        $id: id,
        $userId: userId,
        $name: name,
      });
    });

    db.run(`CREATE TABLE encounter_characters (
      id TEXT PRIMARY KEY,
      userId TEXT,
      encounterId TEXT,
      characterId TEXT,
      initiative INTEGER,
      hitPoints INTEGER,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(encounterId) REFERENCES encounters(id),
      FOREIGN KEY(characterId) REFERENCES characters(id)
    );`);

    encounterCharacters.forEach(({ id, userId, encounterId, characterId, initiative, hitPoints }) => {
      db.run(
        'INSERT INTO encounter_characters VALUES ($id, $userId, $encounterId, $characterId, $initiative, $hitPoints);',
        {
          $id: id,
          $userId: userId,
          $encounterId: encounterId,
          $characterId: characterId,
          $initiative: initiative,
          $hitPoints: hitPoints,
        }
      );
    });
  });

  // Do not touch the following lines

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({ db }, opts),
  });
};

module.exports.options = options
