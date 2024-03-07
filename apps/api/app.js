'use strict'

const path = require('node:path')
const AutoLoad = require('@fastify/autoload')
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(':memory:');

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {
  // Place here your custom code!
  db.serialize(() => {
    db.run(`CREATE TABLE characters (
      id TEXT PRIMARY KEY,
      name TEXT,
      initiative INTEGER,
      hitPoints INTEGER
    );`);

    db.run('INSERT INTO characters VALUES ($id, $name, $initiative, $hitPoints)', {
      $id: 'fb6255a0-583a-4978-8983-f6c8d4ceae98',
      $name: 'Barry',
      $initiative: 18,
      $hitPoints: 142,
    });

    db.run('INSERT INTO characters VALUES ($id, $name, $initiative, $hitPoints)', {
      $id: 'fd40198d-a9e5-4a3b-8018-324b34d59384',
      $name: 'Sena',
      $initiative: 11,
      $hitPoints: 153,
    });
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({ db }, opts),
  });
};

module.exports.options = options
