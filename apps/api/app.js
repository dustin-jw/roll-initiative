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
    db.run('CREATE TABLE lorem (info TEXT)');

    const stmt = db.prepare('INSERT INTO lorem VALUES (?)');
    for (let i = 0; i < 10; i++) {
      stmt.run('Ipsum ' + i);
    }
    stmt.finalize();
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
