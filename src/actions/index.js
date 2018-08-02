/**
 * Created by florinpopa on 14/06/2018.
 */
const app = require('./app');
const user = require('./user');
const outbreak = require('./outbreak');
const cases = require('./cases');
const followUps = require('./followUps');
const contacts = require('./contacts');
const events = require('./events');
const errors = require('./errors');
const referenceData = require('./referenceData');

module.exports = Object.assign({}, app, user, outbreak, cases, followUps, contacts, events, errors, referenceData);